# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

HEADER = re.compile(r"^(?:[1-9](?:st|nd|rd|th)-level\s+\w+|\w+\s+cantrip)(?:\s*\([^)]*\))?$", re.I)
FIELD = re.compile(r"^(Classes|Casting Time|Range|Components|Duration):\s*(.*)$")
ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]


def markdown_table(rows):
    """Preserve table cells and their source order in a display-only Markdown grid."""
    width = max(len(row) for row in rows)
    output = ["| " + " | ".join((row[i] or "").replace("\n", " ").replace("|", "\\|") if i < len(row) else "" for i in range(width)) + " |" for row in rows]
    output.insert(1, "| " + " | ".join(["---"] * width) + " |")
    return "\n".join(output)


def read_lines(document):
    """Read this book's columns and tables independently, preserving physical-page provenance."""
    result = []
    for page_index, page in enumerate(document):
        data = page.get_text("dict", flags=fitz.TEXTFLAGS_DICT & ~fitz.TEXT_PRESERVE_IMAGES)
        lines = []
        tables = []
        for table in page.find_tables().tables:
            rows = table.extract()
            # Framed summon stat blocks are not data tables; their first cell is blank.
            if rows and len(rows[0]) >= 2 and all(cell and cell.strip() for cell in rows[0]):
                tables.append((table.bbox, rows))
        for block in data["blocks"]:
            for line in block.get("lines", []):
                text = "".join(span["text"] for span in line["spans"]).strip()
                if not text:
                    continue
                x0, y0, x1, y1 = line["bbox"]
                if (y0 < page.rect.height * 0.08 or y0 > page.rect.height * 0.9) and re.fullmatch(r"\d+", text):
                    continue
                if any(box[0] <= (x0+x1)/2 <= box[2] and box[1] <= (y0+y1)/2 <= box[3] for box, _ in tables):
                    continue
                lines.append({"text": text, "page": page_index + 1, "bbox": [x0, y0, x1, y1],
                              "fonts": list({span["font"] for span in line["spans"]}),
                              "size": max(span["size"] for span in line["spans"])})
        for box, rows in tables:
            lines.append({"text": markdown_table(rows), "page": page_index + 1, "bbox": list(box), "fonts": [], "size": 0, "table": True})
        chapters = [line for line in lines if line["size"] >= 24]
        result.extend(sorted(chapters, key=lambda line: (line["bbox"][1], line["bbox"][0])))
        for column in [0, 1]:
            selected = [line for line in lines if line not in chapters and int((line["bbox"][0]+line["bbox"][2])/2 >= page.rect.width/2) == column]
            result.extend(sorted(selected, key=lambda line: (round(line["bbox"][1], 1), line["bbox"][0])))
    return result


def prose(lines):
    """Normalize wrapping without changing source values, bullets, or extracted tables."""
    paragraphs = []
    pending = ""
    previous = None
    for line in lines:
        text = line["text"]
        bullet = text.startswith("•")
        separated = previous is not None and line["page"] == previous["page"] and line["bbox"][1] - previous["bbox"][3] > 4
        if bullet or separated or line.get("table") or text.startswith("At Higher Levels."):
            if pending:
                paragraphs.append(pending)
            pending = ""
        if line.get("table"):
            paragraphs.append(text)
            previous = line
            continue
        if text.startswith("•"):
            text = "- " + text[1:].strip()
        if pending.endswith("-") and not pending.endswith(" -"):
            pending = pending[:-1] + text
        else:
            pending += (" " if pending else "") + text
        previous = line
    if pending:
        paragraphs.append(pending)
    return "\n\n".join(paragraphs)


def stat_text(lines):
    """Keep summon ability-score rows aligned and retain the remaining stat block as prose."""
    output = []
    i = 0
    while i < len(lines):
        if [line["text"] for line in lines[i:i+6]] == ABILITIES and len(lines[i+6:i+12]) == 6:
            table = {**lines[i], "table": True, "text": markdown_table([ABILITIES, [line["text"] for line in lines[i+6:i+12]]])}
            output.append(table)
            i += 12
        else:
            output.append(lines[i])
            i += 1
    return "## " + prose(output)


def referenced_stat_blocks(spell_name, text, stats):
    """Attach explicit named references or the spell's same-name following-stats block."""
    return [stat for stat in stats if ("stat block" in text.lower() and stat["name"].lower() in text.lower())
            or (stat["name"] == spell_name and "following stats" in text.lower())]


