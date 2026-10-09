# OpenFray Compendium

Data-generation tooling for [OpenFray](https://openfray.app). It ingests SRD and
third-party monster/spell sources into OpenFray's `Creature`/`Spell` schema,
validates the result, and emits the JSON the
[console](https://github.com/OpenFrayApp/console) ships in its
`public/compendium/`.

This repo is **build-time only** — the OpenFray app never runs it; it just consumes
the JSON. Keeping the generators (and their toolchains, including a Python PDF
parser) out of the app keeps the app lean and the data reproducible here.

## Sources

| Command | Source | Notes |
|---|---|---|
| `npm run ingest:srd52` | **SRD 5.2.1 creatures via WotC's official CC-BY PDF** | the authoritative 5.2 creature pipeline |
| `npm run ingest:srd52-spells` | **SRD 5.2.1 spells via WotC's official CC-BY PDF** | the authoritative 5.2 spell pipeline |
| `npm run ingest:srd-2014` | SRD 5.1 via [dnd5eapi.co](https://www.dnd5eapi.co) | structured 2014 spellcasting/slots |
| `tob1.py` → `ingest-tob1.ts` | **Tome of Beasts (Kobold Press)** via the book's PDF | OGL 1.0a, 384 OGC creatures; edition 5.0 |
| `tob2.py` → `ingest-tob2.ts` | **Tome of Beasts 2 (Kobold Press)** via the book's PDF | OGL 1.0a, 389 OGC creatures; edition 5.0 |
| `tob3.py` → `ingest-tob3.ts` | **Tome of Beasts 3 (Kobold Press)** via the book's PDF | OGL 1.0a, 395 OGC creatures; edition 5.0 |
| `npm run ingest:khyberia` | **Khyberia SRD (October 2023)** by Nick Stefanski | CC-BY-4.0; 21 creatures; edition 5.0; supplied PDF required |
| `npm run ingest:brood-and-bloom` | **Brood & Bloom** — original OpenFray creatures | authored in `src/compendium/brood-and-bloom.ts`; no PDF, no parser; edition 5.5 |
| `npm run ingest:brood-and-bloom-spells` | **Brood & Bloom** — original OpenFray spells | authored in `src/compendium/brood-and-bloom-spells.ts` |
| `npm run ingest:strong-waters-spells` | **On Strong Waters and Potent Simples** — original OpenFray spells | authored in `src/compendium/strong-waters-spells.ts`; spells and presets only, no creatures |

> **Per-book extractors, not shared.** `tob1.py` / `tob2.py` / `tob3.py` all use **pymupdf
> (`import fitz`)**, but each book's fonts differ, so a filter tuned to one breaks the others
> (ToB 2 stat labels are SegoeUI-Semibold, ToB 3's SegoeUI-Bold; **ToB 1 is the most
> different** — names in HelveticaNeue-BlackCond/-Bold, section headers in CovingtonCond,
> body in plain SegoeUI, and its named "deluxe" creatures print their name only in a
> scattered Covington-SC700 drop-cap banner, recovered via the PDF bookmark TOC by
> letter-set match). All three share only the TS mapper (`mapTob3(block, source)`) — the
> three books are 2014, so cast spells link to the 5.1 library. The PDFs are NOT committed
> (supplied at ingest time). ToB 1 ships ~7 known gaps (variant/inset stat blocks in a
> non-standard layout: Hulking Whelp, Clockwork Beetle Swarm, Alseid Grovekeeper, Vampire
> Warlock variant, Bandit Lord, Nkosi War Ostrich, the split Baba Yaga Horsemen).

Each source is honored under its own license, preferring **CC-BY > ORC > OGL**. WotC
SRD is **CC-BY-4.0** (never OGL); third-party content (e.g. Kobold Press / Tome of
Beasts) is used under its actual license — ORC or OGL 1.0a, OGC-only — never assumed
CC-BY. The public record of compliance is the console repo's
[CREDITS.md](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md).

SRD 5.2.1 creatures, spells, and conditions use WotC’s official PDF.
SRD 5.1 uses dnd5eapi.co for structured 2014 spellcasting.
Open5e supplies separate, provisional third-party spell candidates for source review.

Open5e supplies Creature Codex through `scripts/ingest-creature-codex.ts`.

## Khyberia SRD from a supplied PDF

The October 2023 Khyberia SRD contains 21 standard 5e-compatible creature blocks.
This is the expanded 14-page document, not the older seven-page online version.
Its CC-BY-4.0 notice covers the whole SRD and retains SRD 5.1 and A5ESRD credits.
The imported creatures use conventional 5e statistics; their unusual effects are
defined in the blocks. No A5E library or separate A5E rules implementation is added.

```bash
# Use an environment with PyMuPDF installed, as for the other PDF pipelines.
.venv/bin/python scripts/extract-khyberia.py "/path/to/Khyberia SRD 2023-10.pdf" output/khyberia/blocks.json
npm run ingest:khyberia
npm run validate -- output/khyberia-creatures.json
.venv/bin/python tests/compendium/khyberia_extractor_test.py
```

The extractor retains the PDF digest and legal page. The mapper accepts only the
reviewed revision and all 21 blocks. Output includes `khyberia-creatures.json`,
`khyberia/validation.json`, and `khyberia/ATTRIBUTION.md`. Ship the required
attribution and adaptation notice with the data; the PDF itself is not committed.

Published values stay unchanged. Conditional damage choices and unsupported
rest-based recovery remain in prose rather than receiving invented automation.
The review records the Hunter’s passive Perception mismatch, Wodyanoi’s tusk
average discrepancy, and its omitted Gyre save DC.
See [the Khyberia source review](./docs/khyberia-review.md).

## Prepare additional Open5e libraries

`prepare:open5e` creates local review artifacts only. It leaves the console and
existing PDF-derived datasets unchanged. The active `all` batch is empty.
Historical A5E, Black Flag, and ToB 2023 reviews remain available by explicit
document key. Tal’Dorei is no longer a preparation candidate.

| Open5e document key | Source | Records observed during preparation |
|---|---|---|
| `a5e-mm` | Monstrous Menagerie | 586 |
| `bfrd` | Black Flag SRD | 360 |
| `tob-2023` | Tome of Beasts 1 (2023 Edition) | 408 |

Counts can change upstream. None of these historical review sources is selected
for publication or included in the console. ToB 2023 has been removed from the
active batch and local app preview. The original ToB 1–3 libraries are unchanged.

Tome of Heroes has a Creature Statistics section, but Open5e’s `toh` document
currently supplies no creatures. Its authorized sample does not include those
stat blocks or explicitly designate them as reusable. A creature pipeline for
that book needs authorized source material and a separate licensing review.

```bash
npm run prepare:open5e -- all
npm run prepare:open5e -- tob-2023
# Replay the saved snapshot without network access:
npm run prepare:open5e -- tob-2023 output/open5e-preparation/tob-2023/raw.json
# Fail while publishing blockers remain, even if preparation itself succeeds:
npm run prepare:open5e -- tob-2023 output/open5e-preparation/tob-2023/raw.json --strict
npm run validate -- output/open5e-preparation/tob-2023/candidate-creatures.json
```

Each document gets its own directory under `output/open5e-preparation/`:

- `raw.json`: document metadata, retrieval time, v2 creatures, and checked v1 provenance.
- `candidate-creatures.json`: provisional mappings with separate source IDs.
- `report.json`: validation issues, provisional retention labels, and publishing blockers.
- `source-statistics.json`: Black Flag check/save modifiers and available fixed Perception and Stealth values; empty for other sources.

Preparation saves validation failures for review. Its exit status reports whether
preparation succeeded; `npm run validate` remains the invariant gate.
No candidate is approved for publication, even when validation passes.

The adapter uses the shared 2014 parser and restores structured HP, saves, attacks,
usage limits, and legendary costs. Checked v1 records recover source pages and
legendary budgets. Spellcasting prose remains available when parsing fails.

Reports include exclusions, withheld unsupported sizes, fidelity findings, and cited
transcription corrections. Corrections fail when their expected input changes.
Verified published arithmetic deviations remain cited warnings through exact-value
exceptions. The validator CLI applies the same reviewed exceptions as preparation;
other libraries and unreviewed values retain strict checks.
Eight unresolved HP/save findings retain their Open5e values provisionally.
Reports label them `unverified-open5e`; strict validation still reports them as errors.
Changed inputs stop those retention labels from applying.

Black Flag candidates retain Open5e’s synthesized scores without clamping them.
Their sidecar preserves check/save modifiers separately, including any baked-in proficiency.
It recovers publisher-checked Stealth for Aboleth and Ancient Red Dragon only while checked statistics match.
Missing or unverified statistics remain `null`, with findings in the report.
The sidecar is a review artifact; the console does not consume it.
Review Advanced 5th Edition and Black Flag mechanics before publishing.
Compare raw and mapped attacks, legendary costs, action sections, and spell links.
The raw snapshot preserves fields the adapter does not consume.

Verify each edition’s license, reuse designation, excluded content, and required
attribution chain. Open5e metadata alone does not establish publishing compliance.
[Source review](./docs/open5e-review.md) records publisher notices, verified
corrections, and outstanding licensing and schema gates. Black Flag’s publisher
offers CC-BY alongside ORC, but the feed’s older release still needs comparison.
The authorized ToB 2023 sample verifies its reuse declaration. Exclusions cover
named rulers, Ia’Affrat, and their explicitly named spawn. The sample omits
Section 15, so the complete attribution chain remains a publishing gate. Console library registration, credits, and shipping the
vetted datasets require separate work.

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
It selects 2014 and 2024 D&D 5e documents, including Open5e Originals and Black Flag.
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
A5E is outside the D&D 5e spell scope and cannot be selected for preparation.

Preparation saves validation findings and exits successfully when artifacts are generated.
`npm run validate -- --spells` checks spell invariants and exits nonzero on errors.
`--strict` fails while publishing remains blocked, even when spell validation passes.
API license metadata does not establish licensed coverage or satisfy attribution requirements.
Publishing needs publisher evidence, exclusions review, and the exact attribution or OGL Section 15 chain.
The [5e spell publication inventory](docs/open5e-5e-spell-publication.md) records current source evidence and blockers.
Console registration, shipped JSON, and credits remain a separate change.

## Review Tome of Heroes against the publisher PDF

The book-specific `scripts/toh.py` uses PyMuPDF and the column-reading approach from `tob3.py`. It retains source lines with physical page, font, size, and position evidence. It does not filter Product Identity or emit publishable cards. OCR snapshots identify their fonts as synthetic, not publisher font evidence. `--spell-columns` clips the spell descriptions into separate text columns before OCR and excludes the illustrated outer border and footer.

```bash
python -m pip install pymupdf==1.26.7
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/pages.json
# For an image-only PDF, supply Tesseract's English traineddata directory:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/ocr-pages.json --ocr --tessdata /path/to/tessdata --pages 3 4 320
# OCR the spell-description columns separately to avoid cross-column merges:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/spell-columns.json --ocr --spell-columns --tessdata /path/to/tessdata --pages 273 274
# Reorder an existing column snapshot without repeating OCR:
python scripts/toh.py /path/to/Tome-of-Heroes.pdf output/tome-of-heroes-review/spell-columns-ordered.json --cache output/tome-of-heroes-review/spell-columns.json
python -m unittest discover -s tests/scripts -p 'test_toh.py'
```

Cached replay checks the PDF hash, page count, extraction mode, and physical page numbers.
It sorts lines within each column before joining the columns in reading order.
The snapshot remains review evidence with `publishable: false`.

The ignored review snapshot pins the supplied PDF’s SHA-256. `--pages` selects physical page numbers and preserves the total PDF page count. A snapshot with no extracted text fails explicitly. Add `--render-dir output/tome-of-heroes-review/images` to save selected page images for visual checks. Check OCR against those images before using it to correct spell data. Use the evidence to verify the declaration, complete license chain, spell metadata, and prose before approving a corrected spell snapshot. Keep the PDF and extracted source pages outside Git. The [publication inventory](docs/open5e-5e-spell-publication.md) records unresolved exclusions and source-field checks.

### Prepare source-corrected reference candidates

The source-specific review in `src/compendium/tomeOfHeroesReview.ts` pins the Open5e candidate hash and supplied PDF hash.
It restores material descriptions, corrects reviewed headers, and applies the publisher’s May 29, 2025 spell errata.
Deadly Salvo is withheld because it depends on excluded gunpowder rules.
Printed ambiguities remain unchanged; conditional advantage stays prose.

```bash
npm run prepare:tome-of-heroes-spells -- output/open5e-spell-preparation/toh/candidate-spells.json
npm run validate -- --spells output/tome-of-heroes-preparation/candidate-spells.json
```

Preparation writes 90 candidates and an evidence report to `output/tome-of-heroes-preparation/`.
A changed input snapshot requires renewed source review.
The cards omit edition and rollable mechanics until reference publication approval.
The report retains `publishable: false` pending console registration, attribution, and publication checks.
Existing reference approvals and their accepted warnings remain unchanged.

## Spells That Don’t Suck from GM Binder

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
python -m pip install pymupdf
# Save the linked PDF as output/kibbles-casting-v23-preparation/source.pdf, then:
python scripts/extract-kibbles-v23-spells.py output/kibbles-casting-v23-preparation/source.pdf output/kibbles-casting-v23-preparation/snapshot.json
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

## Publish reviewed reference spells

Four pinned snapshots are approved for opt-in reference cards:
Kibbles v2.3 (295), Spells That Don’t Suck (181), So Many Spells (179), and Tome of Heroes (90).
Their [publication record](./docs/reference-spell-publication.md) documents the
source hashes, source-specific decisions, attribution, and manual-only limits.
Preparation reports keep their conservative gates for future snapshots.

```bash
npm run export:reference-spells -- ../console/public/compendium
```

Export checks the pinned candidate hashes and standard validation before writing.
The only accepted warning is Bile Beam’s missing material description.
The console supplies independent manual verdicts and blocks same-name automation.
Other Open5e and creature candidates remain outside this publication approval.

## SRD 5.2.1 from the official PDF

The official **SRD 5.2.1** PDF is the authoritative CC-BY source — it has none of the
gaps the Open5e 5.2 feed did (missing alignments, wrong sizes, a corrupt Octopus,
mangled casting times). Each source is a Python extractor (the PDF is two-column;
pdfplumber handles it) feeding a TS mapper:

```bash
pip install pdfplumber                      # one-time
# download the CC-BY PDF (not committed): https://www.dndbeyond.com/srd

# Spells first (creatures hover-link cast spell names against them):
python scripts/extract-srd52-spells-pdf.py SRD_CC_v5.2.1.pdf output/srd52-spell-blocks.json
npm run ingest:srd52-spells -- output/srd52-spell-blocks.json output/srd-spells.json

# Then creatures (3rd arg = the spells JSON, for prose spell-links):
python scripts/extract-srd52-pdf.py SRD_CC_v5.2.1.pdf output/srd52-blocks.json
npm run ingest:srd52 -- output/srd52-blocks.json output/srd-creatures.json output/srd-spells.json
```

The creature extractor takes each section's verbatim text from `extract_text()` and
uses a font pass only for the order of entry names, then splits the text on them —
robust against row-bucketing artifacts that reorder bold names mid-prose. The spell
extractor instead uses `extract_text(use_text_flow=True)` (content-stream order is the
true reading order) and segments on the `Level N <School>` / `<School> Cantrip` header
that follows each spell name. Both are bounded to their PDF sections; known WotC typos
(e.g. the Archmage's XP) are corrected via an errata map in `src/compendium/srd52.ts`.

## Original content (Brood & Bloom, The Waking Garden)

OpenFray's own creatures — not SRD or third-party OGL — so there's no PDF to extract and no
prose parser. They're authored directly in `src/compendium/brood-and-bloom.ts` and
`src/compendium/waking-garden.ts` as a typed `Creature[]`, which `tsc` checks
field-by-field; the app never type-checks the JSON it fetches, so this typed source is
where a bad field is caught. The ingest sorts them, runs the same invariant validator the
PDF pipelines use, and writes the JSON only if it's clean. Edit the creatures in the `.ts`,
never the JSON — the JSON is a build artifact.

Brood & Bloom and On Strong Waters and Potent Simples also ship spells of their own. They
are authored the same way, in `src/compendium/brood-and-bloom-spells.ts` and
`src/compendium/strong-waters-spells.ts`, and gated by a spell-side validator
(`validateSpellDataset`) that checks what a spell can be silently wrong about: a
Concentration duration that repeats the word the card already prints, a ritual flag that
disagrees with the casting time, scaling steps at or below the spell's own level. The
spells speak to the caster directly — "You touch", never "The caster touches" — the same
voice the SRD's own spells use.

```bash
npm run ingest:brood-and-bloom                       # → output/brood-and-bloom-creatures.json
npm run ingest:brood-and-bloom-spells                # → output/brood-and-bloom-spells.json
npm run ingest:waking-garden                         # → output/waking-garden-creatures.json
npm run validate -- output/brood-and-bloom-creatures.json   # invariants (also run inside ingest)
cp output/brood-and-bloom-*.json ../console/public/compendium/
```

## Estimating challenge ratings

The validator proves a block is _self-consistent_; it can't tell you whether a CR 5 hits
like a CR 9. `estimate:cr` prices each block the way the DMG does — a defensive rating from
effective hit points and AC, an offensive one from three-round damage and attack bonus /
save DC — and flags anything more than two steps from its listed CR:

```bash
npm run estimate:cr -- output/waking-garden-creatures.json      # default tolerance: 2
npm run estimate:cr -- output/brood-and-bloom-creatures.json 1.5
```

A flag is a prompt to look, not a verdict. The method prices damage and durability, which
is all it can see, so a creature built around control — Charm, Frightened, summoning,
terrain — reads low by design and may be correctly rated anyway. Written for the original
libraries, where we set the numbers; it works on any dataset.

## Validate & diff

Self-consistency invariants (save = mod + PB, XP = CR table, HP = dice average, …)
plus a field-level diff against a reference dataset:

```bash
npm run validate -- output/srd-creatures.json                              # invariants only
npm run validate -- output/srd-creatures.json ../console/public/compendium/srd-creatures.json  # + diff
```

It exits non-zero on invariant errors, so it can gate an ingest.

## Publishing to the app

Generated JSON lands in `output/` (gitignored). Copy the vetted files into the app:

```bash
cp output/srd-creatures.json output/srd-spells.json ../console/public/compendium/
```

## Before contributing

Read [AGENTS.md](./AGENTS.md) and the shared
[Contributing](https://github.com/OpenFrayApp/openfray/blob/main/CONTRIBUTING.md).
Use [Verification commands](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/verification.md)
for this repository's check scope, and
[Repository file policy](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/repository-files.md)
for private local files.

## Layout

- `src/schema/` — a vendored copy of OpenFray's `Creature`/`Spell` types (kept in
  sync with the console; the source of truth lives in the console repo).
- `src/compendium/` — the mappers (`srd52`, `srd52spells`, `dnd5eapi`), the
  `brood-and-bloom` and `waking-garden` original-content sources, the `spelllinker` text utility, and the
  `validate` harness.
- `scripts/` — the ingest runners, the PDF extractor, and the validator CLI.

```bash
npm install
npm test           # mapper/harness unit tests
npm run typecheck
```
