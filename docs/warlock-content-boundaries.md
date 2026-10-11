# Warlock spell content boundaries

## Scope

The 43 preserved drafts contain 38 located names and five excluded imports.
The source-boundary ledger reviews the three Grimoires and Liminal Magic separately.
This is licensing preparation, not reference publication or combat approval.

The combined future library label is **Warlock Grimoire**.
Liminal Magic remains a distinct attributed source within that display grouping.
The fourth Grimoire contributes no selected spell.

## Copyright notices

[Section 15 transcripts](./warlock-section-15.md) preserve all four relevant chains.
They contain 19, 17, 25, and three notices respectively.
The console’s credits include the complete OGL 1.0a and these separate chains.
The linked credits page renders that same file.
The OpenFray designation covers distributed spell rules and mechanical display fields.
It excludes Product Identity, code, artwork, and narrative text.

Attribution preparation does not state that any Warlock card is already distributed.
The supplied source declarations remain specific to each publication.

## Boundary decisions

Thirty-five bounded spell entries have a recorded content-boundary review.
Their header and body fidelity corrections still precede publication.
Seven entries have narrowly bounded omissions.
Those omissions remove separable setting descriptors, lore, or nonmechanical prefaces.
They preserve numbers, targets, components, saves, durations, and other requirements.

The named library descriptor in Exchanged Knowledge is separable from its rules.
Its information benefit, book costs, saves, penalties, and remedies remain intact.
The setting-use sentence in March of the Dead is omitted.
Its construct typing, zombie abilities, commands, and control period remain intact.
The setting-law passage in Vengeful Panoply is omitted.
Its ley-line bond requirements, weakening, recovery, attacks, and retaliation remain intact.

Three entries are withheld:

| Entry                  | Reason                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Reassemble             | The required material embeds a reserved setting identity. Replacing it would change a requirement.     |
| Skull Road             | Reserved destinations determine portal routing and travel. Generic replacements would change the rule. |
| Summon Clockwork Beast | The declaration abbreviates its name, and the source interleaves subclass rules with the spell.        |

The second volume explicitly designates the clockwork beast and Circle of the Evergyre.
Neither is imported by this spell review.
That supporting grant does not resolve the spell’s interleaved body or abbreviated designation.
Keep the spell withheld until those two source-evidence issues are resolved.

## Supporting rules

- Linked spells remain references. Another source’s text is not copied.
- Rise of the Green retains its treant reference. Later wiring must use separately licensed creature data.
- March of the Dead retains the source’s unusual construct/zombie distinction. No substitute creature is invented.
- Ley-line rules present in the designated spell stay prose. No supporting subsystem or character-build model is imported.
- Conditional Advantage and Disadvantage remain prose.
- Printed Fortitude saves, action terminology, and unusual durations are fidelity issues. They are not automatically normalized.

## Enforcement

`src/compendium/warlockContentBoundaries.ts` records every located source assignment,
printed page boundary, and complete-entry SHA-256.
It rejects changed text, swapped sources, unknown IDs, duplicates, and missing entries.
Reviewed omission ranges are applied only after the source hash matches.
Withheld entries return no text.
The five unsupplied imports are explicitly excluded.

The boundary preparation function always reports `publicationApproved: false`.
It creates no spell cards, approvals, stat blocks, or combat profiles.
Full source evidence and diagnostic output remain local and ignored.
