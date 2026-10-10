# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

import fitz

SCRIPTS = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("deepmagic", SCRIPTS / "deepmagic.py")
deepmagic = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deepmagic)
audit_spec = importlib.util.spec_from_file_location("audit_deepmagic", SCRIPTS / "audit-deepmagic.py")
audit_deepmagic = importlib.util.module_from_spec(audit_spec)
audit_spec.loader.exec_module(audit_deepmagic)
provenance_spec = importlib.util.spec_from_file_location("review_deepmagic_provenance", SCRIPTS / "review-deepmagic-provenance.py")
provenance = importlib.util.module_from_spec(provenance_spec)
provenance_spec.loader.exec_module(provenance)
comparison_spec = importlib.util.spec_from_file_location("compare_deepmagic", SCRIPTS / "compare-deepmagic.py")
comparison = importlib.util.module_from_spec(comparison_spec)
comparison_spec.loader.exec_module(comparison)


class DeepMagicReviewTests(unittest.TestCase):
    """Check source-specific column geometry and the approved PDF identity."""

    def test_columns_are_ordered_disjoint_and_inside_page(self):
        """Keep both text columns without combining their OCR reading order."""
        rect = fitz.Rect(0, 0, 696, 900)
        left, right = deepmagic.column_clips(rect)
        self.assertTrue(rect.contains(left))
        self.assertTrue(rect.contains(right))
        self.assertLess(left.x1, right.x0)
        self.assertEqual(left.y0, right.y0)
        self.assertEqual(left.y1, right.y1)

    def test_geometry_scales_with_source_page(self):
        """Preserve normalized column positions for different raster sizes."""
        small = deepmagic.column_clips(fitz.Rect(0, 0, 348, 450))
        large = deepmagic.column_clips(fitz.Rect(0, 0, 696, 900))
        for a, b in zip(small, large):
            self.assertEqual(tuple(value * 2 for value in a), tuple(b))

    def test_split_baselines_are_rejoined_in_horizontal_order(self):
        """Restore a split spell-list entry without merging the following entry."""
        page = {"lines": [
            {"t": "form (transmutation)", "column": 1, "top": 121.44, "x": 196.43},
            {"t": "Alchemical", "column": 1, "top": 122.64, "x": 172.67},
            {"t": "Ally aegis (abjuration)", "column": 1, "top": 131.76, "x": 172.67},
        ]}
        self.assertEqual([row["t"] for row in deepmagic.ordered_review_lines(page)],
                         ["Alchemical form (transmutation)", "Ally aegis (abjuration)"])

    def test_pdf_is_pinned_to_2020_edition(self):
        """Prevent the 2023 books from silently replacing reviewed source evidence."""
        self.assertEqual(deepmagic.PDF_SHA256,
                         "0f2e99f8184d8dbe93b9b1dcf0c90959cf7cd8c537d6ed327f1282e39fa486b8")


class DeepMagicAuditTests(unittest.TestCase):
    """Ensure OCR review aids cannot grant publication approval."""

    def test_changed_candidate_snapshot_is_rejected(self):
        """Keep the candidate boundary tied to the reviewed input hash."""
        with self.assertRaisesRegex(ValueError, "snapshot changed"):
            audit_deepmagic.audit(b"[]", {})

    def test_page_matching_does_not_require_recognized_titles(self):
        """Find body-text leads even when decorative titles fail OCR."""
        text = "You unleash a storm of swirling acid around the chosen creature."
        pages = {165: {"lines": [{"t": text, "column": 0, "top": 0, "x": 0}]}}
        result = audit_deepmagic.page_suggestions(pages, [{"name": "Acid Rain", "text": text}])
        self.assertEqual(result["Acid Rain"]["physicalPages"], [165])
        self.assertEqual(result["Acid Rain"]["bestPageOverlap"], 1.0)

    def test_missing_class_boundary_fails_instead_of_guessing(self):
        """Do not silently assign spells to the wrong class after an OCR omission."""
        pages = {number: {"lines": []} for number in range(7, 34)}
        with self.assertRaisesRegex(ValueError, "Class boundary missing"):
            audit_deepmagic.class_suggestions(pages, [{"name": "Abhorrence"}])

    def test_perfect_matches_remain_pending(self):
        """Prevent source-text overlap from being treated as permission to ship."""
        import hashlib
        import json
        spells = [{"id": f"kobold-press-deepm:{number}", "source": "kobold-press-deepm",
                   "name": f"Spell {number}", "text": "Source text", "classes": ["Wizard"],
                   "components": {"material": False}} for number in range(515)]
        content = json.dumps(spells).encode()
        classes = {spell["name"]: ["Wizard"] for spell in spells}
        locations = {spell["name"]: {"physicalPages": [35], "bestPageOverlap": 1.0} for spell in spells}
        with patch.object(audit_deepmagic, "CANDIDATE_SHA256", hashlib.sha256(content).hexdigest()), \
                patch.object(audit_deepmagic, "class_suggestions", return_value=classes), \
                patch.object(audit_deepmagic, "page_suggestions", return_value=locations):
            result = audit_deepmagic.audit(content, {})
        self.assertFalse(result["publishable"])
        self.assertEqual(result["approvedCount"], 0)
        self.assertTrue(all(row["status"] == "pending-source-review" for row in result["candidates"]))


