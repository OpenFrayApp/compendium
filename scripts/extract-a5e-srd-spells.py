# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

"""Read the publisher's A5ESRD spell chapter with its own Arial font filters."""

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz

SOURCE = "en-publishing-a5e-ag"
FIELDS = (
    "Classes",
    "Casting Time",
    "Range",
    "Target",
    "Area",
    "Components",
    "Duration",
    "Saving Throw",
    "Attack Roll",
)
FIELD = re.compile(r"^(" + "|".join(FIELDS) + r"): ?(.*)$")


def lines_of(pdf):
    """Read the chapter's two columns in page order, excluding its nine-point footer."""
    lines = []
    for page_number, page in enumerate(pdf, 1):
        page_lines = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                spans = [s for s in line["spans"] if s["size"] >= 10]
                if not spans:
                    continue
                text = "".join(s["text"] for s in spans).strip()
                if text:
                    x, y, _, bottom = line["bbox"]
                    page_lines.append(
                        {
                            "text": text,
                            "page": page_number,
                            "column": int(x >= 300),
                            "x": x,
                            "y": y,
                            "bottom": bottom,
                            "heading": all(19 < s["size"] < 21 for s in spans),
                        }
                    )
        lines.extend(sorted(page_lines, key=lambda line: (line["column"], line["y"])))
    return lines


def normalized_name(value):
    """Match publisher apostrophes and spacing without changing the displayed title."""
    return re.sub(r"[^a-z0-9]", "", value.lower())


def spell_blocks(lines, known_names):
    """Group twenty-point spell titles and their complete rule text after the Spells heading."""
    blocks = []
    active = False
    current = None
    for index, line in enumerate(lines):
        if line["page"] == 6 and line["text"] == "Spells":
            active = True
            continue
        if not active:
            continue
        following = lines[index + 1]["text"] if index + 1 < len(lines) else ""
        corrected_heading = normalized_name(line["text"]) in known_names and bool(
            re.match(r"(?:[1-9].*-level|Cantrip)", following, re.I)
        )
        if line["heading"] or corrected_heading:
            if current and not current["lines"]:
                current["name"] += " " + line["text"]
            else:
                current = {"name": line["text"], "page": line["page"], "lines": []}
                blocks.append(current)
        elif current:
            current["lines"].append(line)
    return blocks


def paragraphs(lines):
    """Preserve paragraph gaps and bullet lines while joining PDF line wraps."""
    groups = []
    current = []
    previous = None
    for line in lines:
        gap = (
            previous
            and line["page"] == previous["page"]
            and line["column"] == previous["column"]
            and line["y"] - previous["bottom"] > 7
        )
        bullet = line["text"].startswith(("●", "•")) or bool(
            re.match(r"^\d+ Rounds?:", line["text"], re.I)
        )
        indented = line["x"] > (324 if line["column"] else 72) + 5
        previous_indented = (
            previous and previous["x"] > (324 if previous["column"] else 72) + 5
        )
        starts_paragraph = (
            indented
            and not previous_indented
            and previous
            and not previous["text"].startswith(("●", "•"))
        )
        if (gap or bullet or starts_paragraph) and current:
            groups.append(" ".join(current))
            current = []
        current.append(line["text"])
        previous = line
    if current:
        groups.append(" ".join(current))
    return "\n\n".join(groups)


