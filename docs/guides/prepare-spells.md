# Prepare provisional spell candidates

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

The descriptions below apply to provisional preparation and future snapshots.
Pinned direct-source selections already have separate [reference publication approvals](../reference-spell-publication.md).
Preparation’s `--strict` gate may still fail for those selections; use the independent export gate for approved snapshots.

## Prepare Open5e spell libraries

`prepare:open5e-spells` requests third-party v2 spells separately for each source document.
It never requests SRD spell records; the PDF pipelines already supply those datasets.
It leaves the authoritative SRD pipelines, existing datasets, and console unchanged.
Each source has independent IDs; same-name spells from different books stay separate.

```bash
npm run prepare:open5e-spells -- all
npm run prepare:open5e-spells -- deepm
# Replay the complete discovery cache without network access:
npm run prepare:open5e-spells -- all output/open5e-spell-preparation/discovery.json
# Recover missing classes from complete, same-source v1 snapshots:
npm run prepare:open5e-spells -- all output/open5e-spell-preparation/discovery.json output/open5e-legacy-spell-review
# Replay one source and enforce the publishing gate:
npm run prepare:open5e-spells -- deepm output/open5e-spell-preparation/deepm/raw.json --strict
npm run validate -- --spells output/open5e-spell-preparation/deepm/candidate-spells.json
```

