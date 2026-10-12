# Basic Fantasy adaptations

**Uncatalogued Beasts** is the temporary title for 120 custom DnD 5.5 (2024 rules) creature blocks.
Their stable source ID is `basic-fantasy-adaptations`.
They adapt the Basic Fantasy fourth-edition monster chapter.
Console and site publication remains pending.

## Build and inspect

Use the pinned saved [monster chapter](https://www.basicfantasy.org/srd/monstersAll.html) and audited console libraries:

```bash
npm run ingest:basic-fantasy -- /path/to/monstersAll.html ../console/public/compendium
npm run validate -- output/basic-fantasy-creatures.json
npm run estimate:cr -- output/basic-fantasy-creatures.json
```

An optional third argument compares the older GitLab core:

```bash
npm run ingest:basic-fantasy -- /path/to/monstersAll.html ../console/public/compendium /path/to/osr-bestiary/bestiary/bfrpg/core
```

That checkout must match commit `4d2469efef15dc2d232ce150a7453fcbd1d48fea` of [osr-bestiary](https://gitlab.com/clayadavis/osr-bestiary).
Field Guides are outside the supplied HTML’s scope.
The comparison records displayed stat-row differences; it does not assert equivalence of lore or mechanics.

The runner writes these artifacts:

- `output/basic-fantasy-creatures.json`: the adapted creature array.
- `output/basic-fantasy-preparation/source.html`: unchanged saved input.
- `output/basic-fantasy-preparation/entries.json`: extracted tables and paragraphs.
- `output/basic-fantasy-preparation/report.json`: source dispositions, corrections, design notes, estimates, validation, attribution, and publication blockers.

Edit `src/compendium/basicFantasy.ts` to change a block.
Edit `basicFantasyReview.ts` to change a disposition.
The runner rejects changed HTML, compendium snapshots, and legacy snapshots until their reviews are renewed.
Source snapshots and generated JSON remain uncommitted build artifacts.

## Counterpart audit

The HTML contains 212 tagged sections: 252 stat-block columns and eight overviews.
Each source column has an explicit disposition:

| Disposition      | Source columns | Result                                   |
| ---------------- | -------------: | ---------------------------------------- |
| 2024 counterpart |            148 | Skipped, with resolving creature IDs     |
| Convert          |            101 | 120 adapted blocks                       |
| Excluded         |              3 | Permanently removed from this collection |
| Overview         |              8 | Retained as source context               |

Eight shipped libraries supply 2,319 records; their hashes are pinned in `basicFantasyPreparation.ts`.
A 2014-only counterpart never justifies skipping a 2024 adaptation.
The ingest checks the actual `edition` field of every counterpart, including authored aliases.
Named 2024 replacements such as Bugbear Warrior and Merfolk Skirmisher supply current evidence for matching species.

Giant Gecko, Giant Tuatara, and the venomous monitor variants have separate blocks.
The gecko climbs ceilings; the tuatara has two claws, a shearing bite, and cold tolerance.
Mountain Lion uses the 2024 Lion counterpart under the requested roster policy.
Strangle Vine is an explicit source alias for the newly authored 2024 Assassin Vine.
Caveman, Common Lizardfolk, Orc, and Rock Baboon retain source-specific adaptations.

The three reserved-IP-risk columns remain in the exclusion audit only.
They have no creature IDs and cannot enter the generated collection.
Their prior pending-review status does not authorize later inclusion.

Basic Fantasy’s “large,” “huge,” and “giant” labels are names, with different meanings from DnD size categories.
Body dimensions guide 2024 sizes.
Staff, Device, and Spell elementals receive three summon-strength bodies per missing species.

Source corrections remain visible:

- Cold and Wood elemental headers repeat “Earth”; Wood filter tags also repeat “Water.”
- The Lizard Man filter repeats the Common label; table headers distinguish the Subterranean variant.
- Owlbear repeats the Ostrich anchor, and the Dire Wolf column reads “Dire Wold.”
- The Ostrich/Emu Hit Dice row places both values in the first cell; the review identifies the intended 3/2 split.

## Conversion policy

Preserve attack choices, damage dice, attack counts, movement, and distinctive source abilities where they map to 2024 rules.
Use natural action names such as Headbutt and Gore.
A source choice between attacks remains a choice; it does not become an invented Multiattack.
Source Multiattacks name their distinct claws, bites, limbs, or weapons.
Conditional Advantage stays in prose.

BFRPG monster Hit Dice normally use d8s without Constitution modifiers.
The 2024 blocks use size-based Hit Dice, assigned ability scores, and proficiency-based attack bonuses and save DCs.
Hit Dice counts are chosen for the intended durability; copying a source count can inflate Hit Points substantially.
Cattle, Aurochs, and Bison retain the review sample’s 2d10+2, 3d10+6, and 4d10+8 formulas.
Their source averages are 11, 13.5, and 18 Hit Points respectively.
The sample’s high armor and stronger durability are offset by low damage and no control rider.
Other HP budgets and major armor departures are recorded in the design notes.

CR is assigned after the source mechanics are converted.
SRD 5.2 creatures supply comparison evidence, not replacement mechanics.
Source instant-death effects become bounded damage or staged conditions with recovery.
OSR attack penalties become 2024 conditions or conditional Disadvantage.
Source class saves, morale, treasure, and random population details remain in the source tables.
Each block’s notes identify resource, duration, target-limit, and counterplay departures.
Some variable source entries use one representative body: Blood Rose, Water Termite, and each Trollkin age band.

## Dragons and spellcasters

All seven source age categories remain separate for Cloud, Plains, and Sea Dragons.
Wyrmlings have no breath weapon.
Cloud Dragons select Cold Breath at age 2 and add Lightning Breath at age 4.
Those are reviewed exemplar choices; the source permits other borrowed breath pairs.
Sea Dragons have a steam cloud, aquatic movement, air breathing, and no tail attack.
Older dragons retain the source breath-shaping options.

Adult and older dragons receive three single-cost Legendary Action choices.
They use species attacks, movement, shape-changing, or selected spells.
Strong limited-repeat actions cannot recur before the dragon’s next turn.
There are no lair actions or elemental-damage Rend replacements.
Recharge 5–6 replaces source daily-HD breath uses and alternate-round cooldowns.
Cloud Lightning Breath has a separate 2/Day resource; it does not share the primary recharge.
Fixed 2024 daily spell selections represent spellcasting source individuals.
These choices replace source probabilities and player-style spell progression.
The selected spells stay within each source age's maximum spell level.
Younger dragon blocks are noncaster examples; adult and older blocks are caster examples.
The attack-only damage ceiling excludes spell damage and buffs.

Zombraire and Skeletaire use a Dagger or Spellcasting.
Their source projectile and weapon-type defenses remain explicit.
They have no invented Arcane Bolt, Undead Fortitude, or Bludgeoning vulnerability.

## Verification and limitations

The installed `dnd-create-monster` skill supplies 2024 design rules and SRD 5.2 benchmarks.
`basicFantasyDesign.ts` records each creature’s role, signature, comparables, and conversion tradeoffs.
The report preserves both raw CR-estimator results and explicitly reviewed discrepancies.
Future unreviewed discrepancies still fail ingest.

The Greater Basilisk has an explicit estimator exception.
The estimator mishandles ongoing-effect prose and omits toxic contact and petrification.
Its notes compare actual bite/venom damage, Armor Class, and Hit Points against 2024 control creatures.
The estimator also omits much ongoing damage, regeneration, reaction-only spores, control, and some spell damage.
It prices only one damaging Legendary Action per round; a dragon can spend three uses.
The review notes report source attack damage separately from the estimator’s parsed result.

Adult and older dragons intentionally use Dexterity modifier plus proficiency bonus for initiative, as specified by the skill.
The generic repository validator expects twice proficiency and reports 12 accepted warnings.
The ingest permits only those dragon initiative warnings; other issues still fail.
The skill validator and typecheck remain separate checks.

These are provisional conversions, not playtested or approved for publication.
Mathematical validation does not establish source fidelity or encounter balance.

## Licensing and publication

The fourth-edition text is **CC-BY-SA-4.0**, including ShareAlike obligations.
The [accessible preface mirror](https://jmhimara.github.io/bfrpg/) reproduces the source notice:
Copyright © 2006–2023 Chris Gonnerman and contributors.
John Atom (jmhimara) also licenses the HTML conversion under CC-BY-SA-4.0.
Confirm the official preface notice for the saved snapshot before publication.
GitLab’s older core supplies comparison evidence only; its text is not imported.
Kobold Press blocks supply counterpart history only; these adaptations do not copy their mechanics.

The adapted creature content is licensed under [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/).
The tooling remains AGPL-3.0-or-later.
Art, source lore, maps, and reserved third-party material are excluded.
Changes and attribution are recorded in the report and `basicFantasyAttribution`.
The Basic Fantasy project and Wizards of the Coast do not endorse these adaptations.

SRD terminology and comparison material also require this attribution:

> This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1")
> by Wizards of the Coast LLC, available at <https://www.dndbeyond.com/srd>. The SRD
> 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
> available at <https://creativecommons.org/licenses/by/4.0/legalcode>.

Before publishing, register the book in the console and site.
Add attribution, the changes notice, and ShareAlike terms to console `CREDITS.md` and in-app credits.
The report keeps `publishable: false` until these publication checks are complete.
