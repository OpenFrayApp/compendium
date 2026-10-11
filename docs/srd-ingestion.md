# SRD ingestion

Run from the repository root after [installation](./verification.md#install).
The three SRD ingest commands validate mapped entries through
[`emitValidatedDataset`](../src/compendium/datasetEmission.ts) before replacing datasets.
Validation grants no publication approval. Retain the required
[console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md) and follow the
[parent licensing checklist](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md).
OpenFray uses both SRDs under CC-BY-4.0.

## Commands and inputs

| Command | Arguments | Default output |
| --- | --- | --- |
| `npm run ingest:srd52-spells --` | `<spell-blocks.json> [out.json]` | `output/srd-spells.json` |
| `npm run ingest:srd52 --` | `<creature-blocks.json> [out.json] [spells.json]` | `output/srd-creatures.json` |
| `npm run ingest:srd-2014` | None | `output/srd-2014-creatures.json` and `output/srd-2014-spells.json` |

Successful ingestion creates missing output directories.
Output remains compact JSON without a trailing newline.
PDF-derived spells retain name sorting; PDF-derived creatures and API records retain input order.
Source identities, rules editions, structured spell references, and optional prose spell linking remain unchanged.
The API runner resolves `output/` relative to its repository, as before.
It has no cached-input or output-path argument.

### SRD 5.2.1 from the official PDF

Obtain the official [SRD 5.2.1 PDF](https://www.dndbeyond.com/srd) outside Git.
The existing extractors use **pdfplumber**, an explicit exception to the PyMuPDF convention.
Keep their two-column extraction rules independent of book-specific extractors.
The extractors still require existing destination directories:

```sh
mkdir -p output
python scripts/extract-srd52-spells-pdf.py /path/to/SRD_CC_v5.2.1.pdf output/srd52-spell-blocks.json
npm run ingest:srd52-spells -- output/srd52-spell-blocks.json output/srd-spells.json
python scripts/extract-srd52-pdf.py /path/to/SRD_CC_v5.2.1.pdf output/srd52-blocks.json
npm run ingest:srd52 -- output/srd52-blocks.json output/srd-creatures.json output/srd-spells.json
npm run validate -- --spells output/srd-spells.json
npm run validate -- output/srd-creatures.json
```

The creature extractor uses verbatim `extract_text()` content and a font pass to order entry names.
The spell extractor uses `extract_text(use_text_flow=True)` and spell headers to segment entries.
Both stay within their PDF sections. Neither PDF library nor extraction behavior changes.
The optional creature spell-link input must already exist.
These two ingest commands are independent; a later creature failure does not undo a successful spell command.

### SRD 5.1 from dnd5eapi

The network runner fetches the 2014 collection indexes and detail records from
[dnd5eapi.co](https://www.dnd5eapi.co).
Its structured spellcasting retains 2014 slots and spell references.
This API uses collection indexes and bounded detail-request batches, not Open5e pagination.

```sh
npm run ingest:srd-2014
npm run validate -- --spells output/srd-2014-spells.json
npm run validate -- output/srd-2014-creatures.json
```

Every unexpected mapping omission is reported with its entry name, API index, and error.
Both collections finish mapping before the omission gate runs.
Any omission exits nonzero without writing either dataset.
After complete mapping, both datasets are validated before either destination is replaced.
A validation failure reports both datasets and preserves both existing destination files.
No successful subset or diagnostic dataset is written.

## Findings and preservation

Validation reports error and warning counts, plus each finding’s name, identity, field, and message.
Warnings are reported without rejection or numerical correction.
Errors exit nonzero before creating destination directories or replacing existing datasets.
Mapping, input-reading, and network errors also exit nonzero before replacement.
Successful summaries appear only after emission.

Compare unresolved findings with source evidence. Do not adjust statistics to satisfy a validator.
The existing SRD 2024 mapper’s [ERRATA](../src/compendium/srd52.ts) stays unchanged.
No new SRD validation exceptions are supplied by this migration.
Any newly reviewed deviation needs exact-value guards and source evidence before acceptance.
If an exception provides review evidence, the reporting interface displays it.
The separate [SRD spell-parser issue #1](https://github.com/OpenFrayApp/compendium/issues/1) remains unchanged.
An affected mapped candidate can now fail validation; the runner does not repair or bypass it.

The preservation guarantee covers mapping and validation failures.
Filesystem writes remain nontransactional, including the two-file API ingest.
An I/O failure during replacement can leave incomplete output.
See the [shared emission contract](./dataset-emission.md) for reporting and serialization behavior.

## Offline checks and parity limits

```sh
npm test -- tests/scripts/srdIngest.test.ts
npm run verify
npm run schema:check
npm run verify:offline
```

[`srdIngest.test.ts`](../tests/scripts/srdIngest.test.ts) runs the actual npm commands in isolated temporary checkouts.
A child-process fetch substitute serves only controlled API routes and rejects every other URL.
No production fetch mode or command argument is added for testing.
Tests cover successful default and nested output, unexpected mapping omissions, validation errors, warnings, and unchanged existing destination bytes.
They also check failure without output directories and optional creature spell linking.

The [synthetic fixtures](../tests/fixtures/srd/inputs.json) are original SRD-shaped records, without primary-source text.
The [byte baseline](../tests/fixtures/srd/baseline.json) was captured from all three unchanged runners at `7004686` using Node 24.21.0.
It pins four dataset hashes, ordering, identities, editions, and representative spell references.
It does not establish full SRD content parity or review any source deviation.
No tests or approval hashes are removed or renewed.

Full-source parity requires the official SRD PDF, retained extraction snapshots, and pinned SRD 2014 API responses.
Those inputs are unavailable in this checkout.
Maintainers must reproduce the affected full-source commands and compare bytes, counts, and findings before claiming full-source parity.
The [offline verification baseline](./verification.md#output-baselines) separately preserves original-library bytes and reference spell approval metadata.
