# Kobold creature ingestion

## Scope and inputs

The three Tome of Beasts runners and Creature Codex runner emit validated creature datasets.
Use the [ingest guide](./guides/ingest.md#tome-of-beasts-13-from-supplied-pdfs) for extraction commands and font requirements.
Check [source status](./source-status.md) and the console’s linked credits before distribution.
Validation does not grant publication approval.

| Runner | Arguments | Default output | Source identity |
| --- | --- | --- | --- |
| `node scripts/ingest-tob1.ts` | `<blocks.json> [out.json]` | `output/tob1-creatures.json` | `kobold-press-tob` |
| `node scripts/ingest-tob2.ts` | `<blocks.json> [out.json]` | `output/tob2-creatures.json` | `kobold-press-tob2` |
| `node scripts/ingest-tob3.ts` | `<blocks.json> [out.json]` | `output/tob3-creatures.json` | `kobold-press-tob3` |
| `node scripts/ingest-creature-codex.ts` | `[out.json] [cached-open5e.json]` | `output/creature-codex-creatures.json` | `kobold-press-ccdx` |

These remain direct Node commands; no npm names or positional arguments change.
All four retain edition `5.0`, SRD 5.1 spell references, name ordering, and compact JSON without a trailing newline.
Successful output values are not rewritten to satisfy validation.
Missing destination directories are created after validation succeeds.

Tome inputs are nonempty arrays of extracted 2014 stat blocks.
Mapping failures identify the source, record position, and name.
The reviewed extraction counts are 384, 389, and 395 OGC creatures for volumes 1, 2, and 3.
Those counts do not establish completeness for another printing or a partial extraction.
No new fixed full-book count gate is imposed on the Tome commands.
Book-specific Python extractors, libraries, font filters, exclusions, and known extraction gaps remain unchanged.

Creature Codex uses the 2018 OGC-only selection.
The closed 2024 revision and historical Open5e candidates remain outside this ingestion path.
The [Creature Codex guide](./guides/ingest.md#creature-codex-from-open5e) links its attribution record and live command.

## Creature Codex snapshots

A cache is one complete Open5e response object with an integer `count`, `next: null`, and a `results` array.
Its count must equal the number of supplied records.
A bare array, a mapped dataset, or one unfinished page is not complete cached evidence.
The cache argument never falls back to the network.
To retain a paginated live response, combine its records in page order into one complete response object before replaying it.
Preserve the source records; do not relabel a foreign record as Creature Codex.

Cached and live input use the [shared Open5e paginator](../src/compendium/open5ePagination.ts).
It checks response shape, count consistency, progress, endpoint and origin restrictions, and pagination cycles.
Only `next: null` ends pagination; empty or whitespace-only continuation strings fail page-shape validation in both modes.
Live retrieval follows `/v2/creatures/` pages with the required `document__key=ccdx` filter and existing User-Agent.
An omitted continuation filter is restored.
Every explicitly supplied filter value must equal `ccdx`, including duplicate parameters.
Empty or conflicting values fail before that page is fetched.
Identical duplicate values are normalized to one required filter.
The JSON format parameter is restored on every request.

All records must carry `document.key: "ccdx"`, a nonblank name, and a unique nonblank upstream key.
The adapter checks identity before exclusion, including the excluded individuals.
It rejects missing or malformed armor class, hit points, size, type, speed, and any of the six ability scores.
A speed map must contain at least one nonnegative integer movement value; zero remains valid.
Explicit speed units must be `feet`; an absent unit retains the existing feet assumption.
Other units fail without conversion.
Sizes and action sections must be supported by the existing 2014 adapter.
Supplied optional numeric values, dice text, languages, defenses, bonus maps, traits, and actions must have the consumed field shapes.
CR, XP, dice text, senses, and absent optional collections retain their existing omission behavior.
Supplied trait and action entries require names and description strings.
Omission still passes through the unchanged mapper and validator; it is not an exemption from validation errors.

Armor class, hit points, ability scores, movement, XP, passive Perception, and sense ranges require nonnegative integers.
Signed integer saving throws and skill bonuses remain supported.
Every retained record’s consumed numeric values must equal their mapped values before emission.
This catches sign loss, decimal truncation, exponential rendering loss, unsupported movement or bonus labels, and unsupported fractional CR values.
CR `0`, `1/8`, `1/4`, `1/2`, and representable integer CR values retain the existing mapping.
Zero movement and XP remain represented; zero sense ranges retain the existing absent-sense convention.
Action ordering remains a finite sorting value and does not pass through the integer stat-line grammar.
No new source maxima are imposed; existing validator checks still apply.

The exact, case-insensitive exclusion names remain:

- Monkey King
- Avatar of Shoth
- Ankou Soul Herald

Each must appear exactly once in the complete snapshot.
A missing, renamed, or duplicate excluded individual fails with an exclusion-drift report before replacement.
Review changed evidence before changing this source policy.
Ankou Soul Seeker remains included.
Excluded records are checked for identity and shape, then withheld before arithmetic validation of the mapped selection.
No additional books or identities are approved by these checks.

## Failure and review

All mapping and source checks finish before [validated emission](./dataset-emission.md) begins.
Every mapped record is validated before any destination directory is created or dataset is replaced.
Errors report record identity, field, and finding and exit nonzero without printing a successful mapping summary.
Existing destination bytes remain unchanged for malformed input, source-policy drift, mapping failure, or validation errors.
Warnings are reported and do not reject or correct the candidate.
Filesystem writes are not transactional; an I/O failure during writing can leave incomplete output.

No arithmetic corrections or new numerical exceptions are introduced.
The cited, exact-value [historical Open5e exception table](../src/compendium/open5eExceptions.ts) remains unchanged.
Its guards and [source evidence](./open5e-review.md#monstrous-menagerie) do not apply to these four source identities.
Unresolved HP/dice or saving-throw discrepancies remain validation findings and prevent replacement.
Compare them with the lawful primary source before requesting a separately reviewed exact-value exception or source correction.
Do not alter printed values or broaden exceptions just to obtain a successful run.

These commands do not emit failed candidates as diagnostic datasets.
If source review requires retaining a failed candidate elsewhere, label that artifact provisional and keep it separate from ingestion destinations.
Validation success does not change OGC-only scope, attribution duties, console registration, or publication decisions.

## Offline checks and parity limits

After [installation](./verification.md#install), run:

```sh
npm run verify
npm run schema:check
npm run verify:offline
npx vitest run tests/scripts/koboldIngest.test.ts tests/formats/parsingParity.test.ts tests/compendium/open5ePagination.test.ts
```

The command tests execute all four real CLI runners in temporary working directories.
Live API tests inject synthetic responses at the network boundary and never contact Open5e.
They cover pagination restrictions, cached completeness, malformed records, identity drift, exclusions, validation findings, and destination preservation.
They also check nested/default output, unchanged bytes, optional omissions, zero values, and warning-only success.
No test removes private inputs or existing generated datasets.

The Tome byte hashes retain the [pre-relocation baseline](../tests/fixtures/formats/parsing-baseline.json) from revision `5dc803b`.
They cover the shared synthetic 2014 fixture, not entire books.
The synthetic Codex snapshot has two retained creatures and the three excluded names with synthetic mechanics.
Its successful compact output was captured before hardening at `d39949d`:
`d1c1f919e93c9f897fa7df9701b14065ee8f8a41713cfd5658cd206230381c7e` (SHA-256).
The command tests pin this hash for cached and paginated live replay.

Purchased PDFs and complete retained Creature Codex snapshots are unavailable in this checkout.
No full-book or current-live-feed parity claim is made.
Maintainers must replay retained licensed inputs and compare counts, identities, exact bytes, exclusions, and validation findings before claiming full-source parity.
The [offline baseline](./verification.md#output-baselines) separately preserves original-content bytes and all six reference approval records.
No approval hash is renewed by this change.