def extract(path):
    """Extract every spell header, appendix, and associated summon block from the v2.3 PDF."""
    with fitz.open(path) as document:
        lines = read_lines(document)
        evidence = "\n".join(page.get_text() for page in list(document)[:3])
        if not all(term in evidence for term in ["Kibbles", "Creative Commons", "Spells", "Homebrew LLC"]):
            raise ValueError("Publisher licensing evidence changed; review the PDF before importing")
        starts = [i for i in range(len(lines)-1) if HEADER.fullmatch(lines[i+1]["text"])]
        chapters = [i for i, line in enumerate(lines) if line.get("size", 0) >= 24]
        stat_starts = [i for i in range(len(lines)-1) if i not in starts and any("AGaramondPro-Bold-SC700" in font for font in lines[i].get("fonts", []))
                       and re.match(r"^(?:Tiny|Small|Medium|Large|Huge|Gargantuan)\b", lines[i+1]["text"], re.I)]
        boundaries = sorted(starts + chapters + stat_starts + [len(lines)])
        stats = [{"name": lines[i]["text"], "start": i, "end": next(end for end in boundaries if end > i)} for i in stat_starts]
        for stat in stats:
            stat["text"] = stat_text(lines[stat["start"]:stat["end"]])
        blocks = []
        attached = set()
        for ordinal, start in enumerate(starts):
            raw_name = lines[start]["text"]
            name = raw_name[:-3].strip() if raw_name.endswith("SMS") else raw_name
            end = starts[ordinal+1] if ordinal+1 < len(starts) else len(lines)
            end = min([end] + [chapter for chapter in chapters if start < chapter < end])
            entry = [(i, lines[i]) for i in range(start+2, end) if not any(stat["start"] <= i < stat["end"] for stat in stats)]
            fields = {}
            current = None
            body_start = None
            issues = []
            for pos, (_, line) in enumerate(entry):
                match = FIELD.fullmatch(line["text"])
                if match:
                    current = match[1]
                    if current in fields:
                        issues.append(f"Duplicate metadata: {current}")
                    fields[current] = match[2]
                elif current == "Duration":
                    body_start = pos
                    break
                elif current:
                    fields[current] += " " + line["text"]
                else:
                    issues.append(f"Unexpected metadata: {line['text']}")
                    break
            body = [line for _, line in entry[body_start:]] if body_start is not None else []
            credit_at = next((i for i, line in enumerate(body) if line["text"] == "SMS Credit"), len(body))
            credit_evidence = prose(body[credit_at:])
            body = body[:credit_at]
            omitted = [line['text'] for line in body if line['text'].startswith('Art:')]
            body = [line for line in body if not line['text'].startswith('Art:')]
            text = prose(body)
            referenced = referenced_stat_blocks(name, text, stats)
            for stat in referenced:
                text += "\n\n" + stat["text"]
                attached.add(stat["name"])
            if body_start is None:
                issues.append("Missing metadata/body boundary")
            blocks.append({"name": name, "rawName": raw_name, "sourcePage": lines[start]["page"], "header": lines[start+1]["text"],
                           "fields": fields, "text": text, "removedAdvice": [], "rawLines": lines[start:end], "extractionIssues": issues,
                           "attachedStatBlocks": [stat["name"] for stat in referenced], "omittedParatext": omitted,
                           "creditedSource": "So Many Spells" if raw_name.endswith("SMS") else None, "creditEvidence": credit_evidence})
        if not blocks:
            raise ValueError("No spell blocks found")
        return {"version": "2.3", "scope": "all-spells", "pdfPages": len(document), "detectedHeaders": len(starts),
                "sha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(), "licenseEvidence": evidence, "blocks": blocks,
                "unattachedStatBlocks": [stat["name"] for stat in stats if stat["name"] not in attached], "statBlocks": stats}


def main():
    """Write the full reproducible source snapshot without changing published mechanics."""
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("output")
    args = parser.parse_args()
    snapshot = extract(args.pdf)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2))
    print(f"Extracted {len(snapshot['blocks'])} v2.3 spell blocks from {snapshot['pdfPages']} PDF pages → {out}")


if __name__ == "__main__":
    main()
