# OpenFray compendium

Build-time tooling for [OpenFray](https://openfray.app)’s creature and spell compendium.
It extracts licensed sources, maps entries into the console’s `Creature` and `Spell`
schema, validates datasets, and prepares reviewed exports.
The console consumes generated JSON; it does not run these tools.

## Start here

- Read [AGENTS.md](./AGENTS.md) for contribution rules and branching.
- Use [CONTEXT.md](./CONTEXT.md) for compendium ingest terminology.
- Read [domain ownership and contracts](./docs/domain.md) for schema and publication boundaries.
- Check [source status](./docs/source-status.md) before selecting a pipeline.
- Use the [documentation index](./docs/README.md) to find recipes, reviews, and legal evidence.

## Setup

Use Node 24, npm, and Python 3.14 on macOS or Linux.
The version files declare the supported runtime lines.
The scripts run `.ts` files directly through Node; no build step is required.
The original-content example below needs only Node and npm.

```sh
npm ci
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
```

Keep the Python environment active when following the guides’ `python` commands.
The SRD 5.2.1 extractors use **pdfplumber**, an existing exception to the
**PyMuPDF** convention. Other PDF extractors remain book-specific.
Image-only review needs Tesseract English traineddata; see the
[spell review guide](./docs/guides/review-spells.md).
Warlock RTF review also requires macOS `textutil`.

Obtain source PDFs lawfully and keep them outside Git.
Some recipes need a supplied, hash-pinned PDF or saved source snapshot.
Those inputs are not part of a clean checkout.
Create output directories before running scripts that write directly to a file.
Generated JSON and private review evidence stay under ignored `output/`.

## Verification

With the Python environment active, run the combined public checks:

```sh
npm run verify
npm run verify:offline
```

`verify` runs all Python suites, TypeScript tests, and typechecking.
`verify:offline` compares original-content output bytes and publication approval metadata.
Neither command needs purchased PDFs or network access after installation.
Run the dataset validator after each ingest or preparation; passing tests does not
approve a source for publication.

The [migration audit](./docs/migration-audit.md) records replacement coverage, retained interfaces, parity, and private retention procedures.
`npm run check:docs` checks tracked public links, anchors, and npm command coverage offline.

The [verification guide](./docs/verification.md) covers individual checks,
`npm run format:check`, explicit-file `npm run format -- <files...>`,
`npm run check:prose`, and missing full-source parity inputs.

## Try an offline original-content ingest

This example writes to a new temporary directory and leaves existing datasets unchanged:

```sh
scratch=$(mktemp -d)
npm run ingest:waking-garden -- "$scratch/waking-garden-creatures.json"
npm run validate -- "$scratch/waking-garden-creatures.json"
npm run estimate:cr -- "$scratch/waking-garden-creatures.json"
```

The ingest validates typed original content before writing.
The challenge-rating estimate is advisory; flags require an editorial review.
No source PDF, API request, or console checkout is needed.
See [original-content authoring](./docs/guides/original-content.md) for the other collections,
spell commands, comparisons, and challenge-rating options.

## Choose a task

| Task                                                                   | Guide                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Extract SRD, Tome of Beasts, or Khyberia; ingest Creature Codex        | [Ingest](./docs/guides/ingest.md)                                |
| Fetch or replay provisional Open5e creatures                           | [Prepare creatures](./docs/guides/prepare-creatures.md)          |
| Fetch or replay Open5e, GM Binder, or Kibbles spell candidates         | [Prepare spells](./docs/guides/prepare-spells.md)                |
| Review Tome of Heroes, Deep Magic 2020, or Warlock evidence            | [Review spells](./docs/guides/review-spells.md)                  |
| Edit typed originals, validate, compare, or estimate challenge ratings | [Original content and checks](./docs/guides/original-content.md) |
| Export approved reference cards or hand off vetted datasets            | [Publish](./docs/guides/publish.md)                              |
| Find current decisions, transcripts, or historical source searches     | [Documentation index](./docs/README.md)                          |

All existing npm command names remain supported.
Commands without npm aliases, including the Tome of Beasts and Creature Codex runners,
are listed in the ingest guide.

## Publication limits

Preparation produces provisional candidates and findings.
Validation checks represented fields; publication approval covers a reviewed selection.
The [reference spell publication record](./docs/reference-spell-publication.md) approves
six pinned selections, including Tome of Heroes and the 35-card Warlock Grimoire subset.
Conservative preparation reports still apply to future snapshots and unreviewed mechanics.
Changed candidates require renewed review; no guide grants new approval.

Follow the parent’s [content licensing checklist](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md).
The [console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md) are the public compliance record.
The console owns library registration, casting verdicts, and shipped JSON.
The [parent workspace](https://github.com/OpenFrayApp/openfray) owns assembled deployment.
Compendium export does not register libraries or deploy OpenFray.

## Repository layout

- [`src/schema/`](./src/schema/): vendored [console types](https://github.com/OpenFrayApp/console/tree/main/src/schema).
- [`src/compendium/`](./src/compendium/): source adapters, review data, validation, and publication gates.
- [`src/formats/`](./src/formats/): shared stat-block, identity, and direct-spell parsing.
- [`src/originals/`](./src/originals/): typed original-content collections.
- [`scripts/`](./scripts/): ingest, extraction, preparation, review, and export commands.
- [`tests/`](./tests/): behavior tests grouped into compendium, formats, originals, and scripts; Python suites under scripts.
- [`docs/`](./docs/): task guides, source reviews, publication records, and investigation navigation.
- `output/`: ignored generated datasets and local evidence. Preserve existing caches.

Before contributing, read the shared
[contribution guide](https://github.com/OpenFrayApp/openfray/blob/main/CONTRIBUTING.md),
[writing style](https://github.com/OpenFrayApp/openfray/blob/main/STYLE.md), and
[repository file policy](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/repository-files.md).
