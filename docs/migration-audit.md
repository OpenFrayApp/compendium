# Compendium migration audit

## Scope and retained interfaces

The final consistency slice starts at integration `295779c` on `refactor/compendium-29`.
Issues #18–#28 are integrated; each slice passed its own checks before integration.
This audit changes navigation and public contributor checks only.
It grants no publication approval and changes no content, schema, source policy, or output baseline.

The [README layout](../README.md#repository-layout) maps sources, originals, shared formats, commands, tests, and publication responsibilities.
[Source status](./source-status.md) links current decisions and historical investigations.
[Reviewed spell preparation](./reviewed-spell-preparation.md) maps corrections and independent publication gates.

Inventory covered implementation imports/exports, tests, npm definitions, task guides, and known external public consumers.
Tracked-file searches in the available parent, console, site, and handbook checkouts found no imports of the retired compendium modules or wrappers.
The console consumes generated JSON; unknown external direct TypeScript consumers cannot be exhaustively inventoried.
They must follow the documented [originals](./guides/original-content.md#consumers-and-migration) and [format](./formats.md) import migrations.
All 22 npm names present at `5fc4624` remain supported and tested for presence.
Current Node npm runner paths and documented command coverage are checked by `npm run check:docs`.
This does not execute live source workflows or imply that missing licensed inputs are available.

No additional compatibility scaffolding is removed in this slice:

- The old Tome mapper, original-content forwarding paths, orchestration-owned Open5e aliases, and `mapStdsSpell` are already absent.
- Withdrawn Tal’Dorei positive metadata and provisional labels are already absent. Rejection and historical evidence remain.
- Deep Magic and Tome of Heroes review-table re-exports have command/test callers. Their stable interfaces remain.
- `src/compendium/libraries.ts` is an immutable schema dependency, not unused migration scaffolding.
- Source-specific parsing, PDF filters, correction evidence, and unique validator tests remain independent.

## Removed and consolidated test accounting

The inventory compares tracked tests against `5fc4624`, including renamed files and cases consolidated within retained suites.
No test is removed in the final consistency slice.

| Previous coverage                                                                                               | Retained behavior or obsolete requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four Khyberia Python extractor cases under `tests/compendium/` (#18)                                            | Exact relocation to [test_extract_khyberia.py](../tests/scripts/test_extract_khyberia.py); all 34 Python cases remain discoverable.                                                                                                                                                                                                                                                                                                                                                             |
| Nine `tob3.test.ts` mapper cases (#21)                                                                          | [statBlock2014.test.ts](../tests/formats/statBlock2014.test.ts) retains assertions with explicit source identity. Seven [parsing parity cases](../tests/formats/parsingParity.test.ts) supplement them.                                                                                                                                                                                                                                                                                         |
| Creature page/JSON, malformed/count/progress, external URL/cycle cases; spell pagination failure scenario (#22) | [Shared paginator tests](../tests/compendium/open5ePagination.test.ts) retain each safeguard. [Creature adapters](../tests/compendium/open5ePreparation.test.ts) and [spell adapters](../tests/compendium/open5eSpells.test.ts) retain endpoint, source-filter, mixed-response, and exclusion restrictions.                                                                                                                                                                                     |
| One multipurpose Open5e spell CLI scenario (#22)                                                                | Six [named command cases](../tests/compendium/prepareOpen5eSpellsCli.test.ts) retain filtering/inventory, same-name independence, validator success/failure, strict exit/artifact retention, legacy recovery/evidence, and SRD rejection.                                                                                                                                                                                                                                                       |
| Five positive Tal’Dorei save-label cases (#22)                                                                  | Obsolete withdrawn-source provisional labels: Stoneguard STR/CON/WIS and Waverider CON/WIS. Exact rows remain in immutable history `5dc803b`; [withdrawn review](./open5e-review.md#taldorei-campaign-setting-removed-from-scope) remains linked. Adapter and [CLI rejection](../tests/compendium/prepareOpen5eCli.test.ts) remain. Soul Eater, Miremuck, and Yobbo exact-input findings remain tested.                                                                                         |
| Twelve repeated original-library invariant cases (#23); original test paths (#24)                               | [originalLibraries.test.ts](../tests/originals/originalLibraries.test.ts) retains count/uniqueness, validation, source/ID, and edition for all four datasets. Waking Garden, Brood & Bloom creatures/spells, and Strong Waters each retain three invariant cases. Collection suites retain lore, Lazaret consistency, cross-spell references, named book promises, and no-cantrip behavior. Four [aggregate hashes](../tests/originals/collections.test.ts) pin every field and authored order. |
| Four general STDS parser cases and their ritual/cantrip assertions (#27)                                        | [GM Binder parsing](../tests/formats/gmBinderSpells.test.ts) retains tables, advice, page breaks, exact-name attachments, nested metadata, and later nested spells. [Direct mapping](../tests/formats/directSpells.test.ts) retains ritual/cantrip display and field policies.                                                                                                                                                                                                                  |
| Three repeated direct-spell CLI scenarios (#27)                                                                 | Nine [command cases](../tests/scripts/prepareDirectSpells.test.ts) retain each npm name, offline bytes, evidence hashes, attribution, strict failure, candidates/findings, withheld fields/extraction issues, and unattached blocks.                                                                                                                                                                                                                                                            |
| Remaining STDS, So Many Spells, and five Kibbles preparation cases; seven Kibbles extractor cases (#27)         | [Source adapter suites](../tests/compendium/sources/) retain contributor credits, replacement labels, custom classes, same-name independence, reserved-name rejection, provenance/snapshot drift, duplicate IDs, psionics, missing classes, and extraction issues. Python cases retain assertions with the moved extractor path. [Detailed accounting](./direct-spells.md#verification-and-replacement-coverage).                                                                               |
| Unused `mapStdsSpell` forwarding wrapper (#27)                                                                  | No dedicated tests or repository callers existed. Direct mapping and source preparation retain its behavior.                                                                                                                                                                                                                                                                                                                                                                                    |
| Six Deep Magic class wrappers and table-derived cases (#28)                                                     | [Unified reconciliation](../tests/compendium/deepMagic2020Review.test.ts): 38 independent cards cover all 44 memberships (Paladin 12, Warlock 16, Sorcerer 7, Cleric 4, Druid 1, Wizard 4). Unified scope/unrelated/non-mutation/repeat checks and 13 named OCR/specialty exception cases retain old behavior. [Detailed accounting](./reviewed-spell-preparation.md#verification-and-replacement-coverage).                                                                                    |
| Reference publication and validator coverage (#28)                                                              | Existing count/hash/warning checks remain. Six per-source gate cases and [export CLI preflight](../tests/scripts/exportReferenceSpells.test.ts) supplement them. Unique Special-duration, licensing, exclusion, errata, header, transcription, missing-list, Tome of Heroes, and Warlock requirements remain.                                                                                                                                                                                   |

Schema synchronization (#20), SRD hardening (#25), and Kobold hardening (#26) add coverage without deleting existing requirements.
Fewer tests or files are not an acceptance target.

## Independently green gates

Counts below record each slice’s final reported run, not additive totals or permanent requirements.
Each row also passed typechecking and the available original-output/approval baselines.
All rows retain 34 Python tests; #19 ran TypeScript, typecheck, and Python commands separately before unified verification integration.

| Slice                                        | Reviewed implementation tip | TypeScript tests/files |
| -------------------------------------------- | --------------------------- | ---------------------- |
| #18 verification                             | `732536c`                   | 408/35                 |
| #19 navigation                               | `e39b8a0`                   | 397/31                 |
| #20 schema                                   | `77b78f2`                   | 426/36                 |
| #21 shared formats                           | `797248d`                   | 415/36                 |
| #22 Open5e infrastructure                    | `72a06cb`                   | 438/36                 |
| #23 dataset emission                         | `373421d`                   | 429/38                 |
| #24 originals                                | `7b8cb4a`                   | 412/36                 |
| #27 direct spells                            | `61d7837`                   | 496/44                 |
| #28 reviewed spells                          | `eec21ac`                   | 506/42                 |
| #25 SRD                                      | `26305cf`                   | 541/47                 |
| #26 Kobold                                   | `838c990`                   | 623/48                 |
| Kobold review fixes, integrated at `295779c` | `95dfb60`                   | 689/48                 |

Public guides retain the owning behavioral and parity evidence.
The final consistency run passes 693 TypeScript tests across 49 files, 34 Python tests, and typechecking.
`schema:check`, `verify:offline`, and `check:docs` pass after merging the latest local integration.
A fresh public-only Git clone installs locked npm and pinned Python dependencies successfully.
With all networking denied by macOS `sandbox-exec`, that clone passes every verification gate and the Waking Garden ingest/validate example.
The example emits 67 creatures with no findings; no repository `output/` directory is created.
The first consistency commit’s public documentation check also passes independently.
Independent acceptance review of the final consistency slice remains required.

## Available parity and deliberate failure changes

[The offline baseline](../tests/fixtures/verification/offline-baseline.json) remains unchanged:

| Dataset                 | Count | Exact output SHA-256                                               |
| ----------------------- | ----: | ------------------------------------------------------------------ |
| Waking Garden creatures |    67 | `efaef2f39c1f13a877fa3aee26c35082233da3d56b143580e0d459d74ccd24da` |
| Brood & Bloom creatures |    67 | `c4554c962f5bd0344450fdfd3730d71cdd15463e086d5edcaba8113e03331e8a` |
| Brood & Bloom spells    |    23 | `9f7884a9519e308dc7e18849d6251e90f714f173af08ccf177ed8441c485048e` |
| Strong Waters spells    |    11 | `b04b3d479c562894f22931e9ab8b71f2791c3b6df29d253e76f687150d2936fa` |

All six approval hashes, counts, editions, accepted warnings, and approval-module bytes remain unchanged.
The baseline approval-module SHA-256 is `df7fa338c7bc5bd32b10c8246d6c9630703c13b78881db00ecddf8dd3c7aaea9`.
Available Warlock export bytes retain SHA-256 `ff4a7b2c6b367e5452d582c979fc12bbdff052fe19fc57f030416e651ac55b17`.
[Format](./formats.md#verification-and-parity), [direct-spell](./direct-spells.md#verification-and-replacement-coverage), [SRD](./srd-ingestion.md), and [Kobold](./kobold-ingestion.md) guides record unchanged representative fixture baselines.
Open5e’s structural slice compared 20 nonlegacy and 22 legacy synthetic artifacts directly against `5dc803b`.
These successful fixture comparisons do not establish full-book or current-live-feed parity.

The immutable console schema revision remains `11447715099b3ef4049bc32dc241d0076f019346`.
[Schema provenance](../schema-provenance.json) pins six complete upstream files, including required dependencies.
The drift check is offline; no mutable sibling schema supplies authority.
Legal transcripts, licensing history, withdrawn-source evidence, and production approval bytes are preserved.

Previously reviewed failure changes remain intentional:

- Originals, SRD, and Kobold validate before directory creation or output replacement.
- SRD 2014 rejects unexpected mapping omissions and validates both datasets before replacing either.
- Open5e restores omitted required filters and rejects changed, empty, or conflicting explicit values before fetching.
- Codex cached/live inputs enforce equivalent completeness, shape, source identity, exclusions, and numeric fidelity.
- Blank pagination continuations and unsupported Codex numeric representations fail without overwriting outputs.
- Preparation retains provisional artifacts and findings before strict failure; reference export retains independent selection preflight.

Filesystem failures during writes remain nontransactional.
The separate SRD spell-parser issue remains unresolved; stricter validation can reject affected candidates.
No new statistical correction, source exception, exclusion, approval, or edition is inferred.
Full-source parity requires the [missing licensed inputs and retained candidate snapshots](./verification.md#limits-and-missing-parity-inputs).
Maintainers must replay those lawful inputs before claiming complete source parity.

## PRIVATE retention inventory procedure

This is a procedure only. The migration does not enumerate, open, or delete ignored source inputs, outputs, caches, or agent state.
Keep any actual inventory outside Git under access controls appropriate to its licensed and private contents.

1. Obtain the owner’s permission to inventory specified directories. Do not traverse sibling repositories, worktrees, or unrelated files.
2. Privately record each approved artifact’s owner, purpose, source/license, snapshot provenance, size, hash where permitted, and recoverability.
3. Mark retention requirements for supplied PDFs, extraction/OCR evidence, approval-pinned candidates, generated datasets, caches, and local agent state.
4. Record dependencies between artifacts and source reviews. Identify irreplaceable inputs and backups before proposing cleanup.
5. Share only sanitized counts, hashes, exit statuses, and review findings. Keep filenames, locations, private text, and credentials private.
6. Make a separate retention decision with the owner. This procedure authorizes no deletion, movement, regeneration, or cache cleanup.

## Inherited debt and follow-up

[Tooling debt](../tests/fixtures/verification/tooling-debt.json) remains a historical baseline, not a suppression list.
No mass formatting or protected legal/history rewording is included.
Installation still reports seven npm advisories: one low, one moderate, three high, and two critical.
Full `format:check` reports 56 inherited file findings and exits nonzero; no files are rewritten.
Changed eligible files pass targeted formatting; scoped prose checking passes with four existing nonfatal contrast matches.
PyMuPDF’s `fitz` deprecation remains separate work.
Public documentation checking covers inline links and ATX headings; unsupported Markdown constructs require manual review.
All 16 unique contributor-navigation external URLs return HTTP 200 in the manual network check.
Historical publisher and investigation URLs are retained as evidence and are not exhaustively re-fetched.
All 26 documented direct Node/Python runner references resolve to tracked files.
Network-disabled verification is exercised on macOS; Linux and Windows are not independently exercised here.
Sibling repositories, deployment, and parent issue #17 remain unchanged.
