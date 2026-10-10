# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
from concurrent.futures import ProcessPoolExecutor
import hashlib
import json
from pathlib import Path

import fitz
from toh import page_lines

PDF_SHA256 = "0f2e99f8184d8dbe93b9b1dcf0c90959cf7cd8c537d6ed327f1282e39fa486b8"


def column_clips(rect):
    """Separate the 2020 book's columns before OCR to prevent interleaved spell text."""
    return [fitz.Rect(rect.width * left, rect.height * 0.045,
                      rect.width * right, rect.height * 0.955)
            for left, right in [(0.045, 0.495), (0.505, 0.965)]]


def ordered_review_lines(page):
    """Rejoin OCR fragments on the same baseline before reading a book column."""
    ordered = []
    for column in [0, 1]:
        rows = sorted((row for row in page["lines"] if row["column"] == column),
                      key=lambda row: (row["top"], row["x"]))
        groups = []
        for row in rows:
            if not groups or row["top"] - groups[-1][0]["top"] > 1.5:
                groups.append([row])
            else:
                groups[-1].append(row)
        for group in groups:
            group.sort(key=lambda row: row["x"])
            ordered.append({**group[0], "t": " ".join(row["t"] for row in group)})
    return ordered


def review_page(args):
    """Retain ordered OCR lines and page coordinates without approving spell content."""
    pdf, number, tessdata = args
    rows = []
    with fitz.open(pdf) as doc:
        page = doc[number - 1]
        for column, clip in enumerate(column_clips(page.rect)):
            pixmap = page.get_pixmap(dpi=300, clip=clip)
            with fitz.open("pdf", pixmap.pdfocr_tobytes(language="eng", tessdata=tessdata)) as ocr:
                for row in page_lines(ocr[0], single_column=True):
                    row["x"] = round(row["x"] + clip.x0, 2)
                    row["top"] = round(row["top"] + clip.y0, 2)
                    row["column"] = column
                    rows.append(row)
    if not rows:
        raise ValueError(f"No OCR text on physical page {number}")
    return {"physicalPage": number, "lines": rows}


def main():
    """Cache pinned 2020 Deep Magic evidence outside Git for source-specific review."""
    parser = argparse.ArgumentParser(description="Review the image-only 2020 Deep Magic PDF.")
    parser.add_argument("pdf")
    parser.add_argument("output")
    parser.add_argument("--tessdata", required=True)
    parser.add_argument("--pages", type=int, nargs="+")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    with Path(args.pdf).open("rb") as source:
        digest = hashlib.file_digest(source, "sha256").hexdigest()
    if digest != PDF_SHA256:
        raise ValueError("PDF differs from the reviewed 2020 edition")
    with fitz.open(args.pdf) as doc:
        count = doc.page_count
    numbers = sorted(set(args.pages or range(3, count)))
    if args.workers < 1 or any(number < 1 or number > count for number in numbers):
        raise ValueError("Invalid worker count or physical page selection")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    pending = []
    for number in numbers:
        cache = output / f"page-{number}.json"
        if cache.exists():
            saved = json.loads(cache.read_text())
            if saved.get("sourceSha256") != digest or saved.get("physicalPage") != number:
                raise ValueError(f"Cache provenance mismatch on page {number}")
        else:
            pending.append((args.pdf, number, args.tessdata))
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        for page in pool.map(review_page, pending):
            page.update(sourceSha256=digest, publishable=False, extraction="ocr-columns-300dpi-v1")
            (output / f"page-{page['physicalPage']}.json").write_text(
                json.dumps(page, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"Reviewed OCR cache: physical page {page['physicalPage']}/{count}", flush=True)
    (output / "index.json").write_text(json.dumps({
        "publishable": False, "sourceSha256": digest, "pageCount": count,
        "physicalPages": numbers, "extraction": "ocr-columns-300dpi-v1",
        "fontEvidence": "synthetic-ocr-fonts",
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
