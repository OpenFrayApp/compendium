# Domain ownership and contracts

This repository has one context: [compendium ingest](../CONTEXT.md).
Source adapters and original-content collections share its language and publication requirements.
The [parent context map](https://github.com/OpenFrayApp/openfray/blob/main/CONTEXT-MAP.md) places it alongside the console and deployment workspace.

## Ownership

| Owner | Responsibility | Authoritative documentation |
| --- | --- | --- |
| Compendium ingest | Source extraction, original data authoring, mapping, validation, source reviews, and reviewed exports | [Task guides](./README.md#task-guides), [review index](./README.md) |
| Combat console | Creature and spell schema, selectable libraries, runtime casting behavior, shipped datasets, and public credits | [Domain glossary](https://github.com/OpenFrayApp/console/blob/main/CONTEXT.md), [agent guidance](https://github.com/OpenFrayApp/console/blob/main/AGENTS.md) |
| Parent workspace | Cross-repository agreements, licensing checklist, and assembled deployment | [Context map](https://github.com/OpenFrayApp/openfray/blob/main/CONTEXT-MAP.md), [content licensing](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md) |
| Marketing site | Published book presentation and rendering of console stat-block data | [Site guidance](https://github.com/OpenFrayApp/site/blob/main/AGENTS.md) |

## Console contract

The console owns the [schema](https://github.com/OpenFrayApp/console/tree/main/src/schema).
`src/schema/` and its required dependencies are vendored from the immutable console revision in [the provenance manifest](../schema-provenance.json).
Schema changes originate in the console and follow the [sync and drift-check workflow](./schema-sync.md).
A mapper must preserve unsupported mechanics as prose or withhold the entry with a review finding.
Conditional advantage remains prose.

A creature template describes a stat block. The console creates a combatant from that template for a fight.
Encounter state, spent resources, targeting, and runtime effects belong to the console.
A spell’s save DC belongs to its caster.

Source identity distinguishes same-name entries. Rules edition identifies their rules baseline.
A publication revision alone does not establish rules compatibility.
`sourcePage` is provenance; each extractor’s review documents whether it uses physical or printed page numbers.

The console owns [library registration](https://github.com/OpenFrayApp/console/blob/main/src/compendium/libraries.ts)
and [casting behavior](https://github.com/OpenFrayApp/console/blob/main/src/combat/casting.ts).
Reference spell exports contain no embedded rollable mechanics.
The console may supply separately reviewed source-specific profiles for supported consequences.
Unsupported consequences remain manual, and a same-name spell from another source supplies no automation approval.

## Review and publication

Extraction captures evidence. Mapping produces entries; preparation produces provisional candidates and review reports.
Validation checks represented invariants. Source review checks fidelity and the applicable reuse requirements.
These are separate checks: passing validation grants no publication approval.

The [reference spell publication record](./reference-spell-publication.md) defines approved selections and usage limits.
Its [approval module](../src/compendium/referenceSpellPublication.ts) pins candidate hashes, counts, editions, and accepted warnings.
A changed candidate snapshot requires renewed review and approval.
Preparation reports can retain conservative blockers while a separate decision approves one pinned reference-only selection.

Before distributing data:

1. Follow the parent’s [licensing checklist](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md).
2. Resolve or explicitly record source fidelity findings, exclusions, and publication limits in the source review.
3. Run the applicable generator and validator documented in the [task guides](./README.md#task-guides).
4. Run the challenge-rating estimate for new or rebalanced original creatures.
5. Export or copy only vetted datasets into the console’s `public/compendium/`.
6. Update console library registration, runtime coverage where applicable, and [CREDITS.md](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md).
7. Validate and test the changed repositories before publication.

Compendium exports do not register a console library or deploy OpenFray.
The parent workspace records component revisions and owns assembled deployment.

## Documentation boundaries

Keep domain definitions in [CONTEXT.md](../CONTEXT.md), setup in the [README](../README.md), and runnable recipes in the [task guides](./README.md#task-guides).
Keep source evidence in the [review documents](./README.md) and historical leads in the [investigation index](./investigations/README.md).
Link shared licensing rules and console contracts to their owners.
Source-specific copyright transcripts retain their exact legal wording.

Typed original content lives in `src/originals/`; generated JSON lives under ignored `output/`.
Keep supplied PDFs, extracted pages, and private review caches outside Git under the parent’s
[repository file policy](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/repository-files.md).
