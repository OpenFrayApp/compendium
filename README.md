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

Open5e supplies Creature Codex through `scripts/ingest-creature-codex.ts`.
SRD 5.2.1 uses WotC’s official PDF; SRD 5.1 uses dnd5eapi.co.

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

The validator proves a block is *self-consistent*; it can't tell you whether a CR 5 hits
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
