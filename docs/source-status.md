# Source status

Use this index to distinguish shipped libraries, pinned reference approvals, and provisional evidence.
The linked reviews and publication records define each selection’s limits.
Counts in historical investigations describe inspected inputs; live API counts may change.
Validation success grants no publication approval.

## Established creature, SRD, and original libraries

The console’s [credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md) record distributed content and required notices.
These established libraries are outside the six-snapshot reference spell approval.

| Source | Current status | Authoritative record and recipe |
| --- | --- | --- |
| SRD 5.2.1 | Distributed CC-BY-4.0 creatures, spells, and conditions; official PDF is authoritative | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#system-reference-document-521-dd-2024), [PDF ingest](./guides/ingest.md#srd-521-from-the-official-pdf) |
| SRD 5.1 | Distributed under OpenFray’s CC-BY election; dnd5eapi supplies structured 2014 casting | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#system-reference-document-51-dd-2014), [API ingest](./guides/ingest.md#srd-51-from-dnd5eapi) |
| Tome of Beasts (2016) | Established OGC-only library under OGL 1.0a; known extraction gaps remain | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#tome-of-beasts-kobold-press), [book extractors](./guides/ingest.md#tome-of-beasts-13-from-supplied-pdfs) |
| Tome of Beasts 2 (2020) | Established OGC-only library under OGL 1.0a | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#tome-of-beasts-2-kobold-press), [book extractors](./guides/ingest.md#tome-of-beasts-13-from-supplied-pdfs) |
| Tome of Beasts 3 (2022) | Established OGC-only library under OGL 1.0a | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#tome-of-beasts-3-kobold-press), [book extractors](./guides/ingest.md#tome-of-beasts-13-from-supplied-pdfs) |
| Creature Codex (2018) | Established OGC-only library; 2024 revision is outside this pipeline | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#creature-codex-kobold-press), [Open5e ingest](./guides/ingest.md#creature-codex-from-open5e) |
| Khyberia SRD (October 2023) | Reviewed 21-creature CC-BY-4.0 selection; published inconsistencies retained | [Source review](./khyberia-review.md), [console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#khyberia-srd), [PDF ingest](./guides/ingest.md#khyberia-srd-from-a-supplied-pdf) |
| The Waking Garden | Typed original creatures; distributed under the original-content licensing record | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#openfray-original-content), [authoring](./guides/original-content.md) |
| Brood & Bloom | Typed original creatures and spells; distributed under the original-content licensing record | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#openfray-original-content), [authoring](./guides/original-content.md) |
| On Strong Waters and Potent Simples | Typed original spells and presets; no creature pipeline | [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md#openfray-original-content), [authoring](./guides/original-content.md) |

## Pinned reference spell approvals

The [publication record](./reference-spell-publication.md) and
[approval module](../src/compendium/referenceSpellPublication.ts) are authoritative for these snapshots.
Approval covers reference data without embedded rollable mechanics.
Console casting verdicts are separate, source-specific decisions.
Preparation findings for future snapshots remain conservative.

| Source | Current approved selection | Evidence and preparation |
| --- | --- | --- |
| Deep Magic 2020 | 503 cards; eleven custom rituals withheld; duplicate Anchoring Rope consolidated | [Decision](./reference-spell-publication.md#deep-magic-2020), [review](./deep-magic-2020-review.md), [Section 15](./deep-magic-2020-section-15.md), [recipe](./guides/review-spells.md#deep-magic-2020-reference-spells) |
| Kibbles’ Casting Compendium v2.3 | 295 cards; Bile Beam material warning accepted | [Decision](./reference-spell-publication.md#source-specific-decisions), [recipe and source](./guides/prepare-spells.md#kibbles-casting-compendium-v23) |
| Spells That Don’t Suck | 181 direct GM Binder cards; Open5e route excluded | [Decision](./reference-spell-publication.md#source-specific-decisions), [recipe and source](./guides/prepare-spells.md#spells-that-dont-suck-from-gm-binder) |
| So Many Spells | 179 direct GM Binder cards; Bind Lesser Fiend withheld | [Decision](./reference-spell-publication.md#source-specific-decisions), [recipe and source](./guides/prepare-spells.md#so-many-spells-from-gm-binder) |
| Tome of Heroes | 90 corrected cards; Deadly Salvo withheld; zero validation findings | [Decision](./reference-spell-publication.md#tome-of-heroes), [source review](./open5e-5e-spell-publication.md#supplied-tome-of-heroes-declaration), [Section 15](./tome-of-heroes-section-15.md), [recipe](./guides/review-spells.md#review-tome-of-heroes-against-the-publisher-pdf) |
| Warlock Grimoire | 35 corrected cards across three Grimoires and Liminal Magic; Zymurgic Aura warning accepted | [Decision](./reference-spell-publication.md#warlock-grimoire), [boundaries](./warlock-content-boundaries.md), [audit](./warlock-grimoire-review.md), [notices](./warlock-section-15.md), [recipe](./guides/review-spells.md#warlock-grimoire-source-review) |

## Provisional, excluded, and investigation-only sources

| Source or feed | Current status | Authoritative review or policy |
| --- | --- | --- |
| Monstrous Menagerie (`a5e-mm`) | Historical creature candidates only; edition mechanics and reuse coverage remain gates | [Creature review](./open5e-review.md#monstrous-menagerie) |
| Black Flag SRD (`bfrd`) | Historical creature candidates only; mechanics and feed comparison remain gates; inspected spell feeds empty | [Creature review](./open5e-review.md#black-flag-srd), [spell inventory](./open5e-5e-spell-publication.md#inventory) |
| Tome of Beasts 1 (2023) (`tob-2023`) | Removed from active batch and preview; explicit historical replay remains supported; no publication selection | [Creature review](./open5e-review.md#tome-of-beasts-1-2023-edition) |
| Tal’Dorei (`tdcs`) | Withdrawn; preparation rejects it | [Removal evidence](./open5e-review.md#taldorei-campaign-setting-removed-from-scope) |
| Tome of Heroes creatures | No preparation candidate or approval; inspected API feed empty; creature grant unresolved | [Creature investigation](./open5e-review.md#tome-of-heroes-source-investigation) |
| Deep Magic Extended (`deepmx`) | Mixed-source provisional spell feed; identities, declarations, and chains unresolved | [Import provenance and gates](./open5e-5e-spell-publication.md#recovered-import-provenance) |
| Warlock raw API (`wz`) | Historical 43 drafts remain unchanged; only the separate corrected 35-card selection is approved | [Import inventory](./open5e-5e-spell-publication.md), [four-volume audit](./warlock-grimoire-review.md) |
| Warlock Grimoire 4 | Negative inventory; contributes no selected spell; no transferred approval | [Audit](./warlock-grimoire-review.md#fourth-volume-negative-inventory-and-declaration) |
| Vault of Magic (`vom`) | Inspected spell and creature feeds empty; no approved selection | [Spell inventory](./open5e-5e-spell-publication.md#inventory), [creature search](./online-creature-source-review.md#open5e-availability-check) |
| A5E spell feeds and unsupported rulesets | Outside DnD 5e spell preparation scope | [Scope policy](./open5e-5e-spell-publication.md#scope) |
| Kobold Press Compilation and Open5e Originals | Excluded by policy; no preparation or publication | [Scope policy](./open5e-5e-spell-publication.md#scope) |
| Deep Magic 2023 successors | Outside the reviewed 2020 selection | [2020 review](./deep-magic-2020-review.md#scope-and-status) |
| Elemental-Touched | Outside reference publication approval | [Publication limits](./reference-spell-publication.md#export) |
| Generic Elemental Spells v2.0 | No additional spells beyond Kibbles v2.3; no separate library | [Publication limits](./reference-spell-publication.md#export) |
| Tome of Dark Creatures | Not approved for ingest or publication; reserved identities and incomplete attribution | [Licensing review](./tome-of-dark-creatures-review.md) |
| Additional online, retailer, and GM Binder leads | Investigation only; individual findings do not approve a dataset | [Investigation index and per-source statuses](./investigations/README.md) |

The active `prepare:open5e -- all` creature batch is empty.
See [creature preparation](./guides/prepare-creatures.md) for explicit historical replay commands.
