Guidance for AI agents (and humans) working on the OpenFray compendium tooling. The
cross-repo agreements (code style, writing style, committing, content licensing)
live in the
[openfray repo's AGENTS.md](https://github.com/OpenFrayApp/openfray/blob/main/AGENTS.md).
**Read it before working here.** The authored text follows this repo's
[STYLE.md](./STYLE.md) (the data voice). The [README](./README.md) documents every
pipeline and command; this file carries the rules.

## What this repo is

Build-time ingest tooling: it parses SRD and third-party sources into OpenFray's
`Creature`/`Spell` schema, validates the result, and emits the JSON the
[console](https://github.com/OpenFrayApp/console) ships in its `public/compendium/`.
The app never runs this code; it only consumes the JSON.

```bash
npm install
npm test           # mapper/harness unit tests
npm run typecheck
```

## The rules

- **Consistent tooling.** The PDF extractors use **pymupdf (`import fitz`)**, one
  extractor per book, because each book's fonts differ and a filter tuned to one
  breaks the others. Ingesting a new Kobold book starts as a faithful copy of
  `tob3.py`. Never swap PDF libraries or reimplement extraction inline.
- **Edit the `.ts`, never the JSON.** Original content (the Waking Garden,
  Brood & Bloom, Strong Waters) is authored as typed `Creature[]`/`Spell[]` sources
  in `src/compendium/`; the JSON in `output/` is a build artifact.
- **Stat-block text is mechanics only.** Trait and action text carries rules;
  lore lives in the creature's `description`, and GM advice nowhere.
- **Never bake conditional advantage into data.** A trait that grants advantage
  under a condition stays prose; the GM applies it at the table.
- **Schema is vendored.** `src/schema/` is a copy of the console's types; the
  source of truth is the console repo. Sync it, never fork it.
- **Licensing gates every source**: CC-BY > ORC > OGL, OGC-only under OGL, and
  never SRD-excluded WotC IP. The checklist is in the parent's
  [Content licensing](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md);
  the public record of compliance is the console repo's
  [CREDITS.md](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md).

Every ingest ends with the validator (`npm run validate`), and a new or rebalanced
original creature gets an `estimate:cr` pass. Commit subjects use the `Build:` and
`Tests:` areas.
