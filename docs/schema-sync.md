# Schema synchronization

The console owns the creature and spell schema.
Change schema definitions in the console, review an immutable revision, then synchronize complete files here.
Do not edit vendored files, extract ingest-only types, or format their bytes.

## Pinned revision

[The provenance manifest](../schema-provenance.json) records the public console repository, full commit SHA, file paths, and exact-byte SHA-256 hashes.
The selected revision is [`11447715099b3ef4049bc32dc241d0076f019346`](https://github.com/OpenFrayApp/console/commit/11447715099b3ef4049bc32dc241d0076f019346).
It was the published `main` tip when selected.
Selection used public Git history and immutable Git objects, with each file independently compared against its public raw URL.
No console working-tree file supplied schema authority.

This revision keeps the existing source IDs, rules editions, required fields, and spell representation.
It includes additive changes missing from the previous vendor copy:

| File                          | Reviewed difference                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/schema/action.ts`        | Adds the console’s `isRollable` helper.                                                                    |
| `src/schema/creature.ts`      | Adds optional `derivedFrom`, `license`, and `imported` fields, with the license type import.               |
| `src/schema/primitives.ts`    | Adds console ability, skill, and damage helpers; formats `Size`; updates the licensing documentation link. |
| `src/schema/spell.ts`         | No byte changes.                                                                                           |
| `src/schema/license.ts`       | Required by `Creature`; copied in full, including its console runtime helpers.                             |
| `src/compendium/libraries.ts` | Required by the license module; its only import is the already vendored primitives file.                   |

The optional creature fields originate in console commit [`f47f059`](https://github.com/OpenFrayApp/console/commit/f47f059e8e47c75337e394a111958b676edc1c94).
That change explicitly avoids backfilling provenance into existing creatures.
Commit [`ad78d09`](https://github.com/OpenFrayApp/console/commit/ad78d09384919fc4fdf497f895190c2725de06b2) updates the primitives documentation link.
The selected published revision includes these changes without requiring mapper changes or console redesign.

All six files remain verbatim console-owned files.
The library module is a vendored schema dependency, not an ingest library registry or publication decision.
Ingest runners do not use its registration or license helpers.
Schema synchronization does not fill new fields, approve sources, change exclusions, or register console libraries.
Both schema files and the library dependency are excluded from local formatting.

## Check local drift offline

After installing repository dependencies, run from the repository root:

```sh
npm run schema:check
npm run verify
npm run verify:offline
```

`schema:check` reads the committed manifest and compares the local files’ exact-byte hashes.
It makes no network requests and requires no sibling console checkout.
It rejects missing files, changed hashes, and unrecorded files under `src/schema/`.
Diagnostics name the affected path and revision; changed-byte diagnostics also print expected and actual hashes.
Failure exits nonzero.

The public test suite runs the same command against isolated copies of the committed files with networking disabled.
It checks synchronized success, controlled drift, missing dependencies, and unrecorded schema additions.
Sync tests substitute immutable HTTP responses at the network boundary.
They verify exact restoration and preservation of local files when downloading or hash verification fails.
No existing tests are removed.

An offline pass establishes agreement with the reviewed manifest.
It does not discover newer upstream revisions or independently authenticate a changed manifest.
Review manifest changes against the console’s immutable Git objects or public raw bytes.

## Restore the recorded revision

Review or save local changes before running sync.
This command deliberately replaces the six recorded vendored files:

```sh
npm run schema:sync
npm run schema:check
```

Sync downloads each recorded path from `raw.githubusercontent.com/OpenFrayApp/console/<full-SHA>/<path>`.
It checks every HTTP response and exact-byte hash before writing any file.
A network failure, HTTP error, or hash mismatch preserves all local files.
It creates missing parent directories and leaves the provenance manifest unchanged.
It never deletes unrecorded files; the subsequent drift check reports them.
A filesystem failure during replacement can leave a partial restoration; rerun sync after resolving that failure.

## Review a new console revision

1. Select a published console commit and record its full SHA, not a branch name or working-tree state.
2. Inspect schema diffs and trace imports from `action.ts`, `creature.ts`, `primitives.ts`, and `spell.ts`.
3. Review content identity, required fields, editions, and compatibility before synchronizing.
4. Retrieve the complete schema files and dependency closure from immutable Git objects or public raw URLs.
5. Update the manifest’s revision, paths, and hashes from those upstream bytes; review that diff independently.
6. Update the sync script’s required file inventory if the console changes its dependency closure.
7. Run sync, drift checking, typechecking, the public suites, and offline byte comparisons.
8. Record the revision rationale and any unavailable source inputs in the change review.

Use read-only `git show <full-SHA>:<path>` against existing Git objects, or public URLs containing that same SHA.
Do not fetch into, change refs in, or copy working-tree files from a console checkout.
Keep schema synchronization separate from content or publication changes.

## Parity limits

The four available original datasets retain their recorded exact-byte hashes, record order, counts, and source identities.
All six reference publication records and the approval module bytes remain unchanged.
The [verification guide](./verification.md#limits-and-missing-parity-inputs) lists unavailable primary sources, snapshots, and approved reference candidate files.
Full-source and candidate-dataset parity require those retained inputs.
Synchronization does not renew publication approvals or change their hashes.
