# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import fitz

SPEC = importlib.util.spec_from_file_location(
    "toh", Path(__file__).resolve().parents[2] / "scripts" / "toh.py"
)
toh = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(toh)


class TomeOfHeroesReviewTests(unittest.TestCase):
    """Check book-review provenance and column ordering with synthetic PDFs."""

    def test_column_order_and_font_evidence(self):
        """Read each column from top to bottom while retaining font evidence."""
        with fitz.open() as doc:
            page = doc.new_page(width=600, height=800)
            page.insert_text((340, 40), "Right first")
            page.insert_text((40, 100), "Left second")
            page.insert_text((40, 40), "Left first")
            page.insert_text((340, 100), "Right second")
            lines = toh.page_lines(page)
        self.assertEqual([line["t"] for line in lines],
                         ["Left first", "Left second", "Right first", "Right second"])
        self.assertTrue(all(line["fonts"] == ["Helvetica"] for line in lines))
        self.assertTrue(all(line["sizes"] == [11.0] for line in lines))

    def test_spell_column_clips_scale_with_the_scanned_page(self):
        """Keep both text columns isolated at ordinary and double-size scan dimensions."""
        ordinary = toh.spell_column_clips(fitz.Rect(0, 0, 612, 792))
        enlarged = toh.spell_column_clips(fitz.Rect(0, 0, 1224, 1584))
        self.assertLess(ordinary[0].x1, ordinary[1].x0)
        self.assertEqual(list(enlarged[0]), [value * 2 for value in ordinary[0]])
        self.assertEqual(list(enlarged[1]), [value * 2 for value in ordinary[1]])
        self.assertLess(enlarged[1].x1, 1224)
        self.assertLess(enlarged[1].y1, 1584)
        even = toh.spell_column_clips(fitz.Rect(0, 0, 612, 792), physical_page=288)
        self.assertEqual(even[0].x0, ordinary[0].x0 + 28)
        self.assertEqual(even[1].x1, ordinary[1].x1 + 28)
        self.assertLess(even[0].x1, even[1].x0)

    def test_empty_scan_requires_explicit_ocr(self):
        """Reject an empty text snapshot instead of treating scanned pages as reviewed."""
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "scan.pdf"
            with fitz.open() as doc:
                doc.new_page()
                doc.save(pdf)
            with self.assertRaisesRegex(ValueError, "use --ocr"):
                toh.snapshot(pdf)

    def test_page_selection_is_validated_and_retains_physical_numbers(self):
        """Reject invalid pages and retain source numbering for a partial review."""
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "fixture.pdf"
            with fitz.open() as doc:
                for text in ["First page", "Second page"]:
                    doc.new_page().insert_text((40, 40), text)
                doc.save(pdf)
            result = toh.snapshot(pdf, selected=[2, 2])
            self.assertEqual(result["pageCount"], 2)
            self.assertEqual([page["physicalPage"] for page in result["pages"]], [2])
            self.assertEqual(result["extraction"], "embedded-text")
            self.assertEqual(result["fontEvidence"], "embedded-source-fonts")
            for selected in [[], [0], [3]]:
                with self.assertRaisesRegex(ValueError, "outside this PDF"):
                    toh.snapshot(pdf, selected=selected)

    def test_ocr_is_marked_as_synthetic_evidence(self):
        """Mark OCR fonts explicitly so they cannot masquerade as publisher typography."""
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "fixture.pdf"
            with fitz.open() as doc:
                doc.new_page()
                doc.save(pdf)
            with patch.object(toh, "page_lines", return_value=[{"t": "OCR evidence"}]) as lines:
                result = toh.snapshot(pdf, ocr=True, tessdata="fixture-tessdata")
                self.assertTrue(lines.call_args.args[1])
                self.assertEqual(lines.call_args.args[2], "fixture-tessdata")
        self.assertEqual(result["extraction"], "ocr")
        self.assertEqual(result["fontEvidence"], "synthetic-ocr-fonts")
        self.assertFalse(result["publishable"])

    def test_rendered_evidence_uses_physical_page_number(self):
        """Write selected page images beside ignored OCR evidence for visual checks."""
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "fixture.pdf"
            images = Path(directory) / "images"
            with fitz.open() as doc:
                doc.new_page()
                doc.new_page().insert_text((40, 40), "Reviewed page")
                doc.save(pdf)
            toh.render_pages(pdf, [2], images)
            self.assertEqual([path.name for path in images.iterdir()], ["page-2.png"])
            self.assertTrue((images / "page-2.png").read_bytes().startswith(bytes([137, 80, 78, 71])))

    def test_snapshot_is_complete_hashed_and_not_publishable(self):
        """Keep every physical page and pin the exact PDF bytes without approval."""
        with tempfile.TemporaryDirectory() as directory:
            pdf = Path(directory) / "fixture.pdf"
            with fitz.open() as doc:
                doc.new_page().insert_text((40, 40), "License evidence")
                doc.new_page()
                doc.save(pdf)
            result = toh.snapshot(pdf)
            self.assertEqual(result["sourceSha256"], hashlib.sha256(pdf.read_bytes()).hexdigest())
        self.assertFalse(result["publishable"])
        self.assertEqual(result["pageCount"], 2)
        self.assertEqual([page["physicalPage"] for page in result["pages"]], [1, 2])
        self.assertEqual(result["pages"][1]["lines"], [])


if __name__ == "__main__":
    unittest.main()
