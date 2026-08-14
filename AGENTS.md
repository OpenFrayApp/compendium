Guidance for AI agents (and humans) working in openfray-compendium. The
[README](./README.md) explains what each pipeline does and how to run it — read it
first. This file adds the rules for changing things.

## The rules live with the app

This repo follows the main repo's
[AGENTS.md](https://github.com/OpenFrayApp/openfray.app/blob/main/AGENTS.md) — one code
style, one committing convention, shared licensing policy. In brief, the parts that
apply here verbatim:

- **Code style:** self-explaining code; every named function opens with a one-line
  header comment saying what it does; no other comments unless the code can't say it
  (a why, a gotcha, a source-data quirk); one definition per concept; new source
  files start with the short AGPL header.
- **Committing:** one concern per commit, `Area: what changed` subjects (the areas
  here: a pipeline name, `The Waking Garden`, `Brood & Bloom`, `crestimate`,
  `validate`, `Docs`, `Tests`), DCO sign-off via `git commit -s`, authorship is
  human — never add AI co-author trailers — and don't push without the maintainer's
  go-ahead.
- **Content licensing:** each source under its own license, CC-BY > ORC > OGL, never
  assumed; never ingest SRD-excluded WotC IP. The obligations and the record of
  compliance live in the app repo (`CREDITS.md`).
- **Tests:** everything testable ships with tests, in `tests/` mirroring `src/`;
  `npm test` and `npm run typecheck` stay green.

## Rules specific to this repo

1. **This repo is build-time only.** The app never runs it; it ships JSON into the
   app's `public/compendium/`. Nothing here may become a runtime dependency.
2. **`src/schema/` is a vendored copy** of the app's `Creature`/`Spell` types. The
   source of truth is the app repo — change the schema there first, then mirror it
   here in the same working session. Never let the two drift.
3. **Per-book extractors stay separate.** `tob1.py`/`tob2.py`/`tob3.py` deliberately
   don't share extraction code — each book's fonts break the others' filters (the
   README has the details). New Kobold book = a faithful copy of `tob3.py`, tuned.
   They share only the TS mapper. Don't "unify" them.
4. **`output/` is a build artifact** and the PDFs are inputs supplied at ingest
   time; neither is ever committed.
5. **First-party creatures are authored in TypeScript** (`brood.ts`,
   `waking-garden.ts`) — edit the `.ts`, never the generated JSON. `tsc` is the
   field-level check; the invariant validator gates the ingest.
6. **Every ingest ends with the validator** (`npm run validate -- <file>` plus a
   diff against the app's current JSON when replacing a published set), and a CR
   change to a first-party creature gets an `estimate:cr` pass. A validator or
   estimator flag is a prompt to look, not a build style to silence.
7. **Prose is display-only.** Mechanics live in structured fields; ingest-time
   parsing of source prose is fine (that's what this repo is for), but never emit
   data the app would have to re-parse out of prose.
