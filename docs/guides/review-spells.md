# Review and correct source-specific spell candidates

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Warlock Grimoire source review

The [content-boundary review](../warlock-content-boundaries.md) records
source-specific licensing decisions for the located drafts and excludes unsupplied imports.
The [copyright transcripts](../warlock-section-15.md) preserve the relevant notices.
The extraction reviews produce no publication or combat approval.
The separate [publication decision](../reference-spell-publication.md#warlock-grimoire) approves only the pinned 35-card corrected selection.
The source-corrected 35-card selection is authored in `src/compendium/warlockGrimoireSpells.ts`.
Prepare, validate, and export only that reviewed subset:

```sh
npm run prepare:warlock-grimoire-spells
npm run validate -- --spells output/warlock-grimoire-preparation/candidate-spells.json
npm run export:reference-spells -- ../console/public/compendium --source kobold-press-wz
```

Its console profiles use existing saves, attacks, conditions, and reminders.
Unsupported mechanics remain prose. Three located entries and five unsupplied imports remain excluded.

`npm run review:warlock-grimoire -- "$WARLOCK_DRAFT" "$WARLOCK_RTF"` compares
pinned local drafts with the supplied 2019 book. Add
`--grimoire-2 "$WARLOCK_GRIMOIRE_2_RTF"` to include the 2020 volume, and
`--grimoire-3 "$WARLOCK_GRIMOIRE_3_RTF"` for the 2022 volume. Include
`--grimoire-4 "$WARLOCK_GRIMOIRE_4_RTF"` to record the 2023 volume’s negative
match inventory.
It requires macOS `textutil`. Private review artifacts stay under ignored `output/`; no spell cards or approvals
are produced. See the [source review](../warlock-grimoire-review.md) for
located entries, unresolved drafts, corrections, and publication gates.

## Review Tome of Heroes against the publisher PDF

The book-specific `scripts/toh.py` uses PyMuPDF and the column-reading approach from `tob3.py`. It retains source lines with physical page, font, size, and position evidence. It does not filter Product Identity or emit publishable cards. OCR snapshots identify their fonts as synthetic, not publisher font evidence. `--spell-columns` clips the spell descriptions into separate text columns before OCR and excludes the illustrated outer border and footer.

```bash
python -m pip install pymupdf==1.26.7
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/pages.json
# For an image-only PDF, supply Tesseract's English traineddata directory:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/ocr-pages.json --ocr --tessdata /path/to/tessdata --pages 3 4 320
# OCR the spell-description columns separately to avoid cross-column merges:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/spell-columns.json --ocr --spell-columns --tessdata /path/to/tessdata --pages 273 274
# Reorder an existing column snapshot without repeating OCR:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/spell-columns-ordered.json --cache output/tome-of-heroes-review/spell-columns.json
python -m unittest discover -s tests/scripts -p 'test_toh.py'
```

Cached replay checks the PDF hash, page count, extraction mode, and physical page numbers.
It sorts lines within each column before joining the columns in reading order.
The snapshot remains review evidence with `publishable: false`.

The ignored review snapshot pins the supplied PDF’s SHA-256. `--pages` selects physical page numbers and preserves the total PDF page count. A snapshot with no extracted text fails explicitly. Add `--render-dir output/tome-of-heroes-review/images` to save selected page images for visual checks. Check OCR against those images before using it to correct spell data. Use the evidence to verify the declaration, complete license chain, spell metadata, and prose before approving a corrected spell snapshot. Keep the PDF and extracted source pages outside Git. The [publication inventory](../open5e-5e-spell-publication.md) distinguishes raw input findings from the approved corrected selection.

### Prepare source-corrected reference candidates

The source-specific review in `src/compendium/tomeOfHeroesReview.ts` pins the Open5e candidate hash and supplied PDF hash.
It restores material descriptions, corrects reviewed headers, and applies the publisher’s May 29, 2025 spell errata.
Deadly Salvo is withheld because it depends on excluded gunpowder rules.
Printed ambiguities remain unchanged; conditional advantage stays prose.

```bash
npm run prepare:tome-of-heroes-spells -- output/open5e-spell-preparation/toh/candidate-spells.json
npm run validate -- --spells output/tome-of-heroes-preparation/candidate-spells.json
```

Preparation writes 90 candidates and an evidence report to `output/tome-of-heroes-preparation/`.
A changed input snapshot requires renewed source review.
Preparation omits edition and rollable mechanics.
The report retains `publishable: false` as a conservative preparation gate.
The separate [90-card publication decision](../reference-spell-publication.md#tome-of-heroes) approves the pinned corrected snapshot and records console attribution.
Export checks that approval and assigns the reviewed 2014 edition.
Changed input or output snapshots require renewed review; existing approvals and warnings remain unchanged.

## Deep Magic 2020 reference spells

The [source review](../deep-magic-2020-review.md) covers the 2020 book, not its 2023 successors.
The matched Open5e selection is accepted provenance evidence under the book’s selective spell grant.
Preparation consolidates Anchoring Rope, restores verified headers, classes, and effect wording, and applies publisher errata.
Eleven custom-ritual spells remain withheld. Supporting rules and creature stat blocks are not imported.

```bash
npm run prepare:deep-magic-2020-spells -- output/open5e-spell-preparation/deepm/candidate-spells.json
npm run validate -- --spells output/deep-magic-2020-preparation/candidate-spells.json
npm run export:reference-spells -- ../console/public/compendium --source kobold-press-deepm
```

The 503-card snapshot is approved only for manual reference publication.
A changed snapshot requires renewed review. The [35-notice transcript](../deep-magic-2020-section-15.md) supplies its attribution chain.
Preparation omits edition and combat mechanics; export assigns the reviewed 2014 edition.
PDFs, OCR caches, and preparation artifacts remain outside Git.

## Deep Magic 2020 evidence replay

The [source review](../deep-magic-2020-review.md#review-cache-and-replay) retains the complete OCR,
class reconciliation, body comparison, and visual-check recipe.
It includes `scripts/deepmagic.py`, `scripts/audit-deepmagic.py`, and `scripts/compare-deepmagic.py`.
OCR needs the supplied image-only PDF and Tesseract English traineddata.
Review outputs remain evidence; similarity scores grant no approval.

The historical import-provenance audit has a separate interface:

```sh
python scripts/review-deepmagic-provenance.py /path/to/deepm/candidate-spells.json output/deep-magic-2020-review/provenance
```

It requires the pinned candidate hash and writes `provenance-leads.json` plus a `wiki-cache/` directory.
It fetches missing public community-wiki pages; a complete cache permits offline replay.
Its classifications are provenance leads, not publisher licensing or publication decisions.
