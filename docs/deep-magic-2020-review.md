# Deep Magic 2020 spell review

## Scope and status

Review only the 515 prepared `deepm` spell candidates against the 2020
_Deep Magic for 5th Edition_. The 2023 volumes are outside this review.
The corrected 503-card snapshot is approved for optional, manual-only reference publication.
Eleven custom-ritual spells remain withheld. This approval covers the pinned selection,
not the whole book or any combat automation.

## Pinned evidence

| Artifact                             | SHA-256                                                            |
| ------------------------------------ | ------------------------------------------------------------------ |
| Supplied 2020 PDF                    | `0f2e99f8184d8dbe93b9b1dcf0c90959cf7cd8c537d6ed327f1282e39fa486b8` |
| Prepared 515-card candidate snapshot | `29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6` |
| Approved 503-card candidate snapshot | `12b17d8c76deb0d6169b5ae5d46c5a7f98f205870ba64df464f85efc1bd9d0c7` |

The PDF contains 358 physical pages. Physical page 3, printed page 2,
identifies ©2020 Open Design LLC and ISBN `978-1-936781-31-7`.
Its Open Game Content declaration grants “the spells previously published and
the backer spells.” Other material is Product Identity. The declaration excludes
protected names, dialogue, plots, story elements, locations, characters, artwork,
sidebars, and trade dress, subject to previously designated Open Game Content.
Physical page 357 contains OGL 1.0a and the Section 15 chain.
Both pages have been checked visually against local rendered images.
The [Section 15 transcript](./deep-magic-2020-section-15.md) preserves all 35 notices
and has been checked against a high-resolution rendering.

Physical page 4 describes updated material from earlier publications, almost
200 new spells, and Kickstarter backer spells. The declaration does not identify
each spell’s provenance. This review accepts the matched Open5e subset as evidence
of selection under that grant. It does not infer a grant for every spell in the book.

## Review cache and replay

The PDF is image-only. `scripts/deepmagic.py` uses PyMuPDF and separate-column OCR.
It pins the PDF hash and caches physical pages 3–357 outside Git.
Decorative spell headings often fail OCR. Some spell-list entries split across
lines or contain recognition errors. OCR is evidence for review, not approved text.
The copyright page has full-width text that crosses the OCR column clips;
use its rendered page and the separate full-page license review.

```sh
python scripts/deepmagic.py /path/to/DeepMagic01.pdf \
  output/deep-magic-2020-review --tessdata /path/to/tessdata --workers 4
python scripts/audit-deepmagic.py /path/to/deepm/candidate-spells.json \
  output/deep-magic-2020-review output/deep-magic-2020-review/audit.json
python -m unittest discover -s tests/scripts -p test_deepmagic.py
node scripts/prepare-deep-magic-2020-spells.ts /path/to/deepm/candidate-spells.json
python scripts/compare-deepmagic.py \
  output/deep-magic-2020-preparation/candidate-spells.json \
  output/deep-magic-2020-review
npm run validate -- --spells output/deep-magic-2020-preparation/candidate-spells.json
```

The advisory audit gives page-location and class-list leads for each candidate.
It rejects changed input hashes and foreign PDF evidence. It always reports zero
approved spells. Similarity scores never authorize publication.

The body comparison accepts only the two pinned snapshots above. It writes
`body-comparison.json` for the original input and `corrected-body-comparison.json`
for the corrected preparation. Each report records its input and script hashes.
Publisher errata can produce expected differences from the scanned printing,
including Animated Scroll’s additional restriction and Thunder Bolt’s scaling.

## Verification

The current header and effect-text corrections passed 344 TypeScript tests,
15 Python tests, and typecheck. Standalone validation and the full corrected-body
comparison also passed. The regenerated snapshot and comparator script hashes
match the comparison report; `git diff --cached --check` passed for all staged changes.
Preparation and standalone spell validation report zero errors and zero warnings
for 503 provisional cards. These checks establish tooling and schema validity;
publication is authorized separately by the hash-pinned reference approval.

This worktree has no `format` script or `scripts/check-prose.mjs`.
Changed TypeScript and Markdown files are formatted with the parent workspace’s Prettier.
Documentation has been checked manually against the shared writing rules.

## Findings