`all` fetches third-party source documents using the API’s document filter.
It selects supported 2014 and 2024 DnD 5e documents, including Black Flag.
The [publication policy](../open5e-5e-spell-publication.md#scope) records excluded catalogs.
It excludes core `srd-2024`, core `srd-2014`, A5E, and unsupported rulesets before making spell requests.
Spells That Don’t Suck uses its existing direct-publisher source route and is excluded from this preparation.
Offline replay removes these records from legacy caches before writing artifacts.
Preparation also removes their stale directories within `output/open5e-spell-preparation/`.
It checks pagination counts, duplicate keys, document identity, and source metadata.
Each source directory under `output/open5e-spell-preparation/` contains:

- `raw.json`: source metadata, retrieval time, and unchanged API records.
- `candidate-spells.json`: provisional display fields and spell prose.
- `report.json`: validation, exclusions, withheld fields, fidelity findings, and publishing blockers.
- `raw-v1.json`: unchanged legacy evidence when a legacy cache directory is supplied.

Legacy class recovery requires matching document aliases, stable spell IDs, titles, and identical prose except whitespace.
It fills only absent class lists, preserves supplied class labels, and leaves existing v2 assignments and raw records unchanged.
Reports list recovered assignments and pin the legacy snapshot hash.

The root also contains `discovery.json` for replay and `index.json` summarizing the latest run.
The index inventories every selected source, its ruleset and licenses, and its record count.
Sources with no API spells, including Vault of Magic and Black Flag, remain listed in `emptySources`.
Candidates preserve descriptions and higher-level prose.
Casting times retain reaction conditions and ritual availability.
Concentration durations use the schema’s separate flag.
Missing required display fields cause withholding; missing materials and class lists remain review findings.
Potential reserved Wizards of the Coast names are conservatively excluded pending source review.

Candidates currently omit rollable mechanics.
Damage, saves, attacks, casting options, and scaling require source-specific review before mapping.
Raw snapshots preserve those API fields; the reports flag their review status.
A5E is outside the DnD 5e spell scope and cannot be selected for preparation.

Preparation saves validation findings and exits successfully when artifacts are generated.
`npm run validate -- --spells` checks spell invariants and exits nonzero on errors.
`--strict` fails while publishing remains blocked, even when spell validation passes.
API license metadata does not establish licensed coverage or satisfy attribution requirements.
Publishing needs publisher evidence, exclusions review, and the exact attribution or OGL Section 15 chain.
The [5e spell publication inventory](../open5e-5e-spell-publication.md) records current source evidence and blockers.
Console registration, shipped JSON, and credits remain a separate change.

## Spells That Don’t Suck from GM Binder

The [direct-source implementation map](../direct-spells.md) locates shared formats, source adapters, commands, and behavioral tests.

This separate pipeline uses the [creators’ GM Binder document](https://www.gmbinder.com/share/-NR0OWlW60yv2EfA3qQp).
Its credits section licenses the document under CC-BY-4.0.
Credit Omega Ankh and somanyrobots, plus KibblesTasty for the contributed spells.
The Open5e version remains excluded.

```bash
npm run prepare:stds-spells
# Replay the cached HTML without network access:
npm run prepare:stds-spells -- output/spells-that-dont-suck-preparation/source.html
npm run validate -- --spells output/spells-that-dont-suck-preparation/candidate-spells.json
# Enforce the independent publishing gate:
npm run prepare:stds-spells -- output/spells-that-dont-suck-preparation/source.html --strict
```

Artifacts live in `output/spells-that-dont-suck-preparation/`:

- `source.html`: unchanged source snapshot, retained locally for replay.
- `blocks.json`: extracted spell text, display fields, replacement references, and removed advice panels.
- `candidate-spells.json`: provisional display-only spells with independent source IDs.
- `report.json`: publisher licensing evidence, attribution, input hash, validation, and review blockers.

The parser preserves tables across page breaks.
Named summon stat blocks attach to the spells that reference them, regardless of their printed placement.
Unattached stat blocks remain explicit review findings.
It excludes art, page scripts, styling, changelog, appendices, and design commentary.
Advice blockquotes are omitted; panels containing Armor Class and Hit Points are retained as stat blocks.
Conditional advantage remains prose; rollable mechanics are not inferred.
Review spell boundaries, panel classification, contributor attribution, and the source’s rules edition before publishing.
The edition remains unset pending that review.
Passing validation does not approve publication or modify the console.

## So Many Spells from GM Binder

This pipeline uses [somanyrobots’ standalone spell collection](https://www.gmbinder.com/share/-NMZq9u_rDyV_XD5YTxf).
The document licenses its rules and spell text under CC-BY-4.0; cover art is excluded.
Source credits include somanyrobots, commissioned-spell credits, and SRD 5.1 attribution to Wizards of the Coast.

```bash
npm run prepare:so-many-spells
npm run prepare:so-many-spells -- output/so-many-spells-preparation/source.html
npm run validate -- --spells output/so-many-spells-preparation/candidate-spells.json
npm run prepare:so-many-spells -- output/so-many-spells-preparation/source.html --strict
```

Artifacts have the same layout as the Spells That Don’t Suck pipeline, under `output/so-many-spells-preparation/`.
Both documents use the shared GM Binder parser and separate source identities.
Same-name spells remain independent; no replacement or deduplication across sources occurs.
Custom class names stay unchanged.
School specializations such as ferromancy, osteomancy, and shadow magic remain in extracted headers and review metadata.
The schema’s school field retains the base school; specializations have no inferred mechanics.
The edition remains unset pending review.
Candidates are display-only, and publisher licensing evidence is retained alongside the review blockers.
Spells mentioning potentially reserved Wizards creature or spell names are withheld pending reuse review, even under a third-party CC-BY notice.
Neither direct-source pipeline imports SRD spell datasets or changes the console.

## Kibbles’ Casting Compendium v2.3

This pipeline processes the entire [publisher’s v2.3 PDF](https://static1.squarespace.com/static/5e7eab9fcc76e2321541f8b3/t/67310012bfaa046721d850fb/1731264535758/SpellCompemdiumV2.3.pdf).
The current source has 295 spell headers, including psionics and blood magic.
Elemental-Touched is not imported.
Overlapping spells in other libraries stay independent.

```bash
# Setup installs the pinned PyMuPDF dependency from requirements.txt.
# Save the linked PDF as output/kibbles-casting-v23-preparation/source.pdf, then:
python scripts/extract/kibbles-v23-spells.py output/kibbles-casting-v23-preparation/source.pdf output/kibbles-casting-v23-preparation/snapshot.json
npm run prepare:kibbles-v23-spells -- output/kibbles-casting-v23-preparation/snapshot.json
npm run validate -- --spells output/kibbles-casting-v23-preparation/candidate-spells.json
python -m unittest discover -s tests/scripts -p 'test_extract_kibbles_v23_spells.py'
```

The book-specific extractor uses PyMuPDF and reads each column separately.
It preserves source values, table cells, higher-level prose, and named summon stat blocks.
Chapter introductions and feat rules stay outside spell text.
The snapshot retains raw lines, physical PDF pages, the input hash, and publisher licensing evidence.
`sourcePage` uses physical PDF pagination, which can differ from printed page numbers.

The source-defined Psionic school is retained.
Missing class assignments remain unset and flagged; no Psion assignment is inferred.
Compound ritual tags, including blood-magic rituals, set the ritual display flag.
Extraction issues, unverified external credits, and potential reserved Wizards names cause explicit withholding.
Unattached summon blocks remain review findings.

Spell text is CC-BY-4.0; art is excluded.
Separately credited items retain their own license requirements.
Wall of Blood’s SMS marker is captured as a So Many Spells credit, separate from its canonical name and rules text.
Reports retain KibblesTasty, somanyrobots, and SRD 5.1 attribution alongside independent publishing blockers.
Candidates are display-only; edition remains unset pending review.
Add `--strict` to the preparation command to enforce the publishing gate.
