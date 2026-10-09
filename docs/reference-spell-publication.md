# Reference spell publication

The console ships three opt-in reference libraries. Their spell cards have no
structured attacks, damage, saves, or scaling. The console also blocks same-name
spell automation for these source IDs. Each spell has a source-specific manual
verdict in the console’s coverage tests.

## Approved snapshots

The approval module is `src/compendium/referenceSpellPublication.ts`.
It pins each generated candidate file’s SHA-256 and expected spell count.
A changed snapshot requires another source review and a renewed approval.
Export validates every library before writing any file.

| Source                           | Cards | Source snapshot SHA-256                                            |
| -------------------------------- | ----: | ------------------------------------------------------------------ |
| Kibbles’ Casting Compendium v2.3 |   295 | `a1957d6a1357595f76186691da7a5e58e539ab8c91e0de184a1dce6b9b151e85` |
| Spells That Don’t Suck           |   181 | `2a1c931f390242e747ba79bf973f77ea1e0b9ae141318b6638a86f95a9161fd4` |
| So Many Spells                   |   179 | `dc5cb8c55911856ba10b4e2f2d07b447be67342615ba13ae6f62e077315e3543` |

Kibbles’ hash identifies the publisher PDF. The other hashes identify the cached
GM Binder HTML. Source URLs and replay commands are in the README.

The source review checks detected headers, independent IDs, metadata boundaries,
tables, summon attachments, chapter cutoffs, and removed advice or art paratext.
The three snapshots have no unattached stat blocks or empty spell text.
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
Edition metadata remains unset. Missing class lists remain unset.
Specialization labels remain in source snapshots; cards show the base spell school.
Same-name spells remain independent across sources.

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
The export command rejects unaccepted findings, inferred editions, and mechanics.
Open5e candidates, unfinished creature candidates, and Elemental-Touched are outside
this approval. Generic Elemental Spells v2.0 adds no spells beyond Kibbles v2.3 and
is not shipped as a separate library.
