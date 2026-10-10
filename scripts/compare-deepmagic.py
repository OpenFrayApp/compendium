# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
from concurrent.futures import ProcessPoolExecutor
from difflib import SequenceMatcher
import hashlib
import json
from pathlib import Path
import re

from deepmagic import PDF_SHA256, ordered_review_lines

CANDIDATE_SHA256 = "29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6"
CORRECTED_SHA256 = "12b17d8c76deb0d6169b5ae5d46c5a7f98f205870ba64df464f85efc1bd9d0c7"


def snapshot_details(content):
    """Identify a pinned review snapshot and keep original and corrected reports separate."""
    digest = hashlib.sha256(content).hexdigest()
    if digest == CANDIDATE_SHA256:
        return digest, "body-comparison.json"
    if digest == CORRECTED_SHA256:
        return digest, "corrected-body-comparison.json"
    raise ValueError("Candidate snapshot changed")


def normalized(text):
    """Remove display markup and punctuation for advisory mechanics-text comparison."""
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    return re.sub("[^a-z0-9]", "", text.lower())


def source_body(text, columns, number, column, start):
    """Bound an anchored excerpt using candidate-tail leads, without approving its text."""
    source = columns[(number, column)][start:]
    if column == 0:
        source += columns.get((number, 1), "")
    source += columns.get((number + 1, 0), "") + columns.get((number + 1, 1), "")
    source = source[:int(len(text) * 1.5) + 400]
    ends = []
    for back in range(0, min(len(text) - 23, 80), 4):
        end = len(text) - back
        found = source.find(text[end - 24:end], max(0, len(text) // 2))
        if found >= 0:
            ends.append(found + 24 + back)
    return source[:min(ends, key=lambda end: abs(end - len(text)))] if ends else source[:len(text)]


def compare_spell(args):
    """Expose OCR differences without correcting source prose or granting publication approval."""
    spell, columns, proposed = args
    text = normalized(spell["text"])
    anchors = []
    for number in proposed:
        for column in [0, 1]:
            source = columns.get((number, column), "")
            for offset in range(0, min(len(text) - 23, 80), 4):
                needle = text[offset:offset + 24]
                found = source.find(needle)
                matched = found >= 0
                while found >= 0:
                    start = max(0, found - offset)
                    ratio = SequenceMatcher(None, text[:180], source[start:start + 200], autojunk=False).ratio()
                    anchors.append((ratio, number, column, start))
                    found = source.find(needle, found + 1)
                if matched:
                    break
    if not anchors:
        return {"name": spell["name"], "status": "pending-visual-review", "error": "No opening anchor"}
    target_grams = {text[i:i + 5] for i in range(len(text) - 4)}
    def rank_excerpt(item):
        anchor, excerpt = item
        grams = {excerpt[i:i + 5] for i in range(len(excerpt) - 4)}
        overlap = 2 * len(target_grams & grams) / max(1, len(target_grams) + len(grams))
        return overlap, anchor[0], anchor
    excerpts = [(anchor, source_body(text, columns, *anchor[1:])) for anchor in set(anchors)]
    anchor, source = max(excerpts, key=rank_excerpt)
    confidence, number, column, start = anchor
    matcher = SequenceMatcher(None, text, source, autojunk=False)
    differences = [{"kind": kind, "candidate": text[a:b], "ocr": source[c:d]}
                   for kind, a, b, c, d in matcher.get_opcodes() if kind != "equal"]
    return {"name": spell["name"], "status": "pending-visual-review", "physicalPage": number,
            "column": column, "openingSimilarity": round(confidence, 3),
            "bodySimilarity": round(matcher.ratio(), 3), "differences": differences,
            "notice": "OCR errors, editorial markup, and boundary errors must be checked visually."}


def main():
    """Compare every pinned candidate to OCR evidence while keeping all publication gates closed."""
    parser = argparse.ArgumentParser(description="Expose Deep Magic candidate/OCR mechanics differences.")
    parser.add_argument("candidates")
    parser.add_argument("review")
    args = parser.parse_args()
    content = Path(args.candidates).read_bytes()
    candidate_hash, report_name = snapshot_details(content)
    spells = json.loads(content)
    root = Path(args.review)
    locations = {row["name"]: row["physicalPages"] for row in json.loads((root / "audit.json").read_text())["candidates"]}
    columns = {}
    for path in root.glob("page-*.json"):
        page = json.loads(path.read_text())
        if page.get("sourceSha256") != PDF_SHA256 or page.get("publishable") is not False:
            raise ValueError("Foreign source evidence")
        number = page["physicalPage"]
        if 34 <= number <= 354:
            for column in [0, 1]:
                columns[(number, column)] = normalized(" ".join(row["t"] for row in ordered_review_lines(page) if row["column"] == column))
    jobs = [(spell, columns, sorted({number + delta for number in locations[spell["name"]] for delta in [-1, 0, 1]})) for spell in spells]
    results = []
    with ProcessPoolExecutor(max_workers=4) as pool:
        for result in pool.map(compare_spell, jobs):
            results.append(result)
            print(f"{len(results)}/{len(spells)} body-text comparisons: {result['name']}", flush=True)
    (root / report_name).write_text(json.dumps({
        "publishable": False, "approvedCount": 0, "sourcePdfSha256": PDF_SHA256,
        "candidateSha256": candidate_hash,
        "scriptSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "candidates": results,
    }, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
