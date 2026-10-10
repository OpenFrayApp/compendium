# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re

from deepmagic import PDF_SHA256, ordered_review_lines

CANDIDATE_SHA256 = "29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6"
CLASS_STARTS = {
    (7, 1): ("Bard", "Abhorrence"),
    (10, 0): ("Cleric", "Abhorrence"),
    (13, 1): ("Druid", "Abhorrence"),
    (16, 1): ("Paladin", "Ancestor’s strength"),
    (17, 1): ("Ranger", "Agonizing mark"),
    (19, 0): ("Sorcerer", "Abhorrence"),
    (23, 1): ("Warlock", "Bless the dead"),
    (27, 0): ("Wizard", "Abhorrence"),
}


def normalized(text):
    """Ignore whitespace and punctuation only for advisory OCR matching."""
    return re.sub("[^a-z0-9]", "", text.lower())


def read_pages(directory):
    """Reject foreign PDF evidence before using the source review cache."""
    pages = {}
    for file in Path(directory).glob("page-*.json"):
        page = json.loads(file.read_text())
        if (page.get("sourceSha256") != PDF_SHA256
                or page.get("extraction") != "ocr-columns-300dpi-v1"
                or page.get("publishable") is not False):
            raise ValueError(f"Unrecognized review evidence: {file}")
        number = page["physicalPage"]
        if number in pages:
            raise ValueError(f"Duplicate physical page: {number}")
        pages[number] = page
    if not pages:
        raise ValueError("No page evidence")
    return pages


def class_suggestions(pages, spells):
    """Match exact normalized list entries within visually verified class boundaries."""
    names = {normalized(spell["name"]): spell["name"] for spell in spells}
    found = {spell["name"]: set() for spell in spells}
    current = None
    for number in range(7, 34):
        page = {**pages[number], "lines": ordered_review_lines(pages[number])}
        for column in [0, 1]:
            start = CLASS_STARTS.get((number, column))
            switched = False
            for row in page["lines"]:
                if row["column"] != column:
                    continue
                title = normalized(row["t"].split("(")[0])
                if start and not switched and title == normalized(start[1]):
                    current = start[0]
                    switched = True
                if current and "(" in row["t"] and title in names:
                    found[names[title]].add(current)
            if start and not switched:
                raise ValueError(f"Class boundary missing: page {number}, column {column}")
    return {name: sorted(classes) for name, classes in found.items()}


def page_suggestions(pages, spells):
    """Rank candidate page matches without treating OCR similarity as publication approval."""
    index = defaultdict(set)
    for number, page in pages.items():
        if number < 34 or number > 354:
            continue
        text = normalized(" ".join(row["t"] for row in ordered_review_lines(page)))
        for offset in range(len(text) - 15):
            index[text[offset:offset + 16]].add(number)
    suggestions = {}
    for spell in spells:
        text = normalized(spell["text"])
        grams = {text[offset:offset + 16] for offset in range(0, len(text) - 15, 8)}
        counts = Counter()
        for gram in grams:
            counts.update(index[gram])
        best = counts.most_common(3)
        suggestions[spell["name"]] = {
            "physicalPages": [number for number, count in best],
            "bestPageOverlap": round(best[0][1] / len(grams), 3) if best else 0,
        }
    return suggestions


def audit(content, pages):
    """Keep every candidate pending while recording source-backed review leads."""
    if hashlib.sha256(content).hexdigest() != CANDIDATE_SHA256:
        raise ValueError("Candidate snapshot changed; renew source review")
    spells = json.loads(content)
    if (len(spells) != 515 or len({spell["id"] for spell in spells}) != 515
            or any(spell["source"] != "kobold-press-deepm" or spell.get("mechanics") for spell in spells)):
        raise ValueError("Candidate scope changed")
    classes = class_suggestions(pages, spells)
    locations = page_suggestions(pages, spells)
    return {
        "publishable": False,
        "sourcePdfSha256": PDF_SHA256,
        "candidateSha256": CANDIDATE_SHA256,
        "count": len(spells),
        "approvedCount": 0,
        "notice": "OCR matches and class suggestions are advisory, not source approval.",
        "candidates": [{
            "id": spell["id"], "name": spell["name"], "status": "pending-source-review",
            **locations[spell["name"]],
            "apiClasses": spell.get("classes", []),
            "bookClassSuggestions": classes[spell["name"]],
            "missingApiClasses": not bool(spell.get("classes")),
            "componentWarning": bool(spell["components"]["material"]) != bool(spell["components"].get("materials")),
        } for spell in spells],
    }


def main():
    """Write an advisory review report without changing or exporting spell cards."""
    parser = argparse.ArgumentParser(description="Audit the pinned 515 Deep Magic 2020 candidates.")
    parser.add_argument("candidates")
    parser.add_argument("pages")
    parser.add_argument("output")
    args = parser.parse_args()
    report = audit(Path(args.candidates).read_bytes(), read_pages(args.pages))
    destination = Path(args.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{report['count']} candidates audited; zero approved; report: {destination}")


if __name__ == "__main__":
    main()
