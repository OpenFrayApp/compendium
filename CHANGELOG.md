# Changelog

What changed in the data this repo emits, newest first. Each entry says what a Game
Master would notice in a stat block or on a spell card, not what changed in the
extractors — the commit history is the record of that.

**This repo has no releases.** It is build-time tooling: the version that matters to a
table is the [console](https://github.com/OpenFrayApp/console)'s, whose own CHANGELOG
names the libraries a release ships. Entries here are dated, not numbered, and a change
only reaches a table once the regenerated JSON is copied into the console's
`public/compendium/`.

Ingest fixes that leave every emitted field identical (a rewritten extractor, a faster
parser) do not belong here. A corrected number, a reworded trait, a creature added or
removed does.

## 2026-08-17

### Brood & Bloom

- The **Reliquary Imago** and **Tallow Imago** descriptions say where their size comes
  from. Both open from a husk built around a much smaller larva, and neither entry
  explained it: the case holds the body, and the wings come out folded and open as the
  moth rises. The sizes themselves are unchanged, and were checked across all three
  brood lines first — a husk has always been sized to the larva that sealed itself
  inside it, not to the adult that emerges.

## Before this file

The datasets that existed when this changelog started, and the releases they shipped in:

- **SRD 5.2.1** creatures and spells, parsed from WotC's own rules document, and
  **SRD 5.1** from dnd5eapi — console 0.2.0.
- **Tome of Beasts 1–3** and **Creature Codex** (Kobold Press), and the OpenFray
  originals **The Waking Garden** and **Brood & Bloom** — console 0.2.0.
- **Brood & Bloom**'s own spells and the Hands of the Host, and
  **On Strong Waters and Potent Simples**, eleven authored spells with no creatures —
  console 1.0.0.
