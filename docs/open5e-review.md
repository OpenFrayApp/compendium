# Open5e source review

This records the additional creature-library review for compendium tooling.
All datasets remain local candidates. No console registration or credits changes
are included. The requested publishing scope is Tome of Beasts 2023.
A5E, Black Flag, and Tal’Dorei records below are historical review artifacts.
Tal’Dorei is no longer accepted by the preparation CLI.

Replay the in-scope snapshot with `npm run prepare:open5e -- tob-2023 output/open5e-preparation/tob-2023/raw.json`.

## Evidence and licensing

### Monstrous Menagerie

The [Open5e document](https://api.open5e.com/v2/documents/a5e-mm/?format=json)
identifies the 2021 Monstrous Menagerie and OGL 1.0a.
The publisher separately licenses the [A5ESRD](https://a5esrd.com/a5esrd) under
CC-BY-4.0, ORC, and OGL. Those licenses apply to its SRD files, not automatically
to every record in the commercial-book feed.

Publisher PDFs used to verify transcription corrections:

- [Monsters A–F](https://a5esrd.com/s/a5e_srd_191_monsters_A-F.pdf)
- [Monsters G–Z](https://a5esrd.com/s/a5e_srd_192_monsters_G-Z.pdf)
- [Beasts and creatures](https://a5esrd.com/s/a5e_srd_20_beasts_creatures.pdf)
- [Nonplayer characters](https://a5esrd.com/s/a5e_srd_21_nonplayer_characters.pdf)
- [Legal information](https://a5esrd.com/s/Legal-Information.pdf)

`src/compendium/open5eCorrections.ts` records each corrected value and its citation.
Corrections check the expected input value and fail if that value changes upstream.
They do not replace published values solely to satisfy arithmetic invariants.
Hezrou’s CR and XP, Fallen Solar’s inherited statistics, and the Green Great
Wyrm’s inherited Charisma are corrected against the publisher’s SRD.

`src/compendium/open5eExceptions.ts` records verified published deviations.
These include retained saves on upgraded variants and printed HP/dice disagreements.
Validation retains each reviewed finding as a warning with its citation.
The remaining unverified HP findings are Miremuck Goblin King and Yobbo.
Their Open5e values are retained provisionally at the maintainer’s request.
Exact-input retention labels distinguish them from publisher-verified exceptions;
strict validation still reports these findings as errors.

The initial web PDF reader stopped at page 100. Verification of later entries uses
the complete publisher PDFs, extracted with the existing PyMuPDF CLI.
Reference PDFs and text stay under ignored `output/open5e-preparation/references/`.

The publisher’s required CC-BY attribution is:

> This work includes material taken from the A5E System Reference Document (A5ESRD) by EN Publishing and available at A5ESRD.com, based on Level Up: Advanced 5th Edition, available at www.levelup5e.com. The A5ESRD is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

Record the adaptation and transcription changes alongside that attribution when
publishing material verified against the CC-BY SRD.

Outstanding gates:

- Match the feed’s remaining material to the CC-BY SRD, or obtain the commercial
  edition’s OGC declaration and complete Section 15 chain before using its OGL route.
- Review expertise dice and elite-monster XP. The API’s flat fields omit some
  source mechanics; conditional advantage must remain prose.
- Verify the Miremuck Goblin King and Yobbo HP/dice pairs against an authorized
  source. Do not infer replacement numbers from the dice average.
- Resolve the unsupported Titanic size. These records are withheld from candidate
  JSON and retained in the raw snapshot. The vendored schema remains unchanged.

### Black Flag SRD

The publisher’s [release announcement](https://koboldpress.com/kobold-press-releases-the-black-flag-reference-document-bfrd-in-creative-commons-updated-with-new-material-for-gms/)
and [Creative Commons FAQ](https://koboldpress.com/wp-content/uploads/2025/07/Black-Flag-Creative-Commons-FAQ-v2.pdf)
confirm CC-BY-4.0 is available alongside ORC. Prefer CC-BY for the covered release.
The v1 API’s ORC metadata does not establish the current publisher’s only license.

The FAQ gives this attribution:

> This work includes material taken from the Black Flag Reference Document 1.0 (“BFRD 1.0”) by Kobold Press and available at https://koboldpress.com/Black-Flag-Roleplaying. The BFRD 1.0 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.
>
> Black Flag Roleplaying Reference Document v1.0, © Open Design LLC d/b/a Kobold Press

The feed identifies v0.2. Verify its material against the CC-BY release before
claiming that attribution covers the dataset. Art, maps, trade dress, trademarks,
and unlicensed logos are excluded.

The publisher’s [Aboleth](https://bfrd.net/creatures/aboleth) and
[Ancient Red Dragon](https://bfrd.net/creatures/ancient-red-dragon) pages publish
modifiers, not six ability scores. Open5e synthesizes scores from those modifiers.
Its API also loses Stealth DCs and changes some Perception values.
The mapper recovers Perception from checked v1 records.
The publisher’s [monster rules](https://bfrd.net/rules/monsters#ability-modifiers)
explain that the six modifiers apply directly to checks and saves.
They can already include proficiency; they are not ordinary score-derived modifiers.
Perception and Stealth use separate fixed values, calculated before that proficiency.

`source-statistics.json` preserves Open5e’s six modifiers separately from synthesized scores.
It retains v1 Perception and uses `null` for missing statistics.
Publisher-checked Aboleth values are +5, −1, +6, +8, +6, +4; Perception 20; Stealth 9.
Ancient Red Dragon values are +10, +7, +16, +4, +9, +13; Perception 26; Stealth 17.
These checks establish those statistics only, not fidelity of the entire stat blocks.
Stealth and publisher-evidence labels apply only when all six modifiers and Perception match.
Other Stealth values remain unverified and are not inferred from DEX.
The sidecar is tooling-only; candidate scores stay unchanged and validation remains strict.

Outstanding gates:

- Decide how the upstream console schema should represent Black Flag statistics.
  Do not fork `src/schema/` to bypass that decision.
- Recover missing source statistics and compare the feed’s release with BFRD 1.0.
- Preserve the exact attribution and identify changes when publishing.

### Tome of Beasts 1 (2023 Edition)

The [publisher’s product page](https://koboldpress.com/kpstore/product/preorder-tome-of-beasts-1-2023-edition-pdf/)
confirms this is a revision of the original book.
The [Open5e document](https://api.open5e.com/v2/documents/tob-2023/?format=json)
identifies OGL 1.0a. Its metadata is insufficient to establish the complete
reuse designation and attribution chain.

The [authorized retailer sample](https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/190499-sample.pdf)
contains the 2023 edition’s credits and reuse declaration on PDF page 2.
Its copyright is ©2023 Open Design LLC; the regular-edition ISBN is
978-1-950789-56-6. These establish the edition independently of the API metadata.

The declaration identifies monster names, descriptions, statistics, and abilities
as Open Game Content. It reserves proper names, setting material, artwork,
sidebars, and all text related to Archdevils, Demon Lords, Fey Ladies, and Fey Lords.

The adapter excludes the named rulers and their explicitly named spawn.
The 2023 table of contents identifies Ia’Affrat as an archdevil on page 90;
it is also excluded. Spawn of Akyishigal and Spawn of Arbeyach are withheld
conservatively under the related-text and proper-name restrictions.
Unrelated generic entries such as Krake Spawn and Bandit Lord remain candidates.
Every exclusion is listed in the generated report.

The six-page sample does not contain the OGL or Section 15. The publisher’s
[legal notices](https://koboldpress.com/legal-notices-and-guidelines/) list trademarks
but do not supply this edition’s attribution chain. Search-result summaries and
other sites’ abbreviated copyright notices do not replace the complete notice.

A further Section 15 search located this exact 2023-edition entry in
[KPOGL’s aggregate notice](https://kpogl.wikidot.com/legal:ogl) and
[Maatlock’s aggregate notice](https://maatlockstavern.com/licenses):

> Tome of Beasts 1 ©2023 Open Design LLC; Authors: Daniel Kahn, Jeff Lee, and Mike Welham.

Both pages combine notices from many products. Neither identifies which preceding
notices belong specifically to the 2023 book. The entry corroborates the edition’s
copyright attribution, but does not establish its complete upstream chain.

Other downstream notices differ: [Convoke](https://www.convokerpg.com/licenses)
repeats Open5e’s authorless metadata, while
[Encounter Clash](https://encounterclash.com/licenses) abbreviates the notice and omits
its year and authors. Those notices cannot establish verbatim completeness.
No reviewed online source resolved the complete-chain gate.

The publisher’s [errata](https://koboldpress.com/errata/) has a separate
**Tome of Beasts (2023)** section dated May 29, 2025.
Its page 379 correction gives Valkyrie saves Con +7, Int +5, Wis +8, Cha +8.
Its page 409 correction gives Dwarven Ringmage saves Int +7, Con +5, Wis +4.
The adapter applies these corrections with drift checks.

Outstanding gates:

- Obtain the complete 2023 Section 15 chain from an authorized source.
  The reuse declaration is verified; the attribution chain remains unresolved.
  Do not substitute another Tome’s notice.
- Review remaining creature prose for reserved names, setting references, and
  text related to the excluded rulers.
- Verify Soul Eater’s Constitution save against an authorized primary source.
  No matching correction was found in the publisher’s 2023 errata.
  Retain Open5e’s +5 provisionally with an unverified label; its validation error remains.

### Tal’Dorei Campaign Setting (removed from scope)

The [publisher’s release announcement](https://greenronin.com/blog/2017/06/01/critical-role-release-plan/)
identifies the 2017 edition. The [Open5e document](https://api.open5e.com/v2/documents/tdcs/?format=json)
identifies OGL 1.0a. This is a four-creature supplement, not a full bestiary.

The publisher’s [original-edition FAQ](https://greenroninstore.com/pages/faq-critical-role-campaign-setting)
links its 2017 print and PDF purchase routes. It supplies no reuse declaration or
Section 15 notice. Searches also surfaced third-party scans with no established
authorization; those were not used to clear the licensing gate.

Outstanding gates:

- Obtain the 2017 edition’s OGC/PI declaration and complete Section 15 chain from
  an authorized source. The Reborn edition cannot establish its licensing.
- Confirm which generic names are reusable. Do not include setting lore or art.
- Verify Stoneguard and Waverider saves, and the duplicated Flamecharm passage
  inside Firetamer’s Scimitar description.
  Retain the five unresolved saves provisionally with unverified labels; their validation errors remain.

## Tome of Heroes: source investigation

The publisher’s [product page](https://koboldpress.com/kpstore/product/tome-of-heroes-for-5th-edition/)
identifies DnD 5e compatibility and includes mounts and clockwork companions.
The [authorized retailer sample](https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/402102-sample.pdf)
identifies ©2022 Open Design LLC and ISBN 978-1-950789-30-6.
Its contents list places Creature Statistics on page 209.

The sample’s reuse declaration (printed page 3) explicitly designates races,
subclasses, feats, items, spells, and magic items as Open Game Content.
It excludes other material and several named magic and gunpowder subsystems.
Creature statistics are not explicitly listed. Their reuse requires verification
of the applicable designation; selling a VTT edition does not establish OGC status.

Checked Open5e endpoints:

- [`documents/toh`](https://api.open5e.com/v2/documents/toh/?format=json)
  identifies the 2022 DnD 5e book and OGL metadata.
- [`creatures?document__key=toh`](https://api.open5e.com/v2/creatures/?document__key=toh&limit=1&format=json)
  returns `count: 0`.
- The [Open5e source tree](https://github.com/open5e/open5e-api/tree/staging/data/v2/kobold-press/toh)
  contains player options and spells but no creature dataset.

Tome of Heroes is not a preparation candidate. An ingest needs an authorized
creature source, confirmed reuse coverage, and the complete Section 15 chain.
Spells remain outside this bestiary work.

## Verification and publishing gates

Preparation checks pagination counts, duplicate keys, document identity, and core
stats. Checked v1 records supply source pages and legendary budgets where available.
Offline replay performs no network requests.

The adapter restores action usage, legendary costs, abbreviated saves, and signed
attack bonuses. It retains spellcasting prose even when structured parsing fails.
Fidelity reports flag unsupported sections, multiple attacks, missing entries,
missing damage rolls, and changed action prose. They supplement manual review.

Default validation remains strict. Preparation and the validator CLI explicitly
apply the reviewed exceptions in `src/compendium/open5eExceptions.ts`.
A save exception checks the exact ID, source, ability score, save, and CR.
An HP exception checks the exact ID, source, HP total, and dice formula.
Any changed input stops the exception from applying. Duplicate IDs and unrelated
structural errors remain errors. CLI output lists every applied exception and citation.

After the source gates are resolved, generate final datasets, rerun tests and
validation, and review the final exclusions and attribution package. Console library
registration, shipped JSON, and credits remain a separate publishing change.