- All 515 candidates have source-text page matches. Six have less than 50 percent
  overlap with a single page, primarily because their text crosses page boundaries.
- The candidate snapshot has 75 absent class lists and one component warning.
- Rejoining split OCR baselines resolves Alchemical Form, Compelling Fate, Puff of Smoke,
  and Void Strike. All 75 absent class lists now have exact source-list matches.
  These entries were visually checked in three contact sheets against the pinned PDF.
  `deepMagic2020Classes.ts` restores their printed assignments.
- The ordered-line audit reports 157 initial class-list differences, including those 75
  absent lists. Remaining differences include OCR omissions, spelling variants, and
  potential API inaccuracies. The reconciliation below resolves them with main and specialty lists.
- Blood Armor's header on physical page 319 specifies V/S and a casting prerequisite.
  The parenthetical prerequisite is not a material component. Preserve the prerequisite
  in the casting-time display when removing the misleading material description.
  The source-specific preparer applies this visually verified correction.
- Anchoring Rope on physical page 37 is one spell with action and reaction casting options.
  The API contains an extra reaction-only card. Preparation consolidates it into the
  base card with both casting options. The candidate scope hash and exact duplicate
  comparison protect that consolidation.
- Eleven spells reference custom Ritual Focus rules. They are held pending clearance
  for supporting ritual-focus and group-spellcasting systems outside the 2020 spell grant.
  Preparation retains 503 provisional cards after this hold and duplicate consolidation.

