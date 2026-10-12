# Compendium ingest

Compendium ingest turns licensed game content and OpenFray’s original content into reviewed creature and spell datasets for the combat console.

## Language

### Content and identity

**Compendium**:
The creature and spell reference available to the Game Master in the console.
_Avoid_: Database, library (for the whole compendium)

**Library**:
A distinct content collection available within the compendium, with its own source identity.
_Avoid_: Ruleset, source (when referring to a selectable collection)

**Source**:
The publication or original collection from which an entry’s content originates.
_Avoid_: Library (when referring to provenance), feed

**Rules edition**:
The rules baseline associated with an entry, distinct from the publication’s printing or revision.
_Avoid_: Book edition (for rules compatibility)

**Creature template**:
A creature’s reference stat block, independent of any creature participating in a fight.
_Avoid_: Combatant, monster

**Spell entry**:
A source-specific spell reference containing display information, rules prose, and any reviewed structured mechanics.
Same-name spells from different sources remain distinct entries.
_Avoid_: Casting, spell instance

### Evidence and review

**Source snapshot**:
The captured source material used as evidence for a particular review.
_Avoid_: Candidate dataset, published dataset

**Candidate dataset**:
A provisional collection of mapped entries awaiting the applicable source review and publication decision.
_Avoid_: Approved library, published dataset

**Source review**:
An assessment of source fidelity, reuse rights, exclusions, attribution, and compatibility for a defined selection of content.
_Avoid_: Validation, publication approval

**Validation finding**:
A reported inconsistency or warning about an entry’s represented fields and rules.
_Avoid_: Licensing verdict, publication blocker (for every finding)

**Publication blocker**:
An unresolved requirement that prevents a defined selection of content from being approved for distribution.
_Avoid_: Validation error (when the requirement concerns licensing or review)

**Publication approval**:
A decision permitting distribution of a reviewed selection under stated source, attribution, and usage limits.
_Avoid_: Validation success, automation approval

### Representation and use

**Structured mechanics**:
Explicit game values and consequences represented separately from rules prose for supported console operations.
_Avoid_: Rules text, complete rules implementation

**Reference spell card**:
A spell entry approved for reference display without embedded rollable mechanics.
Any supported casting consequences require a separate console review.
_Avoid_: Automated spell, unsupported spell

**Casting verdict**:
The console’s source-specific decision about which consequences of a spell it supports and which require manual handling.
_Avoid_: Publication approval, validation result

**Published dataset**:
A reviewed collection of entries distributed with the required attribution for use in the console.
_Avoid_: Candidate dataset, extraction output
