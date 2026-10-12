# Shared parsing formats

Compendium ingest owns the shared formats in `src/formats/`.
Source adapters own extraction, source identity, exclusions, attribution, corrections, and publication decisions.
Passing a parser test grants no publication approval.

## Public interfaces

| Module | Exports | Consumers |
| --- | --- | --- |
| [`statBlock2014.ts`](../src/formats/statBlock2014.ts) | `StatBlock2014`, `map2014StatBlock(block, source)` | Tome of Beasts 1, 2, and 3 ingest scripts; `open5e.ts`; `open5eCcdx.ts`; `khyberia.ts` |
| [`identity.ts`](../src/formats/identity.ts) | `slug(name)` | Shared 2014 mapping; shared innate casting; `srd52.ts`; `srd52spells.ts`; `directSpells.ts` |
| [`innateSpellcasting.ts`](../src/formats/innateSpellcasting.ts) | `parseSpellcasting(entry, spellSource)` | Shared 2014 action casting and SRD 2024 action casting |

`map2014StatBlock` requires the adapter’s source identity.
The Tome ingest scripts supply `kobold-press-tob`, `kobold-press-tob2`, and `kobold-press-tob3` explicitly.
The mapper retains edition `5.0` and spell references to `srd-5.1`.
Header, action, trait-casting, spell-list, and name-normalization helpers remain private.
Tests use the mapper and pipeline commands without additional helper exports.
No compatibility adapters remain.

`slug` preserves the existing lowercase, punctuation-to-hyphen conversion.
It does not choose a source or rewrite display names.
The casting parsers retain their edition-specific spell-reference handling, including SRD 2014 apostrophe removal.
The structured dnd5eapi adapter retains its API-provided identifiers and separate mapping.

## Grammar boundaries

The shared 2014 mapper reads conventional ability tables, “Melee Weapon Attack” prose, and “DC N Dexterity saving throw” clauses.
Its trait casting retains innate usage, slot pools, spell-name fixes, footnotes, and shared daily pools.
A multi-spell trait tier without “Each” retains its shared-pool flag.

Action-style innate casting retains its existing interpretation in both editions.
Its daily groups do not acquire the trait parser’s shared-pool flag.
Its default spell source remains `srd-5.2`; the 2014 mapper passes `srd-5.1`.
Do not substitute trait casting for action casting during relocation.

The 2024 header, attack, save, and recharge grammars remain in [`srd52.ts`](../src/compendium/srd52.ts).
They retain “Attack Roll,” “Saving Throw: DC,” flat damage, and SRD-specific errata.
The SRD spell parser remains in [`srd52spells.ts`](../src/compendium/srd52spells.ts); its existing bug is outside this relocation.
Conditional mechanics remain prose under each adapter’s existing rules.
Book-specific Python font filters and extraction libraries remain independent.
See the [ingest guide](./guides/ingest.md) for source inputs and extraction commands.

## Verification and parity

Shared mapper tests live in [`tests/formats/`](../tests/formats/).
The nine former Tome mapper tests retain their assertions at `map2014StatBlock`.
Source-specific mapper, attribution, exclusion, and command tests remain with their adapters.

`parsingParity.test.ts` adds seven tests at the mapper and command seams.
The [synthetic 2014 fixture](../tests/fixtures/formats/stat-block-2014.json) covers traits, slots, action casting, costs, and bulleted options.
The [byte baseline](../tests/fixtures/formats/parsing-baseline.json) was captured from the implementations at `5dc803b` using Node 24.21.0.
It pins all three Tome ingest commands on that fixture and Khyberia ingest on the existing licensed 21-creature fixture.
Command tests use temporary directories, preserving serialization and entry order.
The Khyberia command retains its existing one-warning result.

Run `npm run verify` and `npm run verify:offline` as described in the [verification guide](./verification.md).
The offline verification also pins authored collection bytes and reference publication approvals.
Full-source parity still requires the [missing licensed inputs and snapshots](./verification.md#limits-and-missing-parity-inputs).
These fixtures establish representative parity without renewing approval hashes.
