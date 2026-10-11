# Prepare provisional creature candidates

Run commands from the repository root after [setup](../../README.md#setup).
Check the [source status](../source-status.md) before choosing inputs or distributing results.

## Prepare additional Open5e libraries

`prepare:open5e` creates local review artifacts only. It leaves the console and
existing PDF-derived datasets unchanged. The active `all` batch is empty.
Historical A5E, Black Flag, and ToB 2023 reviews remain available by explicit
document key. Tal’Dorei is no longer a preparation candidate.

| Open5e document key | Source                          | Records observed during preparation |
| ------------------- | ------------------------------- | ----------------------------------- |
| `a5e-mm`            | Monstrous Menagerie             | 586                                 |
| `bfrd`              | Black Flag SRD                  | 360                                 |
| `tob-2023`          | Tome of Beasts 1 (2023 Edition) | 408                                 |

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
[Source review](../open5e-review.md) records publisher notices, verified
corrections, and outstanding licensing and schema gates. Black Flag’s publisher
offers CC-BY alongside ORC, but the feed’s older release still needs comparison.
The authorized ToB 2023 sample verifies its reuse declaration. Exclusions cover
named rulers, Ia’Affrat, and their explicitly named spawn. The sample omits
Section 15, so the complete attribution chain remains a publishing gate. Console library registration, credits, and shipping the
vetted datasets require separate work.
