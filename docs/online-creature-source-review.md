# Additional online creature sources

## Confirmed reuse-license leads

### Lazy GM’s 5e Monster Builder Resource Document

[Publisher document](https://slyflourish.com/lazy_5e_monster_building_resource_document.html).
The publisher explicitly licenses its original material under CC-BY-4.0 and gives
an attribution statement. Authors are Scott Fitzgerald Gray, Teos Abadía, and
Michael E. Shea. The document identifies a 2023 copyright and a January 18, 2024
update.

Its General-Use Combat Stat Blocks section contains fixed-stat, reskinnable
creatures, including Minion and Soldier. These are generic combat profiles,
not a large named-monster bestiary. They do not depend on a player-character build.
Some profiles allow multiple sizes and flexible damage descriptions; those need
an explicit adaptation or a prose-only treatment in OpenFray’s schema.

The publisher links [Crit.Tech’s multi-format repository](https://github.com/crit-tech/LGMRD)
and a downloadable format bundle. No PDF extraction is required for the HTML
source. Review the attribution, source version, and adapted fields before ingest.
Do not ingest the document’s example references to excluded Wizards creatures.

### Free5e: Free Range Monsters

[Publisher download and licensing announcement](https://wyrmworkspublishing.com/how-to-get-dnd-books-for-free/).
Wyrmworks explicitly says the Player’s Guide, GM Handbook, and Free Range Monsters
are CC-BY licensed and available for free download. It advertises over 500 monsters
and describes the system as a 5e-compatible alternative.

The announcement links an authorized
[DriveThruRPG core-book bundle](https://www.drivethrurpg.com/product/513248/Free5e-Core-Rulebook-Bundle-BUNDLE).
The publisher also advertises accessible formats, including Markdown and EPUB.
Availability of a particular format for the current monster book needs verification.

This is a mixed-source alternative system, not an automatically approved DnD 5e
library. A downstream adventure’s authorized sample credits its Free Range Monsters
adaptation alongside A5ESRD and other sources. That sample is not the monster book
itself and must not be used as its extraction source or exact attribution notice.

Obtain the actual book, check its license version and full attribution, compare
its statistics with standard DnD 5e, and identify duplicates before recommending
it under the current scope. No creature count beyond the publisher’s advertised
“over 500” was independently verified.

### Supplied Free5e manuscript review

The supplied `Free5e_Monstrous_Manuscript_2025-08-01.md` identifies itself as
Free5e Monstrous Manuscript, a preview work-in-progress updated August 1, 2025.
Its Legal section (lines 23967–23993) explicitly licenses the text under CC-BY-4.0.
The license retains the earlier title Free5e Free Range Monsters and gives the
required Wyrmworks attribution plus upstream credits for A5ESRD, SRD 5.1, and
both Lazy GM resource documents. The credits also acknowledge KibblesTasty.
Preserve the supplied attribution and review source-specific spell credits when
adapting any of that material. OGL Section 15 is not required for this CC-BY route.

The mixed sources do not inherently prevent licensed reuse. They do affect the
DnD-only publishing decision:

- A5E-derived mechanics remain: expertise dice, strife, and rattled.
- Elite variants retain doubled encounter strength at their printed CR.
- Titanic is outside the console’s size enum.
- Bloodied thresholds and conditional actions need their rules preserved in prose.
- Variant changes are often prose patches rather than standalone stat blocks.
- The manuscript has extraction/layout issues, such as incomplete variant CR
  parentheticals and malformed Markdown emphasis. It needs a dedicated parser
  and source-value validation.

The first Aboleth block closely matches the A5E-style entry: CR 11, 171 hit points,
2 legendary actions, and a bloodied-only Slimy Cloud. This is not simply a new
collection of conventional DnD SRD blocks.

Conclusion: legally reusable under the stated CC-BY grant with the required
attribution and adaptation notices; not suitable for wholesale publication under
the current DnD-only scope. A filtered, reviewed subset or an explicitly adapted
library would need a separate inclusion decision. No manuscript text was ingested.

## OGL investigation leads

These are leads for a source-specific license review, not cleared datasets:

- [Tome of Horrors 5th Edition](https://www.froggodgames.com/products/15126),
  Frog God Games. The publisher confirms the DnD 5e bestiary and authorized PDF
  purchase route. Its exact OGC designation and complete attribution requirements
  still need an authorized edition-specific notice. The Black Flag product
  Enemies of the Valiant is a different book and remains outside scope.
- [Fifth Edition Foes index](https://www.5esrd.com/srd-content-source/fifth-edition-foes/)
  offers online creature records. Individual reuse designations and any special
  legacy Tome of Horrors attribution requirements need verification.
- [Total Party Kill Bestiary, Volume 2 index](https://www.5esrd.com/srd-content-source/total-party-kill-bestiary-volume-2/)
  is a lead for high-level creature content. Its edition’s original-content
  designation, names, and attribution chain were not cleared in this review.

The presence of a source on an OGC index does not make every field reusable.
Publisher book sales do not establish a license for all its contents either.

## DriveThruRPG and publisher-store follow-up

Additional conventional DnD 5e leads:

- [Ultimate Bestiary: Revenge of the Horde](https://nordgamesllc.com/products/ultimate-bestiary-revenge-of-the-horde-pdf-5e),
  Nord Games. Focuses on humanoid foes. The publisher offers an
  [authorized free preview](https://nordgamesllc.com/products/ultimate-bestiary-revenge-of-the-horde-pdf-preview-5e).
- [Ultimate Bestiary: The Dreaded Accursed](https://nordgamesllc.com/products/ultimate-bestiary-the-dreaded-accursed-pdf-5e),
  Nord Games. Focuses on undead and cursed creatures. The publisher offers an
  [authorized free preview](https://nordgamesllc.com/products/the-dreaded-accursed-pdf-preview-5e).

Search results associate the Nord titles with OGL designations, but their full
edition-specific declarations and attribution chains were not verified here.
Treat them as candidates for inspection, not approved imports.
The retailer preview `281234-sample.pdf` is an unrelated document that mentions
Revenge of the Horde as a reference. Search summaries misidentified it as the
Nord book; it was rejected as evidence for that book’s license.

The [authorized Fifth Edition Foes preview](https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/195015-sample.pdf)
confirms its title, 5th-edition stat blocks, Product Identity exclusions, and
individual creature credit notices. Its contents locate a legal appendix on page
259, beyond the preview. Full reuse coverage and any special attribution rules
therefore still require that appendix. The unusual Defense/Offense/Statistics
layout needs a dedicated mapper, but this is a DnD 5e book, not A5E or Black Flag.

## DMsGuild

The platform’s [licensing FAQ](https://help.dmsguild.com/hc/en-us/articles/12776887523479-Ownership-and-License-FAQ)
is a separate community-content route. Its indexed guidance limits community
reuse to DMsGuild products and describes exclusive distribution rights.
The full page was blocked during direct retrieval.
Do not treat a DMsGuild download or its SRD notice as a grant for an independent
OpenFray library. Any proposed exception requires verified separate permission
covering the relevant rights and distribution outside the platform.

## Open5e availability check

The live v2 creature endpoint returned `count: 0` for each of these document keys:
`kp`, `wz`, `deepm`, `deepmx`, `vom`, `open5e`, and `open5e-2024`.
Document registration and OGL metadata therefore do not supply additional creature
feeds for those sources. Counts can change upstream.

## Recommendation

The Lazy GM profiles are the clearest small ingest lead within the current scope.
Free Range Monsters is the strongest large CC-BY lead, but its alternative-system
and mixed-source mechanics need review before any inclusion decision.
No additional ORC bestiary was verified within the requested DnD-only scope.
