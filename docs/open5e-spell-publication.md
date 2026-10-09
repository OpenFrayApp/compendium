# Open5e spell publication

Open5e supplies discovery records. Each publisher’s license and source text establish
what OpenFray publishes. API license metadata is insufficient.

## A5E Adventurer’s Guide

EN Publishing licenses the A5ESRD under CC-BY-4.0, ORC, and OGL.
OpenFray elects CC-BY-4.0. The publisher’s
[license page](https://a5esrd.com/a5esrd) and
[legal information](https://a5esrd.com/s/Legal-Information.pdf) establish this coverage.
Only the PDFs linked from that page comprise the licensed SRD.

The [spellcasting chapter](https://a5esrd.com/s/a5e_srd_11.pdf) supplies the published
text and metadata. Its SHA-256 is
`b843573777a0a2e04ad1db9bab8fdc8f4598883c511460409eac1c59325a0189`.
Open5e supplies the selection’s stable identities.

Of 371 Open5e entries, 369 match publisher spell blocks and pass validation without
warnings. Guardian of Faith is absent from the licensed chapter. Wish is withheld
because the chapter omits its required range field.

The book-specific pymupdf extractor reads both columns, preserves rare variants,
and obtains class lists and material descriptions from the publisher.
It handles the chapter’s typographic title differences and the printed `5h-level`
label on Antilife Shell. Concentration uses a separate flag and an “up to” limit.
Physical PDF pages supply the page references.

A5E is displayed as a distinct ruleset. The vendored schema’s SRD edition field stays
unset. No rules conversion, inferred damage, saves, attacks, scaling, or conditional
advantage fields are published. The console’s canonical CREDITS.md carries the exact
publisher-required attribution, license link, and adaptation notice.

```bash
../compendium/.venv/bin/python scripts/extract-a5e-srd-spells.py \
  output/open5e-spell-preparation/references/a5e-spellcasting.pdf \
  output/open5e-spell-preparation/a5e-ag/raw.json \
  output/a5e-srd-spells-preparation
npm run validate -- --spells output/a5e-srd-spells-preparation/candidate-spells.json
npm run export:reference-spells -- ../console/public/compendium
```

Obtain the two publisher PDFs through the links above. Keep them and extraction
scratch ignored. The publication manifest pins the generated spell snapshot.

## Remaining Kobold collections

| Open5e selection         | Candidates | Required evidence                                                               |
| ------------------------ | ---------: | ------------------------------------------------------------------------------- |
| Deep Magic               |        515 | Edition-specific publisher OGC/PI declaration and complete Section 15 chain     |
| Deep Magic Extended      |         64 | Underlying book identities, their OGC/PI declarations, and Section 15 chains    |
| Tome of Heroes           |         91 | Publisher OGC/PI declaration and complete Section 15 chain                      |
| Warlock Zine             |         43 | Contributing issue identities, their OGC/PI declarations, and Section 15 chains |
| Kobold Press Compilation |         31 | Underlying source identities and independent OGL grants                         |

The Compilation’s source description references the
[publisher’s Community Use Policy](https://koboldpress.com/kobold-press-community-use-policy/).
That policy is limited to non-commercial activity. An API OGL label does not establish
an alternative grant for these entries.

These 744 candidates remain unpublished. Their source reports also retain duration
errors, missing material descriptions, and class-list findings. Source review must
resolve those before publication. None is registered in the console or advertised
as shipped. The unrelated creature worktree remains untouched.
