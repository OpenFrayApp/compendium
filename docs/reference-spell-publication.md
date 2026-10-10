# Reference spell publication

Five snapshots are approved for opt-in reference libraries. Their spell cards have no
structured attacks, damage, saves, or scaling. The console also blocks same-name
spell automation for these source IDs. Each spell has a source-specific manual
verdict in the console’s coverage tests.

## Approved snapshots

The approval module is `src/compendium/referenceSpellPublication.ts`.
It pins each generated candidate file’s SHA-256 and expected spell count.
A changed snapshot requires another source review and a renewed approval.
Export validates every selected library before writing any file. The optional `--source` flag selects one approved library.

| Source                           | Cards | Source snapshot SHA-256                                            |
| -------------------------------- | ----: | ------------------------------------------------------------------ |
| Kibbles’ Casting Compendium v2.3 |   295 | `a1957d6a1357595f76186691da7a5e58e539ab8c91e0de184a1dce6b9b151e85` |
| Spells That Don’t Suck           |   181 | `2a1c931f390242e747ba79bf973f77ea1e0b9ae141318b6638a86f95a9161fd4` |
| So Many Spells                   |   179 | `dc5cb8c55911856ba10b4e2f2d07b447be67342615ba13ae6f62e077315e3543` |
| Tome of Heroes                   |    90 | `de2d8b5bbe6f92cb2ee31df68192c042883bfe965aa52ab6d91be374d882c38c` |

Kibbles’ and Tome of Heroes’ hashes identify their PDFs. The other hashes identify the cached
GM Binder HTML. Source URLs and replay commands are in the README.

The source review checks detected headers, independent IDs, metadata boundaries,
tables, summon attachments, chapter cutoffs, and removed advice or art paratext.
The three CC-BY snapshots have no unattached stat blocks or empty spell text.
Their counts are 295 of 295, 181 of 181, and 179 of 180 detected spells.
These checks support reference publication; they do not establish rollable fidelity.

## Source-specific decisions

Kibbles includes every spell section, including psionics and blood magic.
Bile Beam remains V, S, M without an invented material description.
Its material-component warning is the only accepted validation finding.
Physical PDF page numbers are retained and documented in console credits.
Wall of Blood retains the separate So Many Spells credit.

Spells That Don’t Suck credits Omega Ankh, somanyrobots, and the source’s named
KibblesTasty contributions. So Many Spells retains its commissioned-spell credits
and SRD 5.1 attribution. Bind Lesser Fiend remains excluded because it references
Vargouille, which is outside the SRD reuse scope.

All three publishers explicitly license the reused spell text under CC-BY-4.0.
The console’s `CREDITS.md` carries source links, license links, creators, contributor
credits, and adaptation notices. The site renders that same file at `/credits/`.
The publication approval records edition 5.0, displayed as 5e.
Kibbles’ PDF declares D&D 5e compatibility and credits SRD 5.1.
Both GM Binder introductions describe 5e collections, and both reference SRD 5.1.
Those declarations establish their 5e baseline; they do not claim 2024 compatibility.
Export adds this reviewed edition to the pinned candidates. Missing class lists remain unset.
Specialization labels remain in source snapshots; cards show the base spell school.
Same-name spells remain independent across sources.

### Tome of Heroes

The OGC declaration is verified on physical PDF page 3, and the complete OGL chain is verified on page 320.
The [source review](./open5e-5e-spell-publication.md) records the book metadata, exclusions, and publisher errata.
The [Section 15 transcript](./tome-of-heroes-section-15.md) preserves all 23 printed notices.
The console credits include that chain, the complete OGL 1.0a, and the dataset’s OGC designation.

The generator takes the 91-card Open5e candidate snapshot with SHA-256 `275e34dc40b6543539d1f28da6bec116fbf0aaca5967d9e5ed2ddaa027a4b08a`.
It withholds Deadly Salvo because the spell depends on excluded gunpowder rules.
The other 90 cards retain independent IDs, book page references, complete material descriptions, and the book’s class assignments.
Corrections include Immolating Gibbet’s missing Sorcerer assignment and the API’s `Sorceror` spelling.

School, duration, and Concentration corrections follow the book’s headers.
Glare, Instant Armored Vehicle, Outmaneuver, and Silvershout incorporate the publisher’s May 29, 2025 errata.
Conjure Construct’s corrected scaling is already present in the API.
Immolating Gibbet’s missing distance unit, Less Fool, I’s unclear advantage wording, and Secret Blind’s “disintegration” reference remain unchanged.

The approved candidate hash is `193349583d5f5a6e28d4396a32a3e19784c56f0046d6f5a2ada7b4749ce1176f`.
These cards have zero validation findings and no rollable mechanics.
Export assigns the reviewed 2014 edition; console coverage supplies an independent manual verdict for every card.
The existing 655 CC-BY reference cards and Bile Beam’s accepted warning remain unchanged.

### Deep Magic 2020

The [review](./deep-magic-2020-review.md) records the accepted Open5e selection basis,
visual exception checks, printed mechanics corrections, class reconciliation, and publisher errata.
The grant and complete license are verified on physical PDF pages 3 and 357.
The [Section 15 transcript](./deep-magic-2020-section-15.md) preserves 35 notices.
The console credits reproduce the full OGL, that chain, and the dataset’s OGC designation.

The approved 503-card candidate SHA-256 is
`12b17d8c76deb0d6169b5ae5d46c5a7f98f205870ba64df464f85efc1bd9d0c7`.
The exported canonical JSON SHA-256, including edition 5.0, is
`6ea27875af39266eaec4b445289204a657a411b97feee31314fe65c9eaa6ff85`.
Eleven custom-ritual spells remain withheld; Anchoring Rope’s duplicate is consolidated.
Supporting systems and summoned-creature stat blocks stay outside the library.
Printed ambiguities remain unchanged. Every card has its own manual coverage verdict.

## Export

Prepare the pinned candidates using the README’s offline replay commands, then run:

```bash
npm run export:reference-spells -- ../console/public/compendium
```

Run the console formatter after export. Formatting changes do not alter the spell
records; console tests pin each dataset’s canonical JSON hash and manual verdicts.
Validate and test both repositories before publishing an updated snapshot.

Preparation reports retain conservative blockers for unreviewed future snapshots
and automated mechanics. This approval applies only to the pinned reference cards.
The export command rejects unaccepted findings, unreviewed candidate editions, and mechanics.
Other Open5e candidates, unfinished creature candidates, and Elemental-Touched are outside
this approval. Generic Elemental Spells v2.0 adds no spells beyond Kibbles v2.3 and
is not shipped as a separate library.
