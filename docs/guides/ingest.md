# Ingest reviewed creature and SRD data

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Khyberia SRD from a supplied PDF

The October 2023 Khyberia SRD contains 21 standard 5e-compatible creature blocks.
This is the expanded 14-page document, not the older seven-page online version.
Its CC-BY-4.0 notice covers the whole SRD and retains SRD 5.1 and A5ESRD credits.
The imported creatures use conventional 5e statistics; their unusual effects are
defined in the blocks. No A5E library or separate A5E rules implementation is added.

```bash
# Use the Python environment from setup, with PyMuPDF installed.
mkdir -p output/khyberia
.venv/bin/python scripts/extract-khyberia.py "/path/to/Khyberia SRD 2023-10.pdf" output/khyberia/blocks.json
npm run ingest:khyberia
npm run validate -- output/khyberia-creatures.json
python -m unittest discover -s tests/scripts -p 'test_extract_khyberia.py'
```

The extractor retains the PDF digest and legal page. The mapper accepts only the
reviewed revision and all 21 blocks. Output includes `khyberia-creatures.json`,
`khyberia/validation.json`, and `khyberia/ATTRIBUTION.md`. Ship the required
attribution and adaptation notice with the data; the PDF itself is not committed.

Published values stay unchanged. Conditional damage choices and unsupported
rest-based recovery remain in prose rather than receiving invented automation.
The review records the Hunter’s passive Perception mismatch, Wodyanoi’s tusk
average discrepancy, and its omitted Gyre save DC.
See [the Khyberia source review](../khyberia-review.md).

## SRD 5.2.1 from the official PDF

Follow [SRD ingestion](../srd-ingestion.md#srd-521-from-the-official-pdf) for extraction and mapping commands.
The existing SRD extractors use **pdfplumber**, an explicit exception to the PyMuPDF convention.
Extractors require existing destination directories; successful ingest commands create their own.
The creature and spell runners validate before replacing their respective datasets.

## SRD 5.1 from dnd5eapi

Follow [SRD ingestion](../srd-ingestion.md#srd-51-from-dnd5eapi) for the unchanged API command.
Both collections must map completely and validate before either dataset is replaced.
Unexpected omissions exit nonzero with entry identities; no successful subset is written.
See the [failure and parity limits](../srd-ingestion.md#findings-and-preservation).

## Tome of Beasts 1–3 from supplied PDFs

Each book has its own PyMuPDF extractor. All three use the shared [`map2014StatBlock(block, source)` mapper](../formats.md).
These are 2014 libraries; cast spells link to the SRD 5.1 library.
The runners validate before replacing output and create missing destination directories on success.
See [Kobold ingestion](../kobold-ingestion.md) for failure behavior, unchanged contracts, and parity limits.
Supply the reviewed PDFs lawfully and keep them outside Git.
The corresponding observed datasets have 384, 389, and 395 OGC creatures.
These counts describe the reviewed inputs, not a completeness guarantee for another printing.

```sh
mkdir -p output
python scripts/tob1.py "/path/to/Tome of Beasts.pdf" output/tob1-blocks.json
node scripts/ingest-tob1.ts output/tob1-blocks.json output/tob1-creatures.json
npm run validate -- output/tob1-creatures.json

python scripts/tob2.py "/path/to/Tome of Beasts 2.pdf" output/tob2-blocks.json
node scripts/ingest-tob2.ts output/tob2-blocks.json output/tob2-creatures.json
npm run validate -- output/tob2-creatures.json

python scripts/tob3.py "/path/to/Tome of Beasts 3.pdf" output/tob3-blocks.json
node scripts/ingest-tob3.ts output/tob3-blocks.json output/tob3-creatures.json
npm run validate -- output/tob3-creatures.json
```

ToB 2 stat labels use SegoeUI-Semibold; ToB 3 uses SegoeUI-Bold.
ToB 1 uses HelveticaNeue-BlackCond/-Bold for names, CovingtonCond for section headers, and SegoeUI for body text.
Its named deluxe creatures have scattered Covington-SC700 drop-cap banners.
The extractor recovers those names from PDF bookmarks using letter-set matching.
Do not reuse another book’s font filter or replace its PDF library.

ToB 1 retains known gaps in nonstandard variant or inset blocks:
Hulking Whelp, Clockwork Beetle Swarm, Alseid Grovekeeper, Vampire Warlock variant,
Bandit Lord, Nkosi War Ostrich, and the split Baba Yaga Horsemen.
The [console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md) record OGL 1.0a,
OGC-only scope, and the required Section 15 chains for all three libraries.

## Creature Codex from Open5e

Use the 2018 OGC-only library, not the closed 2024 revision.
The runner uses Open5e because the reviewed input has no text-layer PDF for extraction.
Reserved Product Identity individuals are excluded by the adapter.

```sh
mkdir -p output
# Fetch live records:
node scripts/ingest-creature-codex.ts output/creature-codex-creatures.json
# Replay a complete saved Open5e response without network access:
node scripts/ingest-creature-codex.ts output/creature-codex-creatures.json /path/to/cached-open5e.json
npm run validate -- output/creature-codex-creatures.json
```

The cached JSON is the response object with a `results` array, not a mapped dataset.
The runner checks cached and live completeness, record shape, source identity, and exact exclusion presence before validation and replacement.
See [Kobold ingestion](../kobold-ingestion.md#creature-codex-snapshots) for the complete cache contract and drift failures.
The [console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#creature-codex-kobold-press)
record the source-specific designation, exclusions, and attribution chain.

## Handoff

Run validation after every ingest, including runners that do not validate internally.
Inspect reported omissions and findings against the source review before copying any dataset.
Use the [publication guide](./publish.md) for the console handoff and required credits.
