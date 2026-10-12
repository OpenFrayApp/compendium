# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import importlib.util
from pathlib import Path
import unittest

import fitz

SPEC = importlib.util.spec_from_file_location("khyberia", Path(__file__).parents[2] / "scripts/extract-khyberia.py")
extractor = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(extractor)


def row(text, bold=False, page=2):
    """Build an extractor line with a controlled font label and page."""
    return {"text": text, "leading": text if bold else "", "page": page}


def header():
    """Build a minimal complete Khyberia creature header."""
    return [
        row("Example", True), row("Medium humanoid, chaotic neutral"),
        row("Armor Class 12", True), row("Hit Points 11 (2d8 + 2)", True),
        row("Speed 30 ft.", True), row("STR DEX CON INT WIS CHA", True),
        row("12 (+1) 13 (+1) 12 (+1) 8 (-1) 10 (+0) 8 (-1)"),
        row("Senses passive Perception 12", True), row("Challenge 1/4 (50 XP)", True),
    ]


class KhyberiaExtractorTests(unittest.TestCase):
    def test_font_labels_and_page_furniture(self):
        """Verify actual PyMuPDF font flags and footer exclusion."""
        with fitz.open() as document:
            page = document.new_page()
            page.insert_text((40, 40), "Standing Leap.", fontname="hebo")
            page.insert_text((40, 60), "The frogoblin leaps.")
            page.insert_text((40, page.rect.height - 20), "2")
            rows = extractor.page_lines(page)
        self.assertEqual(rows[0]["leading"], "Standing Leap.")
        self.assertEqual(rows[1]["leading"], "")
        self.assertEqual(len(rows), 2)

    def test_wrapped_rest_heading_and_partial_body_parenthesis(self):
        """Distinguish a wrapped heading from an unfinished body parenthesis."""
        rows = header() + [
            row("Actions", True),
            row("Colors (Recharges after a Short or Long", True),
            row("Rest). The shell shines." , True),
            row("Club. Melee Weapon Attack: +3 to hit (+4 with", True),
            row("shillelagh), reach 5 ft. Hit: 3 (1d4 + 1) bludgeoning damage."),
        ]
        block = extractor.extract_rows(rows)[0]
        self.assertEqual(block["sections"]["Actions"][0]["name"], "Colors (Recharges after a Short or Long Rest)")
        self.assertIn("(+4 with shillelagh)", block["sections"]["Actions"][1]["text"])

    def test_wrapped_alignment_and_chaos_table(self):
        """Keep split alignments and the detached Chaos Swell table intact."""
        rows = header()
        rows[1] = row("Large aberration, Chaotic")
        rows.insert(2, row("Neutral"))
        rows += [row("Actions", True), row("Claw. Hit: 3 (1d4 + 1) slashing damage.", True),
                 row("Chaos Swell", True), row("1d12 Chaos Swell Effect", True),
                 row("1"), row("The target loses Strength."), row("12"), row("The target takes damage."),
                 row("Other Monsters", True)]
        block = extractor.extract_rows(rows)[0]
        self.assertEqual(block["header"][0], "Large aberration, Chaotic Neutral")
        self.assertEqual(block["traits"][0]["name"], "Chaos Swell table")
        self.assertIn("12 The target takes damage.", block["traits"][0]["text"])
        self.assertNotIn("Chaos Swell", block["sections"]["Actions"][0]["text"])

    def test_rejects_missing_ability_table_and_missing_actions(self):
        """Reject incomplete blocks instead of inventing missing statistics."""
        rows = header() + [row("Actions", True), row("Club. Hit: 3 (1d4 + 1) bludgeoning damage.", True)]
        with self.assertRaisesRegex(ValueError, "ability table"):
            extractor.extract_rows([entry for entry in rows if not entry["text"].startswith("12 (+1)")])
        with self.assertRaisesRegex(ValueError, "Missing actions"):
            extractor.extract_rows(header())


if __name__ == "__main__":
    unittest.main()
