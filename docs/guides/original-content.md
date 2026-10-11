# Author and check original content

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Typed authoring area

Author OpenFray collections in `src/originals/` as typed `Creature[]` or `Spell[]` values:

| Collection | Typed source | Public aggregate |
| --- | --- | --- |
| Brood & Bloom creatures | [brood-and-bloom.ts](../../src/originals/brood-and-bloom.ts) | `broodAndBloomCreatures` |
| Brood & Bloom spells | [brood-and-bloom-spells.ts](../../src/originals/brood-and-bloom-spells.ts) | `broodAndBloomSpells` |
| The Waking Garden creatures | [waking-garden.ts](../../src/originals/waking-garden.ts) | `wakingGardenCreatures` |
| On Strong Waters and Potent Simples spells | [strong-waters-spells.ts](../../src/originals/strong-waters-spells.ts) | `strongWatersSpells` |

Typechecking checks fields before ingest; the console consumes generated JSON.
These pipelines need no PDF or prose parser.
Ingest sorts entries, runs the shared invariant validator, and writes only when no errors remain.
Edit the typed sources; JSON is a build artifact.
Keep authored aggregate order, identifiers, source IDs, rules editions, and spell references stable during structural changes.

Preserve each source’s layered licensing notice and the
[console’s original-content licensing record](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#openfray-original-content).
Code uses AGPL-3.0-or-later; original mechanics use CC-BY-4.0 with attribution to OpenFray.
Creature descriptions and family lore remain protected prose, with all rights reserved.
Spell origin notes remain protected book prose outside these mechanics collections.

The spell-side validator (`validateSpellDataset`) checks Concentration duration wording, ritual flags against casting time, and scaling steps above the spell’s level.
Spells speak to the caster directly: “You touch,” following the SRD’s spell voice.

### Consumers and migration

The four ingest runners and collection tests import `src/originals/` directly.
The previous `src/compendium/` authoring paths have no forwarding modules: all repository callers moved together.
External tooling that imports typed collections must update its import paths; aggregate export names remain unchanged.
Existing npm command names, default output paths, sorting, validation, and serialization remain unchanged.

## Generate original datasets

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