class DeepMagicProvenanceTests(unittest.TestCase):
    """Check that community evidence remains literal and separate from approval."""

    def test_index_links_retain_names_and_filter_non_spell_paths(self):
        """Discover spell identities from the publication index without guessing."""
        content = '<div id="page-content"><a href="/spell:anchoring-rope">Anchoring Rope</a><a href="/monster:avatar">Avatar</a></div>'
        self.assertEqual(provenance.spell_links(content), [("Anchoring Rope", "/spell:anchoring-rope")])

    def test_tags_are_not_interpreted_as_a_license(self):
        """Return literal backer and book tags for later publisher-source verification."""
        content = '<div class="page-tags"><a href="/system:page-tags/tag/backer-spell#pages">Backer</a></div>'
        self.assertEqual(provenance.page_tags(content), ["backer-spell"])
        self.assertEqual(provenance.page_tags("Missing metadata"), [])

    def test_comparison_rejects_unpinned_snapshots(self):
        """Reject arbitrary inputs even when they contain valid spell JSON."""
        with self.assertRaisesRegex(ValueError, "snapshot changed"):
            comparison.snapshot_details(b"[]")

    def test_comparison_keeps_snapshot_reports_separate(self):
        """Record the actual input hash without overwriting the original comparison."""
        import hashlib
        original = b"original fixture"
        corrected = b"corrected fixture"
        original_hash = hashlib.sha256(original).hexdigest()
        corrected_hash = hashlib.sha256(corrected).hexdigest()
        with patch.object(comparison, "CANDIDATE_SHA256", original_hash), \
                patch.object(comparison, "CORRECTED_SHA256", corrected_hash):
            self.assertEqual(comparison.snapshot_details(original),
                             (original_hash, "body-comparison.json"))
            self.assertEqual(comparison.snapshot_details(corrected),
                             (corrected_hash, "corrected-body-comparison.json"))

    def test_shared_opening_does_not_select_a_different_spell(self):
        """Prefer the whole-body lead when another spell shares its opening wording."""
        opening = "You touch a creature and weave a thread of magic around its body. The creature makes a saving throw and becomes affected by the spell for the duration. Its surroundings remain unchanged. "
        ending = "The target takes necrotic damage and an unattended object takes maximum damage. This damage increases at fifth, eleventh, and seventeenth level."
        text = opening + ending
        columns = {
            (49, 0): comparison.normalized(opening + "Instead the spell deals acid damage and interferes with concentration. A protective shield forms around the target and all its allies."),
            (60, 0): comparison.normalized(text.replace("touch", "t0uch", 1)),
        }
        result = comparison.compare_spell(({"name": "Decay", "text": text}, columns, [49, 60]))
        self.assertEqual(result["physicalPage"], 60)
        self.assertGreater(result["bodySimilarity"], .99)
        self.assertEqual(result["status"], "pending-visual-review")

    def test_repeated_opening_in_one_column_considers_later_occurrences(self):
        """Do not prepend an earlier spell that uses the same attack-roll wording."""
        text = "Make a melee spell attack against a creature you touch. The target takes necrotic damage. An unattended object automatically takes maximum damage, and the damage increases at higher character levels."
        earlier = "Make a melee spell attack against the target. This unrelated effect turns the caster invisible until the start of their next turn. "
        result = comparison.compare_spell(({"name": "Decay", "text": text},
            {(60, 0): comparison.normalized(earlier + text)}, [60]))
        self.assertEqual(result["bodySimilarity"], 1.0)
        self.assertEqual(result["differences"], [])
        self.assertEqual(result["status"], "pending-visual-review")

    def test_perfect_body_match_still_requires_visual_review(self):
        """Do not approve mechanics merely because the normalized OCR text matches."""
        text = "You unleash a storm of swirling acid around the chosen creature."
        result = comparison.compare_spell(({"name": "Acid Rain", "text": text},
                                           {(165, 0): comparison.normalized(text)}, [165]))
        self.assertEqual(result["bodySimilarity"], 1.0)
        self.assertEqual(result["status"], "pending-visual-review")


if __name__ == "__main__":
    unittest.main()
