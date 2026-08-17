# The data voice

How the compendium's authored text is written: stat-block traits and actions, spell
text, and creature descriptions in the original libraries. Read the
[shared style core](https://github.com/OpenFrayApp/openfray/blob/main/STYLE.md)
first: the game-text mechanics (numbers, term capitalization, wording) live there
and apply to every field this repo emits.

## The rules

- **Stat-block text is mechanics only.** A trait or action's `text` states what
  happens in the game: the roll, the save, the damage, the condition, the duration.
  Lore lives in the creature's `description`; advice for the Game Master lives
  nowhere in the data.
- **Spells speak to the caster.** "You touch a creature," never "The caster touches
  a creature." This is the SRD's own voice, and the spell-side validator checks the
  traps around it (a Concentration duration repeating the card, a ritual flag
  disagreeing with the casting time, scaling at or below the spell's level).
- **State intent, not instruction.** Where a design note is warranted, describe what
  the creature or rule is for, never how it must be run. The full register rules for
  book prose are in the site repo's guide; the same neutral register governs every
  sentence here.
- **Never bake conditional advantage into data.** A trait that grants advantage
  under a condition stays prose; the Game Master applies it at the table.
- **Descriptions are lore, briefly.** A creature's `description` may carry the
  authored voice, within the restraint the book register sets: plain beats ornate,
  one image per passage.

Everything this repo writes is read twice: on a book page and in the console. The
shared mechanics are what keep those two readings identical.
