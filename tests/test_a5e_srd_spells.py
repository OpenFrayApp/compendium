# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location(
    "a5e", Path(__file__).parents[1] / "scripts/extract-a5e-srd-spells.py"
)
a5e = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(a5e)


def line(text, index=0, heading=False):
    """Create a publisher-layout line without requiring licensed PDF fixtures."""
    return {
        "text": text,
        "page": 6,
        "column": 1,
        "x": 324,
        "y": 20 + index * 15,
        "bottom": 33 + index * 15,
        "heading": heading,
    }


class A5ESrdSpellsTest(unittest.TestCase):
    """Protect publisher metadata, title matching, and manual-only output."""

    def test_components_and_wrapped_concentration(self):
        """Read positive material evidence and the complete concentration limit."""
        texts = [
            "4th-level (abjuration; planar)",
            "Classes: Cleric, herald",
            "Casting Time: 1 action",
            "Range: Medium (60 feet)",
            "Target: One creature",
            "Components: V, S, M (an item worth at",
            "least 2 gold, consumed by the spell)",
            "Duration: Concentration (1d4+2 rounds;",
            "the Narrator rolls in secret)",
            "Saving Throw: Charisma negates",
            "The target is banished.",
            "Rare: A variant remains prose.",
        ]
        block = {
            "name": "Test Spell",
            "page": 6,
            "lines": [line(t, i) for i, t in enumerate(texts)],
        }
        result = a5e.project(block, {"key": "a5e-ag_test-spell"})
        self.assertEqual(
            result["components"],
            {
                "verbal": True,
                "somatic": True,
                "material": True,
                "materials": "an item worth at least 2 gold, consumed by the spell",
            },
        )
        self.assertEqual(
            result["duration"], "up to 1d4+2 rounds; the Narrator rolls in secret"
        )
        self.assertEqual(result["classes"], ["cleric", "herald"])
        self.assertIn("Saving Throw: Charisma negates", result["text"])
        self.assertIn("Rare: A variant remains prose.", result["text"])
        self.assertNotIn("mechanics", result)
        self.assertNotIn("edition", result)

    def test_typographic_titles(self):
        """Treat apostrophe typography as identity while preserving the publisher title."""
        self.assertEqual(
            a5e.normalized_name("Cobra’s Spit"), a5e.normalized_name("Cobra's Spit")
        )
        rows = [
            line("Spells"),
            line("Arcane Sword", heading=False),
            line("7th-level (evocation)", 1),
            line("Rules remain prose.", 2),
        ]
        blocks = a5e.spell_blocks(rows, {"arcanesword": {}})
        self.assertEqual(blocks[0]["name"], "Arcane Sword")
        self.assertEqual(len(blocks[0]["lines"]), 2)

    def test_material_description_required(self):
        """Reject an unresolved material component rather than inventing its description."""
        texts = [
            "Cantrip (evocation)",
            "Classes: Wizard",
            "Casting Time: 1 action",
            "Range: Self",
            "Components: V, M",
            "Duration: Instantaneous",
            "Rules.",
        ]
        with self.assertRaisesRegex(ValueError, "Unresolved material"):
            a5e.project(
                {
                    "name": "Test",
                    "page": 6,
                    "lines": [line(t, i) for i, t in enumerate(texts)],
                },
                {"key": "a5e-ag_test"},
            )


if __name__ == "__main__":
    unittest.main()
