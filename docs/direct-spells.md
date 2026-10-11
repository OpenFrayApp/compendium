# Direct-source spell preparation

Use the [spell preparation guide](./guides/prepare-spells.md#spells-that-dont-suck-from-gm-binder) for inputs, commands, artifact paths, and attribution requirements.
Check [source status](./source-status.md) and the separate [reference publication record](./reference-spell-publication.md) before distributing a selection.

## Implementation map

| Responsibility                                            | Module                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Shared HTML extraction and GM Binder candidate review     | [`formats/gmBinderSpells.ts`](../src/formats/gmBinderSpells.ts)                       |
| Shared display-field mapping                              | [`formats/directSpells.ts`](../src/formats/directSpells.ts)                           |
| Spells That Don’t Suck credits, attribution, and identity | [`sources/spellsThatDontSuck.ts`](../src/compendium/sources/spellsThatDontSuck.ts)    |
| So Many Spells credits, attribution, and identity         | [`sources/soManySpells.ts`](../src/compendium/sources/soManySpells.ts)                |
| Kibbles v2.3 snapshot checks, credit chains, and findings | [`sources/kibblesV23Spells.ts`](../src/compendium/sources/kibblesV23Spells.ts)        |
| Shared GM Binder command replay and evidence hashing      | [`scripts/lib/prepare-gmbinder-spells.ts`](../scripts/lib/prepare-gmbinder-spells.ts) |
| Book-specific Kibbles PDF extraction                      | [`scripts/extract/kibbles-v23-spells.py`](../scripts/extract/kibbles-v23-spells.py)   |

Kibbles extraction remains independent of GM Binder HTML parsing.
It uses PyMuPDF with its own column, font, table, chapter, and stat-block handling.
All three adapters use the same display mapper.
Kibbles explicitly permits missing classes and records that omission for review.
GM Binder adapters require classes and their own contributor credits.

## Commands and artifacts

The existing npm names select runners under `scripts/prepare/`:

| Command                      | Runner                                                                    | Output directory                            |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| `prepare:stds-spells`        | [`spells-that-dont-suck.ts`](../scripts/prepare/spells-that-dont-suck.ts) | `output/spells-that-dont-suck-preparation/` |
| `prepare:so-many-spells`     | [`so-many-spells.ts`](../scripts/prepare/so-many-spells.ts)               | `output/so-many-spells-preparation/`        |
| `prepare:kibbles-v23-spells` | [`kibbles-v23-spells.ts`](../scripts/prepare/kibbles-v23-spells.ts)       | `output/kibbles-casting-v23-preparation/`   |

GM Binder commands retain `source.html`, `blocks.json`, `candidate-spells.json`, and `report.json`.
Kibbles preparation retains `snapshot.json`, `candidate-spells.json`, and `report.json`.
The snapshot pins the PDF hash; GM Binder reports hash the replayed HTML.
Serialization, spell ordering, source IDs, and attribution remain source-specific contracts.
Same-name spell entries from different sources remain independent.

Preparation retains findings and conservative publication blockers.
`--strict` exits nonzero while leaving provisional artifacts available for review.
Conditional advantage and unsupported mechanics remain prose.
Preparation infers neither a rules edition nor automation approval.
Pinned reference publication uses its independent approval gate.

## Verification and replacement coverage

Run the [public checks](./verification.md):

```sh
npm run verify
npm run verify:offline
npx vitest run tests/formats/gmBinderSpells.test.ts tests/formats/directSpells.test.ts tests/compendium/sources tests/scripts/prepareDirectSpells.test.ts
```

| Previous coverage                                                                          | Retained interface and coverage                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four general parser cases in `spellsThatDontSuck.test.ts`                                  | [`formats/gmBinderSpells.test.ts`](../tests/formats/gmBinderSpells.test.ts): tables, advice, page breaks, exact-name attachments, and later spells nested beneath stat blocks                                    |
| Ritual mapping and cantrip assertions from those parser cases                              | [`formats/directSpells.test.ts`](../tests/formats/directSpells.test.ts): ritual display, cantrip level, concentration, materials, source identity, and explicit missing-class policy                             |
| Three repeated offline CLI scenarios                                                       | [`prepareDirectSpells.test.ts`](../tests/scripts/prepareDirectSpells.test.ts): each npm name, offline replay, source hashes, attribution, strict failure, retained candidates, findings, and byte parity         |
| Spells That Don’t Suck mapping, replacement labels, and rejection cases                    | [`sources/spellsThatDontSuck.test.ts`](../tests/compendium/sources/spellsThatDontSuck.test.ts), with contributor-credit rejection for all required contributors                                                  |
| So Many Spells specializations, custom classes, same-name independence, and reserved names | [`sources/soManySpells.test.ts`](../tests/compendium/sources/soManySpells.test.ts)                                                                                                                               |
| Five Kibbles preparation cases                                                             | [`sources/kibblesV23Spells.test.ts`](../tests/compendium/sources/kibblesV23Spells.test.ts): snapshot drift, provenance, duplicate IDs, reserved names, psionics, missing classes, credits, and extraction issues |
| Seven Kibbles PDF extractor tests                                                          | [`test_extract_kibbles_v23_spells.py`](../tests/scripts/test_extract_kibbles_v23_spells.py), unchanged except the extractor path                                                                                 |

Shared parser tests additionally check removal of scripts, styles, art, decoration, and document commentary.
Source tests share only synthetic fixture builders in [`directSpellFixtures.ts`](../tests/helpers/directSpellFixtures.ts).
The unused `mapStdsSpell` forwarding wrapper has no repository consumers and no dedicated tests.
Its mapping behavior is covered at `mapDirectSpellBlock` and the retained source preparation interfaces.

[The direct-spell baseline](../tests/fixtures/verification/direct-spells-baseline.json) pins synthetic replay artifacts captured at revision `5dc803b`.
It checks exact candidate, block, and snapshot bytes.
Report comparisons omit only the variable GM Binder `preparedAt` timestamp.
`verify:offline` separately checks original datasets and all six approval records, including approval-module bytes.
These checks preserve existing approval hashes; they grant no renewed publication approval.

Complete GM Binder snapshots, the Kibbles PDF, and approved reference candidates are unavailable in this checkout.
Full-source byte parity requires replay against the maintainer’s retained inputs.
The [verification limits](./verification.md#limits-and-missing-parity-inputs) list those missing inputs.
Keep private evidence and generated artifacts outside Git.
