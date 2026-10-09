# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "extract-kibbles-v23-spells.py"
SPEC = importlib.util.spec_from_file_location("extract_kibbles_v23", SCRIPT)
extractor = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(extractor)


class FakePage:
    rect = SimpleNamespace(width=600, height=800)

    def get_text(self, mode, flags):
        """Return interleaved source lines and a footer to exercise column reconstruction."""
        data = {"blocks": [{"lines": [
            {"bbox": [310, 10, 590, 20], "spans": [{"text": "Right first"}]},
            {"bbox": [10, 50, 290, 60], "spans": [{"text": "Left second"}]},
            {"bbox": [10, 10, 290, 20], "spans": [{"text": "Left "}, {"text": "first"}]},
            {"bbox": [295, 780, 305, 790], "spans": [{"text": "14"}]},
            {"bbox": [585, 11, 599, 32], "spans": [{"text": "45"}]},
        ]}, {"type": 1}]}
        for block in data['blocks']:
            for line in block.get('lines', []):
                for span in line['spans']:
                    span.update(font='Bookmania-Regular', size=11)
        return data

    def find_tables(self):
        """Keep this column-order fixture independent of table detection."""
        return SimpleNamespace(tables=[])


class KibblesExtractorTests(unittest.TestCase):
    def test_columns_and_footer(self):
        """Keep column order and physical provenance while dropping footer pagination."""
        lines = extractor.read_lines([FakePage()])
        self.assertEqual([line["text"] for line in lines], ["Left first", "Left second", "Right first"])
        self.assertTrue(all(line["page"] == 1 for line in lines))

    def test_wrapping_bullets_and_source_values(self):
        """Retain mechanics while normalizing wrapped words, bullets, and paragraph breaks."""
        lines = [
            {"text": "You gain 15 temporary hit", "page": 1, "bbox": [10, 10, 290, 20]},
            {"text": "points and resis-", "page": 1, "bbox": [10, 22, 290, 32]},
            {"text": "tance.", "page": 1, "bbox": [10, 34, 290, 44]},
            {"text": "• A 15-foot cone becomes a 30 foot cone.", "page": 1, "bbox": [10, 50, 290, 60]},
            {"text": "At Higher Levels. More duration.", "page": 1, "bbox": [10, 62, 290, 72]},
        ]
        self.assertEqual(extractor.prose(lines), "You gain 15 temporary hit points and resistance.\n\n- A 15-foot cone becomes a 30 foot cone.\n\nAt Higher Levels. More duration.")

    def test_page_continuation(self):
        """Join continued prose across a page break without inserting another rule or number."""
        lines = [
            {"text": "The target takes", "page": 1, "bbox": [10, 680, 290, 690]},
            {"text": "1d6 fire damage.", "page": 2, "bbox": [10, 10, 290, 20]},
        ]
        self.assertEqual(extractor.prose(lines), "The target takes 1d6 fire damage.")

    def test_all_source_header_types(self):
        """Recognize ordinary, psionic, and ritual appendix spell headers."""
        for header in ['Transmutation cantrip (arcane, primal)', '1st-level psionic', '1st-level divination (blood magic, ritual)', '4nd-level transmutation (arcane)']:
            self.assertIsNotNone(extractor.HEADER.fullmatch(header))

    def test_source_table_cells(self):
        """Keep categorical columns and source numbers associated in Markdown tables."""
        self.assertEqual(extractor.markdown_table([['Dragon', 'Damage'], ['Blue', 'Lightning'], ['Black', 'Acid']]), '| Dragon | Damage |\n| --- | --- |\n| Blue | Lightning |\n| Black | Acid |')

    def test_same_name_stat_block_reference(self):
        """Attach Dancing Object's following stats without requiring the words stat block."""
        stats = [{'name': 'Dancing Object'}, {'name': 'Dragon Spirit'}]
        self.assertEqual(extractor.referenced_stat_blocks('Dancing Object', 'The object uses the following stats:', stats), [stats[0]])
        self.assertEqual(extractor.referenced_stat_blocks('Other', 'The object uses the following stats:', stats), [])
        self.assertEqual(extractor.referenced_stat_blocks('Summon Dragon', 'It uses the dragon spirit stat block.', stats), [stats[1]])

    def test_summon_ability_row_alignment(self):
        """Keep six ability labels and their corresponding six source values in one grid."""
        values = ['16 (+3)', '12 (+1)', '14 (+2)', '8 (−1)', '10 (0)', '10 (0)']
        lines = [{'text': text, 'page': 1, 'bbox': [10, 100, 290, 110]} for text in extractor.ABILITIES + values]
        text = extractor.stat_text(lines)
        self.assertIn('| STR | DEX | CON | INT | WIS | CHA |', text)
        self.assertIn('| 16 (+3) | 12 (+1) | 14 (+2) | 8 (−1) | 10 (0) | 10 (0) |', text)


if __name__ == "__main__":
    unittest.main()