def project(block, record):
    """Project publisher spell metadata and rules without creating automated mechanics."""
    lines = block["lines"]
    first = next((i for i, line in enumerate(lines) if FIELD.match(line["text"])), None)
    if first is None:
        raise ValueError("Missing metadata: " + block["name"])
    level_school = " ".join(line["text"] for line in lines[:first])
    match = re.search(
        r"(?:([1-9])(?:st|nd|rd|th|h)-level|Cantrip)\s*\(?([A-Za-z]+)",
        level_school,
        re.I,
    )
    if not match:
        raise ValueError("Unknown level/school: " + block["name"] + ": " + level_school)
    fields = {}
    last_field = None
    body_start = first
    for i in range(first, len(lines)):
        line = lines[i]
        field = FIELD.match(line["text"])
        if field:
            last_field = field[1]
            fields[last_field] = field[2]
        elif last_field:
            previous = lines[i - 1]
            gap = (
                line["page"] == previous["page"]
                and line["column"] == previous["column"]
                and line["y"] - previous["bottom"] > 7
            )
            open_parenthesis = fields[last_field].count("(") > fields[last_field].count(
                ")"
            )
            if gap or (
                last_field in ("Duration", "Saving Throw", "Attack Roll")
                and not open_parenthesis
            ):
                body_start = i
                break
            fields[last_field] += " " + line["text"]
        else:
            raise ValueError("Unexpected header: " + block["name"])
    required = ("Classes", "Casting Time", "Range", "Components", "Duration")
    if any(not fields.get(key) for key in required):
        raise ValueError("Incomplete metadata: " + block["name"] + ": " + repr(fields))
    components = fields["Components"]
    material = re.search(r"\bM\s*\((.*)\)", components)
    if re.search(r"\bM\b", components) and not material:
        raise ValueError("Unresolved material: " + block["name"] + ": " + components)
    duration = fields["Duration"]
    concentration = bool(re.match(r"Concentration", duration, re.I))
    if concentration:
        duration = (
            re.sub(r"^Concentration\s*\(?", "", duration, flags=re.I)
            .rstrip(")")
            .strip()
        )
    if concentration and not duration.lower().startswith("up to "):
        duration = "up to " + duration
    unmapped = [
        key + ": " + fields[key]
        for key in ("Target", "Area", "Saving Throw", "Attack Roll")
        if key in fields
    ]
    body = paragraphs(lines[body_start:])
    if not body:
        raise ValueError("Missing rules: " + block["name"])
    spell = {
        "id": SOURCE + ":" + record["key"].removeprefix("a5e-ag_"),
        "name": block["name"],
        "level": int(match[1] or 0),
        "school": match[2].strip().lower(),
        "classes": [part.strip().lower() for part in fields["Classes"].split(",")],
        "castingTime": fields["Casting Time"],
        "range": fields["Range"],
        "duration": duration,
        "concentration": concentration,
        "ritual": "ritual" in fields["Casting Time"].lower(),
        "components": {
            "verbal": bool(re.search(r"\bV\b", components)),
            "somatic": bool(re.search(r"\bS\b", components)),
            "material": bool(material),
        },
        "text": "\n\n".join([level_school] + unmapped + [body]),
        "source": SOURCE,
        "sourcePage": block["page"],
    }
    if material:
        spell["components"]["materials"] = material[1]
    return spell


def main():
    """Write reviewed publisher projections and record unresolved Open5e members separately."""
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    raw = json.loads(args.snapshot.read_text())
    records = {normalized_name(record["name"]): record for record in raw["records"]}
    with fitz.open(args.pdf) as pdf:
        blocks = spell_blocks(lines_of(pdf), records)
    spells = []
    matched = set()
    withheld = []
    for block in blocks:
        name = normalized_name(block["name"])
        if name not in records:
            continue
        if name in matched:
            raise ValueError("Duplicate publisher title: " + block["name"])
        matched.add(name)
        if name == "wish" and not any(
            line["text"].startswith("Range:") for line in block["lines"]
        ):
            withheld.append(
                {
                    "id": records[name]["key"],
                    "name": block["name"],
                    "reason": "Publisher SRD omits the required range field; the API's Self value cannot be verified against this chapter.",
                }
            )
            continue
        spells.append(project(block, records[name]))
    excluded = [
        {
            "id": record["key"],
            "name": record["name"],
            "reason": "Not present in the publisher's CC-BY A5ESRD spell chapter; API attribution does not authorize treating it as A5E material.",
        }
        for name, record in records.items()
        if name not in matched
    ]
    args.destination.mkdir(parents=True, exist_ok=True)
    (args.destination / "candidate-spells.json").write_text(
        json.dumps(spells, ensure_ascii=False, separators=(",", ":"))
    )
    report = {
        "source": SOURCE,
        "rawCount": len(records),
        "keptCount": len(spells),
        "excluded": excluded,
        "withheld": withheld,
        "publisherPdf": "https://a5esrd.com/s/a5e_srd_11.pdf",
        "publisherPdfSha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        "license": "cc-by-4.0",
        "ruleset": "a5e",
        "mechanics": "omitted",
        "sourcePageConvention": "Physical page in the publisher's 137-page spellcasting PDF.",
    }
    (args.destination / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
