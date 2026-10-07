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

> **Open5e is no longer used.** SRD 5.2.1 creatures, spells, and conditions are all
> parsed from WotC's official PDF; the only remaining external feed is dnd5eapi.co for
> SRD 5.1 (its structured 2014 spellcasting maps cleanly to our slot model).

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
[Contributor workflow](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/contributor-workflow.md).
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
