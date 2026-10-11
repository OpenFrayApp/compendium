# Warlock spell content boundaries

## Scope

The 43 preserved drafts contain 38 located names and five excluded imports.
The source-boundary ledger reviews the three Grimoires and Liminal Magic separately.
Thirty-five source-corrected references are selected for the console.
Their source-specific profiles use the existing casting and effect helpers.

The combined library label is **Warlock Grimoire**.
Liminal Magic remains a distinct attributed source within that display grouping.
The fourth Grimoire contributes no selected spell.

## Copyright notices

[Section 15 transcripts](./warlock-section-15.md) preserve all four relevant chains.
They contain 19, 17, 25, and three notices respectively.
The console’s credits include the complete OGL 1.0a and these separate chains.
The linked credits page renders that same file.
The OpenFray designation covers distributed spell rules and mechanical display fields.
It excludes Product Identity, code, artwork, and narrative text.

The console credits identify the 35-card selection and the withheld entries.
The supplied source declarations remain specific to each publication.

## Boundary decisions

Thirty-five bounded spell entries have a recorded content-boundary review.
The typed references restore source headers, material descriptions, and body variants.
Twelve entries lack an explicit class list; those class lists remain unset.
Zymurgic Aura’s unspecified material description remains unset.
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

## Source-corrected references and casting

`src/compendium/warlockGrimoireSpells.ts` contains the 35 typed reference cards.
`prepare:warlock-grimoire-spells` validates their fixed subset and writes candidates.
The reference export gate pins candidate SHA-256
`b4998d3f06a869cb81861c52bc863e5da090a1bfbe745b76870656d83fa3cd6f`.
It assigns edition 5.0 without adding mechanics to the reference data.

The console registers a source-specific verdict for every selected ID.
Eleven profiles provide ordinary saves or initial damage; ten provide creature reminders.
Fourteen utility profiles remain manual.
They do not fall back to same-name spells or trust injected template mechanics.

| Manual profile                                                                | Boundary                                                                      |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Abrupt Hug                                                                    | Uses another creature’s unarmed strike; a successful strike can then grapple. |
| Charming Aesthetics                                                           | Enchants plants or animals; the later inspection triggers the creature save.  |
| Commander’s Pavilion                                                          | Creates a shelter.                                                            |
| Door of the Far Traveler                                                      | Creates and attunes a travel portal.                                          |
| Ethereal Stairs                                                               | Creates stairs; later pursuit checks are conditional.                         |
| Inconspicuous Facade                                                          | Disguises a building.                                                         |
| March of the Dead                                                             | Animates corpses and supplies orders without importing creature stat blocks.  |
| Mirror Realm                                                                  | Creates a pocket-realm entrance.                                              |
| Order of Revenge                                                              | Enchants an object; its later trail and destruction rules are conditional.    |
| Pierce the Veil                                                               | Calls an entity for questions and responses.                                  |
| Rise of the Green                                                             | Combines a summon, terrain, and repeated turn-boundary saves.                 |
| Threshold Slip                                                                | Moves creatures through a chosen physical junction.                           |
| Toxic Pollen                                                                  | Prepares plants for a later poisoning trigger.                                |
| Who Goes There?                                                               | Reveals creature identity through a chosen illusion.                          |
| Warlock Grimoire stays opt-in and shares the Kobold Press emerald source tag. |

Bardo’s healing choice and spellcasting modifier remain manual.
Hypnagogia uses its printed Intelligence save and a chosen-mode reminder.
The profile does not apply every alternative condition together.
Devouring Darkness wires its initial save and damage; blindness exceptions and later pulses remain prose.
Reciprocating Portal records the return turn without dealing future falling damage at cast time.
Rive wires its initial ranged attack; its conditional planar damage and Stunned rider remain prose.
Fortitude saves are not converted to Constitution.
Summons, terrain, travel, triggered poison, class restrictions, and ley-line subsystems are not automated.

Eternal Echo’s unbounded Concentration uses a Special duration.
Storm of Axes retains its Concentration-plus-one-round timing as Special (+ 1 round).
Neither creates a fixed one-round concentration timer.
The lingering tail remains a manual rule.
