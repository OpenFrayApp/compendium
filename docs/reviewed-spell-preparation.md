# Reviewed spell preparation

Use the [review commands](./guides/review-spells.md) to prepare Deep Magic 2020, Tome of Heroes, and Warlock candidates.
Use the [publish guide](./guides/publish.md) to export an approved reference selection.
Run commands from the repository root after [setup](../README.md#setup).

## Ownership

| Source | Correction data and evidence | Transformation and command |
| --- | --- | --- |
| Deep Magic 2020 | [`deepMagic2020Corrections.ts`](../src/compendium/deepMagic2020Corrections.ts); [visual checks, errata, and class exceptions](./deep-magic-2020-review.md); [`deepMagic2020Licensing.ts`](../src/compendium/deepMagic2020Licensing.ts) | [`deepMagic2020Review.ts`](../src/compendium/deepMagic2020Review.ts), [`deepMagic2020Classes.ts`](../src/compendium/deepMagic2020Classes.ts); `npm run prepare:deep-magic-2020-spells` |
| Tome of Heroes | [`tomeOfHeroesCorrections.ts`](../src/compendium/tomeOfHeroesCorrections.ts), [`tomeOfHeroesClasses.ts`](../src/compendium/tomeOfHeroesClasses.ts); [source review](./open5e-5e-spell-publication.md#supplied-tome-of-heroes-declaration) | [`tomeOfHeroesReview.ts`](../src/compendium/tomeOfHeroesReview.ts); `npm run prepare:tome-of-heroes-spells` |
| Warlock Grimoire | [`warlockGrimoireSpells.ts`](../src/compendium/warlockGrimoireSpells.ts), [`warlockContentBoundaries.ts`](../src/compendium/warlockContentBoundaries.ts); [boundary decisions](./warlock-content-boundaries.md) | [`warlockGrimoireReview.ts`](../src/compendium/warlockGrimoireReview.ts); `npm run review:warlock-grimoire` and `npm run prepare:warlock-grimoire-spells` |

Deep Magic and Tome of Heroes correction tables contain reviewed values and exact text anchors.
Their review modules check pinned inputs and apply those corrections.
Warlock cards are already source-corrected typed entries; its separate boundary table records reviewed, withheld, and excluded entries.
The Warlock draft audit compares supplied source evidence without changing those cards.

Keep source-specific evidence with its owning source.
Preserve legal wording in the [Deep Magic](./deep-magic-2020-section-15.md), [Tome of Heroes](./tome-of-heroes-section-15.md), and [Warlock](./warlock-section-15.md) transcripts.
Conditional advantage and unsupported mechanics remain prose.

## Deep Magic reconciliation

`reconcileDeepMagic2020Classes` applies the Paladin, Warlock, Sorcerer, Cleric, Druid, and Wizard corrections in the existing preparation order.
It checks the source and reference-only scope, requires the reviewed prior membership, and preserves unrelated assignments without mutating inputs.
A corrected card cannot be reconciled again without an evidence-change error.

`restoreDeepMagic2020Classes` separately restores the 75 absent lists.
Preparation then corrects the nine class spellings before membership reconciliation.
This order preserves existing class array ordering and candidate serialization.
The [class-list review](./deep-magic-2020-review.md#class-list-reconciliation) records physical pages and retained OCR, specialty-list, and mythos exceptions.
The eleven custom-ritual holds and duplicate Anchoring Rope exclusion are unchanged.

## Preparation, approval, and casting

Preparation reports and source audits retain their provisional findings and conservative publication gates.
They do not approve a changed snapshot.
The [publication record](./reference-spell-publication.md) separately approves six exact reference-only candidate selections.
[`referenceSpellPublication.ts`](../src/compendium/referenceSpellPublication.ts) owns their unchanged hashes, counts, sources, editions, and accepted warnings.

`npm run export:reference-spells -- <destination> [--source <approved-source>]` checks every selected candidate before creating the destination or writing any dataset.
It rejects changed bytes, counts, source identities, embedded editions or mechanics, and unaccepted validation findings.
Only the documented material warnings for Zymurgic Aura and Bile Beam are accepted.
Export adds the reviewed edition and retains the existing compact JSON serialization.
A rejected selection leaves all preexisting destination datasets unchanged.
Filesystem failures during writing are outside this selection-preflight guarantee.

Do not renew hashes to accommodate refactoring or grant another selection approval.
Reference publication does not authorize console casting behavior.
Console library registration, casting verdicts, credits, publication, and deployment remain separate work under [domain ownership](./domain.md).

## Verification and replacement coverage

Run the focused public tests, then the full checks:

```sh
npx vitest run tests/compendium/deepMagic2020Review.test.ts tests/compendium/tomeOfHeroesReview.test.ts tests/compendium/warlockGrimoireSpells.test.ts tests/compendium/referenceSpellPublication.test.ts tests/scripts/exportReferenceSpells.test.ts
npm run verify
npm run verify:offline
```

| Consolidated coverage | Retained replacement |
| --- | --- |
| Six class forwarding interfaces and their table-derived correction cases | `deepMagic2020Review.test.ts`: 38 independently specified cards exercise all 44 memberships through `reconcileDeepMagic2020Classes`, including overlapping corrections |
| Separate Paladin scope and unrelated-assignment checks | Unified reconciliation scope, unchanged-object identity, non-mutation, unrelated fields, empty-list rejection, and repeat-application rejection |
| Separate Warlock, Sorcerer, Druid, Cleric, and Wizard exception checks | Named OCR/supplemental-list cases through the unified interface retain every previously tested exception assignment |

No validator, licensing, exclusion, errata, header, transcription, missing-list, Tome of Heroes, or Warlock test requirement was removed.
Header table traversal retains changed-identity and changed-field rejection.
Independent Bloodshot and Alteration expectations, publisher prose, and source-backed class expectations remain separate from production tables.
The approval tests exercise all six sources with isolated synthetic gate fixtures; production approvals are never modified.
Command tests use the actual approved Warlock bytes, a missing or changed later candidate, single-source drift, and unknown-source rejection.

The successful Warlock export SHA-256 is `ff4a7b2c6b367e5452d582c979fc12bbdff052fe19fc57f030416e651ac55b17`, captured before consolidation at `5dc803b`.
The command test checks those exact output bytes and preserves unrelated destination files.
The offline verifier also checks the approval module bytes and all six approval records against the existing baseline.

Full Deep Magic and Tome of Heroes pipeline parity requires their retained pinned candidates and licensed source evidence.
The remaining non-Warlock reference selections also require private candidate snapshots for a complete all-source export.
Public tests establish gate behavior; they cannot establish full-source byte parity without those inputs.
See the [verification limits](./verification.md#limits-and-missing-parity-inputs) before reporting full-source parity.
