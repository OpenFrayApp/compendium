# Validated dataset emission

The four original-content ingest commands share
[`emitValidatedDataset`](../src/compendium/datasetEmission.ts).
They need no source snapshots or network access.
See [installation](./verification.md#install) and
[original-content authoring](./guides/original-content.md).

## Run an original-content ingest

Run from the repository root. Each command accepts one optional positional output path.

| Command | Default output |
| --- | --- |
| `npm run ingest:waking-garden` | `output/waking-garden-creatures.json` |
| `npm run ingest:brood-and-bloom` | `output/brood-and-bloom-creatures.json` |
| `npm run ingest:brood-and-bloom-spells` | `output/brood-and-bloom-spells.json` |
| `npm run ingest:strong-waters-spells` | `output/strong-waters-spells.json` |

For isolated output:

```sh
work="$(mktemp -d)"
npm run ingest:waking-garden -- "$work/new/waking-garden-creatures.json"
npm run validate -- "$work/new/waking-garden-creatures.json"
```

Successful runs create missing parent directories and write compact JSON without a trailing newline.
The runners retain their existing name ordering, record values, source identities, and rules editions.
They report validation counts and the destination written.

Validation finishes before any directory creation or destination replacement.
A validation error exits nonzero, reports findings, and leaves existing destination bytes unchanged.
A failing candidate with no destination leaves its parent directories uncreated.
Warnings retain the existing policy: counts for creatures, individual findings for spells, and no warning-only rejection.
The runners make no corrections to candidate records.

## Use the shared interface

```ts
const report = emitValidatedDataset(records, destination, {
  validate: validateSpellDataset,
  report: (report) => {
    console.log(`errors: ${report.errors}, warnings: ${report.warns}`)
    for (const issue of report.issues) console.error(issue)
  },
  space: 2,
})
if (report.errors) process.exit(1)
```

The caller supplies the dataset validator and reporting policy.
The returned `DatasetReport` retains errors, warnings, individual findings, and error counts by field.
Reporting runs on both success and validation failure.
`space` uses the JSON indentation argument; omitting it produces compact JSON.
The interface retains array order and record values. Callers own sorting and source-specific checks.
Source-specific validation exceptions can be supplied through a validator callback.

Serialization completes before directories are created or files are written.
Validator, reporting, serialization, and filesystem exceptions propagate to the command.
Filesystem writes are not transactional; an I/O failure during writing can leave incomplete output.
The preservation guarantee covers validation failure.

## Preparation and publication boundaries

This interface emits only candidates that pass the caller's validation gate.
Provisional preparation may retain invalid candidates with findings through its own explicit diagnostic path.
Those provisional artifacts are not validated exports.

Validation success grants no publication approval.
Source fidelity, licensing, completeness, exclusions, and attribution remain source-owned requirements.
[Approved reference publication](./reference-spell-publication.md) retains its independent candidate hashes,
counts, editions, mechanics limits, and accepted-warning checks.
The emission interface does not replace those gates or register a console library.
SRD and Kobold runners can reuse it after their own source-specific checks; they are not migrated here.

## Checks

```sh
npm run verify
npm run verify:offline
```

[`originalIngest.test.ts`](../tests/scripts/originalIngest.test.ts) runs every preserved npm command
in isolated checkouts without output directories or dependencies.
It covers default and nested positional output, byte parity, failed validation with a preexisting destination,
no directories on failure, and warning-only success without corrections.
Failure fixtures mutate only child-process memory; authored files stay unchanged.

[`datasetEmission.test.ts`](../tests/compendium/datasetEmission.test.ts) checks reusable indentation,
input order, and returned reporting.
[`originalLibraries.test.ts`](../tests/compendium/originalLibraries.test.ts) consolidates repeated
counts, uniqueness, validation, identity, and edition checks.
Collection suites retain lore, cross-spell references, Lazaret consistency, and Strong Waters promises.
The [offline baseline](./verification.md#output-baselines) pins all four datasets and the six publication approval records.
