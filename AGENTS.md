Guidance for AI agents (and humans) working on the OpenFray compendium tooling. The
cross-repo agreements (code style, writing style, committing, content licensing)
live in the
[openfray repo's AGENTS.md](https://github.com/OpenFrayApp/openfray/blob/main/AGENTS.md).
**Read it before working here.** The authored text follows this repo's
[STYLE.md](./STYLE.md) (the data voice). The [README](./README.md) covers setup;
[task guides](./docs/README.md#task-guides) document pipelines and commands.
This file carries the rules.

## Domain documentation

Read [CONTEXT.md](./CONTEXT.md) before changing domain terms or content identity.
Read [Domain ownership and contracts](./docs/domain.md) when changing schema mappings,
publication gates, or console integration. Use the [review index](./docs/README.md)
to locate source-specific evidence. Shared contracts stay linked to their owning repositories.

## What this repo is

Build-time ingest tooling: it parses SRD and third-party sources into OpenFray's
`Creature`/`Spell` schema, validates the result, and emits the JSON the
[console](https://github.com/OpenFrayApp/console) ships in its `public/compendium/`.
The app never runs this code; it only consumes the JSON.

Follow the [verification guide](./docs/verification.md#install) for supported runtimes
and pinned Python dependencies, then run:

```bash
npm ci
npm run verify
npm run verify:offline
```

## Branching

Use the persistent `develop` branch for integration. Create short-lived branches
from `develop` and target their pull requests to `develop`. Promote reviewed,
licensed, and validated content from `develop` to `main` when ready for release.
Retain `develop` after each promotion.

## The rules

- **Consistent tooling.** Book-specific PDF extractors use **PyMuPDF (`import fitz`)**,
  because each book’s fonts need independent filters. The existing SRD 5.2.1
  extractors use **pdfplumber**, an explicit exception documented in the
  [ingest guide](./docs/guides/ingest.md#srd-521-from-the-official-pdf).
  Ingesting a new Kobold book starts as a faithful copy of `tob3.py`.
  Never swap PDF libraries or reimplement extraction inline.
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
