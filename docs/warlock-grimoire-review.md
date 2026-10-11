# Warlock Grimoire source review

## Scope and status

The supplied RTF identifies *Warlock Grimoire*, © 2019 Open Design LLC.
The back cover gives ISBN `978-1-936781-15-7`. This review concerns the 43 local
Warlock draft spells. None are approved for publication or combat implementation.

Ten drafts have actual spell entries in this book. The other 33 require their
actual sources and declarations. An unresolved source is not a finding that its
content is unlicensed. Narrative references, creature spell lists, and similar
words do not establish spell-entry provenance.

Page 6 and the back cover identify the first ten Warlock issues plus new material.
The [publisher’s store](https://koboldpress.com/kpstore/product/warlock-grimoire-for-5th-edition/)
confirms this scope and advertises 28 spells. The book inventory and draft overlap
are separate counts. Additional book spells are outside this audit.

## Located entries

| Draft | Printed pages | Required correction or review |
| --- | --- | --- |
| Avert Evil Eye | 247 | Material description; contextual class evidence |
| Commander’s Pavilion | 201 | Material description; contextual class evidence |
| Eternal Echo | 63 | Concentration; unspecified upper duration bound; contextual class evidence |
| Order of Revenge | 228 | Material description; contextual class evidence |
| Reassemble | 63–64 | Material description; omitted Bless restriction; setting references and ley-line dependency |
| Revenge’s Eye | 228–229 | Concentration; material description; missing rules text |
| Skull Road | 64 | Concentration; material description; named locations and setting dependencies |
| Vagrant’s Nondescript Cloak | 229 | Material description; missing warding rules |
| Vengeful Panopy of the Ley Line Ignited | 233 | Printed title is “Panoply”; Concentration; Sorcerer class spelling; metadata contamination, setting prose, and ley-line dependency |
| Who Goes There? | 202 | Concentration; material description; contextual class evidence |

Five Concentration flags are absent from the drafts. Eight material descriptions
are absent. Six bodies match after typography normalization. Four bodies require
text review: Reassemble, Revenge’s Eye, Vagrant’s Nondescript Cloak, and Vengeful
Panoply of the Ley Line Ignited.

The draft corpus has zero schema errors and 30 warnings. Schema validation does
not detect the source-text omissions or grant publication approval.

## License evidence

Page 3 explicitly includes spells in Open Game Content under OGL 1.0a.
Its Product Identity declaration excludes trademarks, proper names, dialogue,
plots, story elements, locations, characters, artwork, sidebars, and trade dress.
Previously designated Open Game Content is excepted from that exclusion.

The grant covers named categories, including the specifically designated adanisk
sidebar. It does not grant the whole book. Spell material descriptions and rules
with named setting references require field-level review. Do not remove a
mechanical dependency without recording a faithful, permitted adaptation.

Page 296 supplies OGL 1.0a and 19 Section 15 copyright notices, including the
license notice. The notice titles, in source order, are:

1. Open Game License v 1.0a
2. System Reference Document 5.0
3. Tome of Beasts
4. Creature Codex
5. Midgard Worldbook
6. The Infernal Salt Pits
7. Midgard Heroes Handbook
8. Deep Magic: Void Magic
9. Warlock 1: Mythos
10. Warlock 2: Dread Magic
11. Warlock 3: Undercity
12. Warlock 4: The Dragon Empire
13. Warlock 5: Rogue’s Gallery
14. Warlock 6: City of Brass
15. Warlock 7: Fey Courts
16. Warlock 8: Undead
17. Warlock 9: The World Tree
18. Warlock 10: The Magocracies
19. Warlock Grimoire

This title inventory does not replace the full verbatim copyright chain.
Preserve the upstream SRD notice when shipping this source under OGL.
OpenFray’s CC-BY election for directly sourced WotC content does not remove it.

## Reproduce the private audit

Set `WARLOCK_DRAFT` to the local candidate JSON and `WARLOCK_RTF` to the supplied
book. Run:

```sh
npm run review:warlock-grimoire -- "$WARLOCK_DRAFT" "$WARLOCK_RTF"
```

The command requires macOS `textutil`. It checks pinned artifact hashes, exact
entry headings, page continuations, and boundaries before comparing headers and
ordered body tokens. It rejects changed evidence. It changes no drafts and
produces no spell cards or approvals. Its diagnostic artifacts stay under ignored
`output/`; never publish them or the full source book.

The RTF SHA-256 is
`0d3817ca5c585b82888845089e8ecb76c6fe6ccf962725f463b4ca1b6cba7b19`.
The draft SHA-256 is
`94fac4a9342f2798d15ef35cdbfcafb4eacbfbfe524b87af7696f60eb83fb006`.

## Publication gates

1. Verify the RTF’s fidelity, column order, page continuations, and exact printing
   against a lawfully obtained visual source.
2. Resolve header and body differences, class assignments, Product Identity,
   supporting rules, and OGC scope. Add no conditional advantage or build automation.
3. Obtain actual source evidence for the 33 unresolved drafts. Review each source
   independently; this book’s grant does not cover later Warlock issues.
4. Preserve full OGL 1.0a, the verified verbatim Section 15 chain, and OpenFray’s
   OGC designation in console credits before publishing.
5. Prepare vetted typed sources or generators, run the ingest and dataset validator,
   and review attribution before copying any approved JSON into the console.

All candidate records remain unchanged. No console credits, shipped libraries,
or combat profiles are added by this audit.
