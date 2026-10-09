# Khyberia SRD: October 2023 creature review

## Reviewed source

- Supplied file: `Khyberia SRD 2023-10.pdf`, 14 physical pages.
- SHA-256: `738c28c69c459e2bf1b91e416aa8a7dd2d286ee1da32a2de48c3cb98acbfb0be`.
- Author: Nick Stefanski; source site: <https://www.khyberia.com>.
- This revision contains **21 creatures**. The earlier author-hosted seven-page
  SRD reviewed in `verified-additional-creature-sources.md` contains ten; it is not
  the input to this pipeline.

## License

Page 1 licenses the Khyberia SRD under CC-BY-4.0, allowing use of its content subject
  to attribution. The grant covers the SRD, including its original creature blocks;
  it is not merely a declaration about upstream SRD content.

Required Khyberia notice:

> This work includes material taken from the Khyberia SRD by Nick Stefanski, available at www.khyberia.com. The Khyberia SRD is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

The source also carries these upstream notices, retained in the generated
`ATTRIBUTION.md` and required alongside the library:

> This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

> This work includes material taken from the A5E System Reference Document (A5ESRD) by EN Publishing and available at A5ESRD.com, based on Level Up: Advanced 5th Edition, available at www.levelup5e.com. The A5ESRD is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

**Changes were made:** OpenFray extracted and restructured the stat blocks, normalized
line wrapping, retained the Chaos Swell table as a trait, and kept choices and
unsupported recovery rules in prose. Published statistics were not corrected.
No artwork or unrelated rules are included. Game content retains CC-BY-4.0;
the ingestion code’s AGPL license does not replace the content license.

## 5e compatibility

All 21 blocks use conventional 5e sizes, ability scores, AC, HP with Hit Dice,
attack bonuses, saving throw DCs, challenge ratings, and XP. Import them as
edition `5.0`, not as native 2024/5.5 stat blocks. They can be used in a 2024 game
in the same way as other 2014 creature blocks; this ingest does not rebalance or
convert them.

There are no expertise dice, strife scores, elite stat blocks, or Titanic sizes.
The `shaken` and `slowed` effects are defined inline. Hedron clockwork abilities
and b’lot shape changes also state their rules in the blocks. They require manual
application at the table, not a separate A5E system or creature library.

| Pages | Creatures |
|---|---|
| 2–4 | Frogoblin, Chorister, Faerie Knight, Hopper, Hunter, Princess |
| 5–9 | Cudrone, Dihedrone, Dodecatron, Hemicudrone, Icosahedrone, Octahedrone, Tetrahedrone, Trapezohedrone |
| 10–11 | Kyanos B’lot, Magentos B’lot, Xanthos B’lot |
| 12–14 | Muck Mephit, War Snail, Water Guardian, Wodyanoi |

## Fidelity and automation limits

- All six ability scores, source pages, traits, action sections, and their complete
  rules text survive extraction and mapping. Spellcasting prose remains alongside
  parsed spell lists to retain caster levels and restrictions.
- Club/shillelagh, versatile spear damage, and the b’lots’ elemental choices remain
  in prose. Structured damage is omitted for those attacks so mutually exclusive
  choices are neither added together nor silently assigned a default element.
- Ordinary attacks retain structured damage; hybrid weapons retain both reach
  and range. War Snail’s explicitly additive bludgeoning and piercing damage stays
  additive.
- Rest-based recovery remains in action names and prose. The schema cannot
  represent it, so it is not converted to a daily limit. Dice recharge is structured.
- Tetrahedrone’s three automatically hitting Magic Missile darts remain prose;
  they are not converted into one attack or one combined target’s damage roll.
- Water Guardian’s nonmagical physical resistance retains the qualifier for all
  three physical types. Its conditional invisibility remains prose.
- Conditional advantage, AC bonuses, shape changes, and Chaos Swell effects are
  not baked into base statistics. No new global condition types are introduced.

## Published inconsistencies retained

| Source | Finding | Handling |
|---|---|---|
| Frogoblin Hunter, p. 4 | Perception +3 but passive Perception 12, rather than 13 | Keep both; validator warning |
| Wodyanoi, p. 14 | Tusk prints `7 (2d6 + 4)`; the dice average is 11 | Keep the printed text and `2d6+4` roll; no speculative correction |
| Wodyanoi, p. 14 | Gyre calls for a Strength save without specifying a DC | Keep the rule and recharge; do not invent a structured save DC |

The Hunter’s warning is not suppressed. Wodyanoi’s issues are source-fidelity
findings outside the current invariant validator’s checks.

## Reproduction and checks

Run the commands in the [README](../README.md#khyberia-srd-from-a-supplied-pdf).
The per-book PyMuPDF extractor records the legal page and source digest. The
mapper rejects other revisions and incomplete creature lists. The generated
library has **21 creatures, zero invariant errors, and one warning**.

`tests/fixtures/khyberia/blocks.json` is an extraction fixture, not authored
OpenFray content or an independently edited dataset. Tests cover all blocks’
ability scores and text, damage alternatives, conditional defenses, recovery,
published discrepancies, revision gates, and the CLI’s attribution output.
The Python extractor tests cover fonts, page furniture, wrapped headings and
alignments, the Chaos Swell table, and incomplete blocks.
