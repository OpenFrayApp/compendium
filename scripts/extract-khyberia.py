# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

SIZE = re.compile(r"^(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+.+,", re.I)
FIELD = re.compile(r"^(Armor Class|Hit Points|Speed|Saving Throws|Skills|Damage Vulnerabilities|Damage Resistances|Damage Immunities|Condition Immunities|Senses|Languages|Challenge)\b")
SECTIONS = {"Actions", "Bonus Actions", "Reactions"}
GROUPS = {"Frogoblins", "Hedrons", "Koaxians", "Other Monsters"}


def page_lines(page):
    """Read Khyberia's content-stream lines and leading bold text without page furniture."""
    rows = []
    flags = fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_LIGATURES
    for block in page.get_text("dict", flags=flags)["blocks"]:
        for line in block.get("lines", []):
            spans = line["spans"]
            text = "".join(span["text"] for span in spans).strip()
            if not text or (text.isdigit() and line["bbox"][1] > page.rect.height - 50):
                continue
            leading = ""
            for span in spans:
                if span["flags"] & 16:
                    leading += span["text"]
                else:
                    break
            rows.append({"text": text, "leading": leading.strip(), "page": page.number + 1})
    return rows


def joined(lines):
    """Join wrapped prose while preserving numeric hyphenated measurements."""
    return re.sub(r"(\d)-\s+(?=[a-z])", r"\1-", " ".join(lines)).strip()


def extract_rows(rows):
    """Split the October Khyberia layout into shared 2014-format creature blocks."""
    blocks = []
    block = None
    section = None
    entry = None
    pending = []
    table = None
    i = 0
    while i < len(rows):
        row = rows[i]
        text = row["text"]
        if text in GROUPS:
            block = None
            entry = None
            pending = []
            table = None
        elif i + 1 < len(rows) and SIZE.match(rows[i + 1]["text"]):
            block = {"name": text, "sourcePage": row["page"], "header": [], "traits": [], "sections": {}}
            blocks.append(block)
            section = None
            entry = None
            pending = []
            table = None
            i += 1
            size = rows[i]["text"]
            if re.search(r",\s*(Chaotic|Lawful|Neutral)\s*$", size, re.I) and i + 1 < len(rows) and rows[i + 1]["text"].lower() in {"neutral", "evil", "good"}:
                i += 1
                size += " " + rows[i]["text"]
            block["header"].append(size)
        elif block:
            if text == "Chaos Swell":
                table = {"name": "Chaos Swell table", "text": ""}
                block["traits"].append(table)
                entry = None
            elif table:
                table["text"] = joined([table["text"], text])
            elif text in SECTIONS:
                section = text
                block["sections"].setdefault(section, [])
                entry = None
            elif (section is None and entry is None and not pending and (FIELD.match(text) or re.fullmatch(r"(?:STR|DEX|CON|INT|WIS|CHA)(?:\s+(?:STR|DEX|CON|INT|WIS|CHA))*", text) or not row["leading"])):
                block["header"].append(text)
            elif row["leading"] and not FIELD.match(text):
                if pending or "." in row["leading"] or row["leading"] == text:
                    pending.append(text)
                    candidate = joined(pending)
                    # Recharge headings wrap before their closing parenthesis and period.
                    match = re.match(r"^(.+?\.(?:\s|$))(.*)$", candidate)
                    if match and match[1].count("(") == match[1].count(")"):
                        name = match[1].strip().removesuffix(".")
                        entry = {"name": name, "text": match[2].strip()}
                        target = block["traits"] if section is None else block["sections"][section]
                        target.append(entry)
                        pending = []
                elif entry:
                    entry["text"] = joined([entry["text"], text])
                else:
                    raise ValueError(f"Unclassified bold line on page {row['page']}: {text}")
            elif pending:
                raise ValueError(f"Incomplete entry heading on page {row['page']}: {pending}")
            elif entry:
                entry["text"] = joined([entry["text"], text])
            else:
                raise ValueError(f"Unclassified line on page {row['page']}: {text}")
        i += 1
    if pending:
        raise ValueError(f"Incomplete final heading: {pending}")
    if not blocks or len({block['name'] for block in blocks}) != len(blocks):
        raise ValueError("Empty or duplicate creature extraction")
    for block in blocks:
        header = " ".join(block["header"])
        if not all(field in header for field in ["Armor Class", "Hit Points", "Speed", "Challenge"]):
            raise ValueError(f"Missing core field for {block['name']}")
        if len(re.findall(r"\d+\s*\([+−–-]\d+\)", header)) != 6:
            raise ValueError(f"Incomplete ability table for {block['name']}")
        if not block["sections"].get("Actions"):
            raise ValueError(f"Missing actions for {block['name']}")
    return blocks


def extract_pdf(path):
    """Extract creature blocks and retain the supplied PDF's legal notice and digest."""
    with fitz.open(path) as document:
        rows = [row for page in document for row in page_lines(page)]
        legal = "\n".join(row["text"] for row in page_lines(document[0]))
        if "Khyberia" not in legal or "CC-BY-4.0" not in legal:
            raise ValueError("The supplied PDF lacks the expected Khyberia CC-BY-4.0 notice")
        return {
            "source": "khyberia-srd",
            "sha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(),
            "pages": len(document),
            "legal": legal.strip(),
            "blocks": extract_rows(rows),
        }


def main():
    """Write a local Khyberia extraction snapshot from a supplied licensed PDF."""
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("output")
    args = parser.parse_args()
    snapshot = extract_pdf(args.pdf)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extracted {len(snapshot['blocks'])} Khyberia creatures to {args.output}")


if __name__ == "__main__":
    main()