The original [Open5e Deep Magic import](https://github.com/open5e/open5e-api/blob/9ec5bb06a8550aca1b3dd9254591b974c83f7367/data/deep_magic/spells.json)
contains 514 entries and no per-spell original publication codes. It is a provenance
lead supporting the accepted selection basis. Its 514 names match the current candidates;
Anchoring Rope (Reaction) is the only additional current name.

The [community wiki's publication index](https://kpogl.wikidot.com/publication:deep-magic-for-5th-edition)
explicitly distinguishes approximately 516 open spells from approximately 270 non-open
new spells. This supports a provenance lead for the API subset, not blanket approval
for the book. Individual wiki pages carry earlier-publication and `backer-spell` tags.
`scripts/review-deepmagic-provenance.py` caches these leads outside Git for follow-up
against publisher evidence. Community tags do not replace the publisher's grant.
The completed pass has no fetch or identity errors and covers 514 unique spell URLs.
Sixty distinct spells carry backer tags. The other 454 carry earlier-publication leads.
The publisher’s [2020 contest guidance](https://koboldpress.com/entering-a-contest-here-are-some-helpful-tips/)
confirms that judges selected paid backer submissions for this book, but does not
name the selected spells. It does not verify the wiki’s 60-spell backer inventory.
A direct fetch of the 2019 campaign FAQ returned HTTP 403; no roster was recovered.

Four pages carry `oglmod` tags: Find Kin, Ire of the Mountain, Reaver Spirit,
and Staff of Violet Fire. Check these for deliberate source adaptations.

## Accepted licensing basis

Use the pinned Open5e `deepm` selection, matched against the supplied 2020 book,
as provenance evidence under the book’s previously-published and backer-spell grant.
Independent publisher confirmation for every selected spell is not a publication gate.
The original 514-name import and complete community provenance leads support this basis.
Open5e’s software license and API license labels do not supply the content grant.

The preparation report records this basis separately from publication approval.
It screens retained cards for specific named references and supporting-rule dependencies.
Flags identify review leads; they do not establish that a name is protected or a spell is excluded.
The current screen flags 17 of the 503 retained cards. It is bounded and does
not replace complete prose review.

All 17 flagged texts have been visually checked against their spell blocks.
Retain their spell-name and mythos references under the accepted Open5e selection basis.
This is an explicit reliance on that provenance basis, not independent publisher confirmation
of every proper name. Do not import character biographies, setting descriptions, or mythos sidebars.
Candle’s Insight’s non-mechanical setting-use paragraph is omitted from its card.

Five cards retain external supporting-rule references: Eldritch Communion, Sleep of the Deep,
Summon Eldritch Servitor, Warp Mind and Matter, and Yellow Sign.
They reference short-term, long-term, or indefinite madness.
Summon Eldritch Servitor also invokes Void taint; Warp Mind and Matter invokes flesh warping.
Keep these as manual references for a GM with the relevant rules.
The preparation imports neither supporting-rule definitions nor summoned-creature stat blocks.
The spells-only grant does not authorize copying separate supporting chapters.
These references do not add automation or establish a license for the referenced systems.
The eleven custom-ritual holds remain withheld.

`deepMagic2020Licensing.ts` pins the reviewed identities, body hashes, and physical pages.
Changed names or effect text reopen a flagged decision, even if its keyword has disappeared.
All 17 current findings are reviewed under the accepted basis; zero exception findings remain pending.
These decisions support the pinned manual-reference approval alongside the content review below.

Physical page 338 describes mythos learning restrictions and protection against
sanity loss through Wisdom or arcane wards. Those supporting rules remain outside this spell-card preparation.
Torrent of Fire’s ley-line sentence supplies flavor; its effect specifies a cone,
damage, saving throw, and scaling without requiring a ley-line subsystem.

The console integration supplies the full OGL, verified Section 15 chain, OpenFray’s OGC
designation, source registration, and independent manual verdicts.

## Visually checked header flags

All ten recorded advisory header flags have been checked against the pinned PDF:

| Spell      | Physical page | Visual finding                                                                                                         |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Bloodshot  | 320           | Components are V/S. Printed range is 30 feet; preparation corrects the API’s 40 feet.                                  |
| Decelerate | 259           | Components are V/S/M (a toy top). The advisory excerpt used Chronal Lance’s header; retain the candidate’s components. |
| Curse Ring | 233           | Printed school is Necromancy, matching the candidate. The advisory school flag came from OCR noise.                    |

The other checked flags match their printed schools: Blood Scarab (Necromancy,
physical page 319), By the Light of the Watchful Moon (Divination, page 48),
Gliding Step (Abjuration, page 76), Icy Manipulation (Transmutation, page 84),
Pummelstone (Conjuration, page 101), and Thin the Ice (Transmutation, page 114).
Encrypt / Decrypt’s Alteration correction on page 67 is already applied.

The 15 missing-header OCR findings are also resolved for the retained cards.
Afflict Line remains withheld; the other 14 headers have been checked visually.
The recovered locations are Ally Aegis (page 35), Althea’s Travel Tent (36),
Blood Puppet (319), Cloak of Shadow (249), Draconic Smite (201), Echoes of Steel (67),
Guiding Star (225), Heart-Seeking Arrow and Heartache (80), Salt Lash (168),
Sanguine Horror (321), Shifting the Odds (187), Time Vortex (263), and Torrent of Fire (205).
Their printed headers match preparation, including Torrent of Fire’s separately verified erratum.
Preparation now retains the printed area qualifiers in the range field as well as the effect text.

### Additional range and duration checks

`DEEP_MAGIC_2020_HEADER_CORRECTIONS` in `src/compendium/deepMagic2020Review.ts`
pins 30 visually checked field corrections by identity, original field value, and
physical source page: 25 ranges (Bloodshot plus 24 omitted area qualifiers), four
durations, and Encrypt / Decrypt’s school. The range checks include Caustic Torrent
(167), Echoes of Steel (67), Semblance of Dread and Sign of Koth (341), and Sleep of
the Deep (342), whose omitted qualifiers were not all recovered by the advisory OCR.

| Spell             | Physical page | Printed duration restored                                                                  |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------ |
| Bottled Arcana    | 166           | See below, rather than treating the bottle’s 24-hour window as the spell’s whole duration. |
| Curse of Yig      | 338           | Concentration, up to 10 minutes, not 1 hour.                                               |
| Glyph of Shifting | 76            | 24 hours, not Instantaneous.                                                               |
| Harry             | 79            | Concentration, up to 1 hour, not the API’s contradictory Instantaneous.                    |

Conjure Undead’s range is 30 feet on physical page 55; the advisory 60-foot reading
is an OCR error. Delay Potion’s header says “1 hour (see below)” on physical page 167;
retain the normalized 1-hour field and the complete explanation in the body.
Staff of Violet Fire’s duration on physical page 109 refers to its description.
Retain the existing concentration flag and normalized “up to special” duration;
the printed effects determine its ending, without an invented numeric time limit.

These checks resolve the recorded header findings for the pinned manual-reference snapshot.

## Publisher errata

The live [publisher errata](https://koboldpress.com/errata/) has a separate
_Deep Magic (2020)_ section dated May 29, 2025. Do not mix it with either 2023 volume.
The cached HTML SHA-256 is
`1194de2b030ad0b09fcb64fe25a8ca894c92485429a426ef5186319d75db9f4d`.
The preparer applies the six applicable non-held spell corrections:

| Spell           | Correction                                                                            |
| --------------- | ------------------------------------------------------------------------------------- |
| Animated Scroll | Limit the caster to one animated paper animal and allow recasting to change its form. |
| Memento Mori    | Set range to 5 feet and end the stun at the affected creature's next turn.            |
| Torrent of Fire | Set casting time to 1 action.                                                         |
| Thunder Bolt    | Add the publisher's cantrip damage scaling.                                           |
| Shadow Hands    | End the frightened condition at the affected creature's next turn.                    |
| Slither         | Add the restrictions on speech, objects, attacks, and spellcasting in shadow form.    |

The other spell corrections affecting this feed concern the held custom rituals.
Conjure Mock Animals, Extract Essence, Ice Burn, and Forceful Repurposing are absent
from this candidate set. Character-option, item, and supporting-system errata are
outside this preparation's scope.

## Book/API differences

Staff of Violet Fire lists “three effects” but supplies two effect bullets in the
supplied book and API. Reaver Spirit's higher-level text refers to slots above 2nd,
although the spell is 3rd level. Preserve these printed ambiguities pending errata.
Encrypt / Decrypt's printed school is “Alteration,” while the API says Transmutation.
Preparation also corrects **Instant Snare**: the printed scaling on physical page 87
adds a snare for each slot level above **2nd**, not the API’s **3rd**. The spell still
requires a slot of 3rd level or higher for that scaling.

Further visual comparison restores four effect-text details:

| Spell                 | Physical page | Correction                                                                                                                                           |
| --------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conjure Spectral Dead | 55            | Higher-level options include one ghost or a wight, not the API’s will-o’-wisp.                                                                       |
| Bloodhound            | 46            | Scaling applies to a slot of 3rd level **or higher**, not only a 3rd-level slot.                                                                     |
| Heart to Heart        | 80            | Restore “if one of you is reduced to 0 hit points.”                                                                                                  |
| Killing Fields        | 89            | Restore extra damage of the same type dealt by the weapon; separate Pack Hunters, Slaying, and Tracking subheads. Conditional advantage stays prose. |

The remaining table spot checks include Booster Shot (47), Curse of Incompetence
(57), Lovesick (93), Chaotic Vitality (184), and Snow Boulder (276). Their mechanics
match the printed tables. Preserve Curse of Incompetence’s −5 penalty and Chaotic
Vitality’s printed “Size” table heading; neither is silently rewritten.

Visual comparison also verifies these API-only additions:

| Spell             | Physical pages | Removed API-only text                                                                                                                     |
| ----------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Hobble Mount      | 81–82          | The GM mount-classification sentence and higher-level scaling paragraph; neither appears before the next printed spell.                   |
| Mass Hobble Mount | 95             | The GM mount-classification sentence and higher-level scaling paragraph; the printed block ends after 4d6 bludgeoning damage.             |
| Drown             | 65–66          | An API editorial note linking to a different Midgard Heroes Handbook spell. The printed saving-throw repetition and scaling are retained. |
| Freeze Blood      | 272            | An API editorial note about an older spell level and damage value. The printed 3rd-level, 2d6 version is retained.                        |

The completed full pass, before the repeated-anchor fix, processed 515 candidates
without errors: 203 normalized bodies
matched exactly, and 301 scored at least 0.9 but below 1.0. The other 11 require
particular care with page boundaries, tables, artwork, and API-only text. These
counts concern the original snapshot, not approval or the corrected preparation.

The mechanics comparison needs whole-body ranking: Decay and Caustic Touch share
opening wording, so opening similarity alone selected the wrong spell. Decay was
visually located on physical page 60; its printed damage is the API’s 1d10.
A repeated phrase earlier in the same column also contaminated its excerpt;
comparison now considers every occurrence of an opening anchor. A separate
`corrected-body-spot-checks.json` records six source-located checks against the
corrected preparation, pinned to its hash and the comparison script hash.
Hobble Mount, Mass Hobble Mount, and Freeze Blood now match their normalized source
bodies exactly. Instant Snare, Drown, and Decay retain OCR or display-markup differences.
These spot checks remain advisory. Their input hash predates the Bloodshot range
correction.

The previous full corrected-body pass covered all 503 cards in snapshot
`139eb450396c653e687263211c109038c8bcd09a6cb68220c6e746decf16133d`,
using the repeated-anchor fix. It has zero comparison
errors: 204 normalized bodies match exactly, 290 score at least 0.9 below 1.0,
and nine score below 0.9. Its input predates the transcription and class-spelling corrections below.

The comparison reports 205 scores rounded to 1.0, 289 near matches
(at least 0.9 but below 1.0), nine below 0.9, and zero comparison errors.
Scores use three decimal places; a score of 1.0 can still contain a small OCR difference.
The report’s script SHA-256 is
`5f32b0032840a0ab80bacefcaae74bce44c9a046b88ae21c449e663d8fb125c7`.

Low scores include expected publisher-errata additions, OCR errors, table ordering,
and cross-page contamination. The exception checks below resolve these leads;
the advisory report still records zero approved cards.
Frenzied Bolt’s higher-level paragraph is present on physical page 185 after its
damage table, whereas the API puts it before the table. That ordering difference
is not missing mechanics and does not justify removing the paragraph.

### Lowest-confidence visual checks

All nine bodies scoring below 0.9 in that pass have been checked visually:

| Spell                         | Physical pages | Finding                                                                                                                  |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Uncontrollable Transformation | 188            | Wide-table OCR lost or reordered mutations. The ten printed outcomes match the candidate.                                |
| Bad Timing                    | 183            | The body crosses columns; the advisory excerpt included a spell list. Printed effect and headers match.                  |
| Thunder Bolt                  | 205            | Printed body matches before the separately verified publisher scaling erratum.                                           |
| Seed of Destruction           | 340–341        | The advisory excerpt included a mythos sidebar. Printed effect and headers match.                                        |
| Biting Arrow                  | 269            | The body crosses columns; the advisory excerpt included a spell list. Printed reaction damage and cantrip scaling match. |
| Acid Gate                     | 164            | The body crosses columns around a spell list. Printed effect and headers match.                                          |
| Animated Scroll               | 39             | Printed body matches before the separately verified publisher one-animal restriction.                                    |
| Frenzied Bolt                 | 185            | Scaling follows the table in print. Correct the API table’s “Poision” to printed “Poison.”                               |
| Awaken Object                 | 42             | Wide-table placement confused OCR ordering. All four sizes and their printed statistics match.                           |

These checks cover effect text and headers, including tables and cross-column continuations.
They do not independently approve class assignments or publication.
Hedren’s Birds of Clay on physical page 81 also corrects the API’s duplicated “to your.”
The printed Sorcerer class heading restores “Sorceror” on nine API cards without changing assignments.

### Class-list reconciliation

Class availability is reconciled against the visually checked main lists on physical
pages 7–33 and the applicable specialty lists. The preparer restores 75 missing lists,
corrects nine “Sorceror” labels, and changes 44 memberships across 38 existing cards.

| Class    | Membership corrections                                                                                                        | Source evidence                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Paladin  | Add ten missing assignments; remove Stanch and Vital Mark.                                                                    | Complete main list on pages 16–17; applicable clockwork, blood, and angelic lists. |
| Warlock  | Remove 16 non-printed assignments.                                                                                            | Main list on pages 23–27 and angelic, ring, winter, clockwork, and fiendish lists. |
| Sorcerer | Remove Blood and Steel, Calm of the Storm, Heartstop, Mass Surge Dampener, Paragon of Chaos, Surge Dampener, and Wild Shield. | Main list on pages 19–23; blood, chaos, and clockwork lists.                       |
| Cleric   | Remove Harry, Heartstop, Maim, and Misstep.                                                                                   | Main list on pages 10–13 and the clockwork list.                                   |
| Druid    | Remove Icicle Daggers.                                                                                                        | Main list on pages 13–16 and winter list on page 267.                              |
| Wizard   | Add Heart-Seeking Arrow; remove Nightfall, Seeping Death, and Stench of Rot.                                                  | Complete main list on pages 27–33.                                                 |

The remaining 33 differences from the advisory main-list extraction are explained:

| Retained assignments                               | Physical pages | Basis                                                                             |
| -------------------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| Analyze Device: Bard                               | 302            | Clockwork list supplements the main list.                                         |
| Avoid Grievous Injury: Bard/Warlock                | 8, 24          | Printed entries missed by OCR.                                                    |
| Avronin’s Astral Assembly: Warlock/Wizard          | 26, 32         | Printed entries missed by OCR.                                                    |
| Demon Within: Warlock/Wizard                       | 324–325        | Fiendish lists supplement the main list.                                          |
| Fusillade of Ice: Druid                            | 267            | Winter list supplements the main list.                                            |
| Glacial Cascade: Sorcerer/Wizard                   | 268–269        | Winter lists supplement the main lists.                                           |
| Gloomwrought Barrier: Wizard                       | 30             | Printed entry missed by OCR.                                                      |
| Guiding Star: Druid/Ranger                         | 223            | Illumination lists supplement the main lists.                                     |
| Hedren’s Birds of Clay: Wizard                     | 30             | Printed entry missed by OCR.                                                      |
| Hematomancy: Cleric/Sorcerer                       | 11, 21         | Printed entries missed by OCR.                                                    |
| Hero’s Steel: Bard/Paladin                         | 9, 17          | Printed entries missed by OCR.                                                    |
| Ill-Fated Word: Bard/Sorcerer/Wizard               | 8, 19, 28      | Printed entries missed by OCR.                                                    |
| Kobold’s Fury: Bard/Warlock                        | 8, 24          | Printed entries missed by OCR.                                                    |
| Searing Sun: Cleric/Druid                          | 223            | Illumination lists supplement the main lists.                                     |
| Steam Whistle: Warlock                             | 304            | Clockwork list supplements the main list.                                         |
| Eighteen mythos spells: additional learning access | 338            | Preserve the API’s broader class availability under the printed learning context. |

This reconciliation changes reference metadata only. It imports no class features,
feats, learning subsystems, or combat automation.

Not every class-list difference is an API error. The mythos section on physical
page 338 permits additional spellcasters under its learning rules, beyond the
main Wizard list. Such discrepancies need context rather than blanket replacement.

Preparation preserves the visually verified printed “Alteration” label. Do not infer
Transmutation without publisher correction.

## Final reference decision

Review combines full candidate/OCR comparison, word-level difference triage,
visual checks of substantive differences and tables, header checks, class reconciliation,
and the accepted selection basis. Similarity alone does not approve a spell.
The remaining differences include OCR glyph errors, omitted table headings,
formatting, reference substitutions, and source-boundary noise.

The final targeted pass checked Blood to Acid (165), the conjuration spells (53–55),
Going in Circles (77), Harry and Harrying Hounds (79), Ice Soldiers (83),
Lay to Rest and Life from Death (91), Maim (94), Monstrous Empathy (96),
Rain of Blades (102), Thin the Ice (114), Shadow Trove (253), and Wintry Glide (278).
Rain of Blades and Shadow Trove retain their complete printed effects despite reordered OCR.
Conjure Spectral Dead restores the printed ghost or wight options.
Summon references remain names and links; inline instructions referring to omitted stat blocks are not imported.
Small article, cosmetic, and display-format differences do not change mechanics.

Find Kin, Ire of the Mountain, Reaver Spirit, and Staff of Violet Fire match their
2020 spell blocks despite their community `oglmod` tags.
Reaver Spirit’s scaling and Staff of Violet Fire’s “three effects” remain printed ambiguities.
No supporting-system definitions, creature stat blocks, class features, or lore chapters are licensed by this approval.

`src/compendium/referenceSpellPublication.ts` pins the approved count and candidate hash.
Export validates the snapshot and adds edition 5.0; it rejects changed content, mechanics, editions, and unaccepted findings.
The console ships 503 independent manual verdicts, the complete OGL, all 35 notices,
and the OGC designation. Defaults remain unchanged.
The approval applies only to these spell reference cards. Any changed snapshot requires renewed review.

Existing reference libraries and the merged Tome of Heroes publication are unchanged.
