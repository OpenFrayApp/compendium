# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
import hashlib
import json
from pathlib import Path

import fitz


def page_lines(page, ocr=False, tessdata=None):
    """Read Tome of Heroes lines in the column order used by the ToB 3 extractor."""
    mid = page.rect.width / 2
    rows = []
    textpage = page.get_textpage_ocr(language="eng", dpi=200, full=True, tessdata=tessdata) if ocr else None
    for blk in page.get_text("dict", textpage=textpage)["blocks"]:
        for ln in blk.get("lines", []):
            spans = ln["spans"]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans).strip()
            if not text:
                continue
            rows.append({
                "t": text,
                "x": round(ln["bbox"][0], 2),
                "top": round(ln["bbox"][1], 2),
                "fonts": sorted({s["font"] for s in spans}),
                "sizes": sorted({round(s["size"], 2) for s in spans}),
            })
    left = sorted([r for r in rows if r["x"] < mid], key=lambda r: r["top"])
    right = sorted([r for r in rows if r["x"] >= mid], key=lambda r: r["top"])
    return left + right


def snapshot(pdf, selected=None, ocr=False, tessdata=None):
    """Retain source lines and extraction provenance for a non-publishable review."""
    with fitz.open(pdf) as doc:
        count = doc.page_count
        numbers = sorted(set(selected)) if selected is not None else list(range(1, count + 1))
        if not numbers or any(number < 1 or number > count for number in numbers):
            raise ValueError("Selected physical pages are outside this PDF")
        pages = [{"physicalPage": number, "lines": page_lines(doc[number - 1], ocr, tessdata)}
                 for number in numbers]
        if not any(page["lines"] for page in pages):
            raise ValueError("No extracted text; use --ocr with --tessdata for an image-only PDF")
    with Path(pdf).open("rb") as source:
        sha256 = hashlib.file_digest(source, "sha256").hexdigest()
    return {
        "publishable": False,
        "sourceSha256": sha256,
        "pageCount": count,
        "extraction": "ocr" if ocr else "embedded-text",
        "fontEvidence": "synthetic-ocr-fonts" if ocr else "embedded-source-fonts",
        "pages": pages,
    }


def render_pages(pdf, selected, directory):
    """Save selected page images locally for visual checks of OCR evidence."""
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    with fitz.open(pdf) as doc:
        for number in selected:
            doc[number - 1].get_pixmap(dpi=150).save(directory / f"page-{number}.png")


def main():
    """Write a local Tome of Heroes PDF review snapshot without emitting spell cards."""
    parser = argparse.ArgumentParser(description="Inspect Tome of Heroes source pages and fonts.")
    parser.add_argument("pdf")
    parser.add_argument("output")
    parser.add_argument("--pages", type=int, nargs="+", help="Selected physical page numbers")
    parser.add_argument("--ocr", action="store_true", help="OCR an image-only PDF through PyMuPDF")
    parser.add_argument("--tessdata", help="Directory containing eng.traineddata for OCR")
    parser.add_argument("--render-dir", help="Save selected page images for visual review")
    args = parser.parse_args()
    result = snapshot(args.pdf, args.pages, args.ocr, args.tessdata)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.render_dir:
        render_pages(args.pdf, [page["physicalPage"] for page in result["pages"]], args.render_dir)
    print(f"{len(result['pages'])}/{result['pageCount']} source pages → {out}; publication remains blocked")


if __name__ == "__main__":
    main()
