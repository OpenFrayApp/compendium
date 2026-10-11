# Author and check original content

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Original content (Brood & Bloom, The Waking Garden)

Author original creatures directly as typed `Creature[]` values in
`src/compendium/brood-and-bloom.ts` and `src/compendium/waking-garden.ts`.
Typechecking checks fields before ingest; the console consumes generated JSON.
These pipelines need no PDF or prose parser.
Ingest sorts entries, runs the shared invariant validator, and writes only when no errors remain.
Edit the typed sources; JSON is a build artifact.
Preserve the layered notices in each collection and the
[console’s original-content licensing record](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#openfray-original-content).

Brood & Bloom and On Strong Waters and Potent Simples also ship spells of their own. They
are authored the same way, in `src/compendium/brood-and-bloom-spells.ts` and
`src/compendium/strong-waters-spells.ts`, and gated by a spell-side validator
(`validateSpellDataset`) that checks what a spell can be silently wrong about: a
Concentration duration that repeats the word the card already prints, a ritual flag that
disagrees with the casting time, scaling steps at or below the spell's own level. The
spells speak to the caster directly: “You touch,” following the SRD’s spell voice.

```bash
mkdir -p output
npm run ingest:brood-and-bloom                       # → output/brood-and-bloom-creatures.json
npm run ingest:brood-and-bloom-spells                # → output/brood-and-bloom-spells.json
npm run ingest:strong-waters-spells                  # → output/strong-waters-spells.json
npm run ingest:waking-garden                         # → output/waking-garden-creatures.json
npm run validate -- output/brood-and-bloom-creatures.json   # invariants (also run inside ingest)
npm run validate -- --spells output/brood-and-bloom-spells.json
npm run validate -- --spells output/strong-waters-spells.json
# After publication review:
cp output/brood-and-bloom-*.json ../console/public/compendium/
```

## Estimating challenge ratings

The validator checks self-consistency; it does not determine challenge-rating balance.
`estimate:cr` estimates a defensive rating from effective hit points and armor class.
It estimates offense from three-round damage and attack bonus or save DC.
It flags entries more than two steps from their listed challenge rating:

```bash
npm run estimate:cr -- output/waking-garden-creatures.json      # default tolerance: 2
npm run estimate:cr -- output/brood-and-bloom-creatures.json 1.5
```

A flag prompts a review; it does not establish a final rating.
The estimate measures damage and durability.
Control effects, summoning, and terrain can produce a low estimate even when the listed rating is appropriate.
The estimator works on any creature dataset and is used when editing original libraries.

## Validate & diff

Self-consistency invariants (save = mod + PB, XP = CR table, HP = dice average, …)
plus a field-level diff against a reference dataset:

```bash
npm run validate -- output/srd-creatures.json                              # invariants only
npm run validate -- output/srd-creatures.json ../console/public/compendium/srd-creatures.json  # + diff
```

It exits non-zero on invariant errors, so it can gate an ingest.
