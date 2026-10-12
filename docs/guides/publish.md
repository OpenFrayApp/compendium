# Publish vetted datasets

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Publish reviewed reference spells

Six pinned snapshots are approved for opt-in reference cards:
Deep Magic 2020 (503), Kibbles v2.3 (295), Spells That Don’t Suck (181), So Many Spells (179), Tome of Heroes (90), and Warlock Grimoire (35).
Their [publication record](../reference-spell-publication.md) documents the
source hashes, source-specific decisions, attribution, and manual-only limits.
Preparation reports keep their conservative gates for future snapshots.

```bash
npm run export:reference-spells -- ../console/public/compendium
```

Export checks every selected candidate’s pinned hash and standard validation before writing any dataset.
See [reviewed spell preparation](../reviewed-spell-preparation.md#preparation-approval-and-casting) for the selection-preflight guarantee.
Accepted material-component warnings are limited to Bile Beam and Zymurgic Aura.
The console supplies source-specific casting verdicts and blocks same-name automation fallback.
Other Open5e and creature candidates remain outside this publication approval.

## Publishing to the app

Generated JSON lands in `output/` (gitignored). Copy the vetted files into the app:

```bash
cp output/srd-creatures.json output/srd-spells.json ../console/public/compendium/
```

Prepare the selected candidates with [spell preparation](./prepare-spells.md) and
[source-specific review](./review-spells.md) recipes before exporting.
The all-source export needs all six approved candidate files under `output/`.
Use `--source <approved-source>` to export one selection; examples in the review guide
use `kobold-press-deepm` and `kobold-press-wz`.
To check an export without touching console files, supply an isolated destination:

```sh
scratch=$(mktemp -d)
npm run export:reference-spells -- "$scratch/compendium" --source kobold-press-wz
```

The Warlock preparation is offline and writes its fixed candidate under `output/`.
The other selections require their pinned saved inputs.
Do not substitute another snapshot or renew a hash solely to make export pass.

## Complete the publication handoff

1. Follow the parent’s [content licensing checklist](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md).
2. Resolve source findings, exclusions, and attribution for the reviewed selection.
3. Run the generator, dataset validator, and relevant tests; estimate new or rebalanced original creatures.
4. Copy or export only vetted JSON into the console’s `public/compendium/`.
5. Update console library registration and any source-specific casting verdicts in the console repository.
6. Update the console’s [CREDITS.md](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md) and in-app notices.
7. Run the console formatter and relevant checks before committing the shipped datasets there.

Reference cards retain no embedded rollable mechanics.
Console runtime profiles require their own review and cannot borrow approval from a same-name spell.
Compendium exports do not register a library, update credits, or deploy OpenFray.
The [parent workspace](https://github.com/OpenFrayApp/openfray) records component revisions and owns assembled deployment.
