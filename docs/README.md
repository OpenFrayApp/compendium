# Compendium documentation

Start with the [README](../README.md) for setup and an offline example.
Read [CONTEXT.md](../CONTEXT.md) for terminology and
[domain ownership and contracts](./domain.md) for repository boundaries.
Check [source status](./source-status.md) before selecting inputs or distributing data.

## Task guides

| Task | Guide |
| --- | --- |
| Synchronize console-owned schema or check local drift offline | [Schema synchronization](./schema-sync.md) |
| Extract and ingest SRD creatures and spells | [SRD ingestion](./srd-ingestion.md) |
| Extract and ingest Tome of Beasts, Khyberia, or Creature Codex | [Ingest](./guides/ingest.md), [Kobold checks and parity](./kobold-ingestion.md) |
| Prepare or replay Open5e creature candidates | [Prepare creatures](./guides/prepare-creatures.md) |
| Prepare or replay Open5e, GM Binder, or Kibbles spell candidates | [Prepare spells](./guides/prepare-spells.md) |
| Change GM Binder or Kibbles extraction, mapping, or replay tests | [Direct-source implementation map](./direct-spells.md) |
| Review Tome of Heroes, Deep Magic 2020, or Warlock sources | [Review spells](./guides/review-spells.md) |
| Author originals, validate datasets, compare fields, or estimate challenge ratings | [Original content and checks](./guides/original-content.md) |
| Emit validated datasets or reuse the emission contract | [Dataset emission](./dataset-emission.md) |
| Export approved reference cards and hand off vetted datasets | [Publish](./guides/publish.md) |

The [verification guide](./verification.md) covers `npm run verify`,
`npm run verify:offline`, individual checks, formatting, prose, and parity limits.
Start with the [README checks](../README.md#verification).
The [shared formats guide](./formats.md) records parser ownership, consumers, grammar boundaries, and representative byte parity.
The [reviewed spell guide](./reviewed-spell-preparation.md) maps source corrections and publication gates.
The [migration audit](./migration-audit.md) accounts for replaced tests, retained interfaces, verification evidence, and private retention.

## Current publication records and source evidence

A source review records fidelity and reuse evidence.
A publication record defines an approved selection; historical findings alone grant no approval.

| Subject | Review or decision | Legal evidence |
| --- | --- | --- |
| Six pinned reference spell selections | [Publication record](./reference-spell-publication.md) | Source-specific transcripts and console credits |
| Open5e spell candidates | [Scope, inventory, and gates](./open5e-5e-spell-publication.md) | Publisher evidence in the inventory |
| Open5e creature candidates | [Historical source review](./open5e-review.md) | Declarations and outstanding gates in the review |
| Deep Magic 2020 | [Spell review](./deep-magic-2020-review.md), [pinned decision](./reference-spell-publication.md#deep-magic-2020) | [Section 15](./deep-magic-2020-section-15.md) |
| Tome of Heroes | [Source evidence](./open5e-5e-spell-publication.md#supplied-tome-of-heroes-declaration), [90-card decision](./reference-spell-publication.md#tome-of-heroes) | [Section 15](./tome-of-heroes-section-15.md) |
| Warlock Grimoire | [Boundaries](./warlock-content-boundaries.md), [draft audit](./warlock-grimoire-review.md), [35-card decision](./reference-spell-publication.md#warlock-grimoire) | [Copyright notices](./warlock-section-15.md) |
| Khyberia SRD | [October 2023 creature review](./khyberia-review.md) | Required notices in the review |
| Tome of Dark Creatures | [Not approved: licensing review](./tome-of-dark-creatures-review.md) | Inspected notice findings in the review |

## Historical investigations

The [investigation index](./investigations/README.md) preserves source searches, rejected candidates,
negative inventories, and per-source lead statuses.
Existing evidence files remain at stable paths.
Legal transcripts retain their exact wording.

## Shared authorities

- [Parent context map](https://github.com/OpenFrayApp/openfray/blob/main/CONTEXT-MAP.md): cross-repository relationships.
- [Content licensing](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/content-licensing.md): source admission and attribution requirements.
- [Repository file policy](https://github.com/OpenFrayApp/openfray/blob/main/docs/development/repository-files.md): retention of private inputs and generated evidence.
- [Console domain](https://github.com/OpenFrayApp/console/blob/main/CONTEXT.md): combat-console terminology.
- [Console schema](https://github.com/OpenFrayApp/console/tree/main/src/schema): upstream creature and spell types.
- [Console credits](https://github.com/OpenFrayApp/console/blob/main/CREDITS.md): public compliance record for distributed content.
- [Parent deployment workspace](https://github.com/OpenFrayApp/openfray): component revisions and assembled deployment.
