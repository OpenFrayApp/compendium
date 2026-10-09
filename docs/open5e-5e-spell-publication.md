# Open5e D&D 5e spell publication

## Scope

Select third-party `5e-2014` and `5e-2024` spell documents. Exclude core WotC SRDs, A5E, and unsupported rulesets. Spells That Don’t Suck uses the existing direct-publisher pipeline.

Keep source-specific IDs and manual reference status. Same-name cards from different books remain separate. API license labels do not approve publication.

## Inventory

The live API audit and preparation contain 746 spell records:

| Document                   | API key  | Records |
| -------------------------- | -------- | ------: |
| Deep Magic for 5th Edition | `deepm`  |     515 |
| Deep Magic Extended        | `deepmx` |      64 |
| Kobold Press Compilation   | `kp`     |      31 |
| Open5e Originals           | `open5e` |       2 |
| Tome of Heroes             | `toh`    |      91 |
| Warlock Zine               | `wz`     |      43 |
| Vault of Magic             | `vom`    |       0 |
| Black Flag SRD             | `bfrd`   |       0 |

Vault of Magic and Black Flag also return zero spells from v1. Black Flag’s v1 document slug is `blackflag`, not `bfrd`.

Creature Codex, Tal’dorei, all listed Tome of Beasts editions, and Open5e Originals 2024 return zero v2 spells. The generated index retains every selected source, including empty feeds.

Replay with `npm run prepare:open5e-spells -- all output/open5e-spell-preparation/discovery.json`. Snapshots, candidates, and reports remain ignored build artifacts.

## Source evidence

- [Tome of Heroes authorized retail preview](https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/402102-sample.pdf): physical page 2, printed page 3, grants spells as Open Game Content. It excludes place names, specific character references, and the named rune, hedge-magic, and gunpowder material. The preview does not supply the complete Section 15 chain.
- [Publisher Deep Magic license page](https://koboldpress.com/open-game-license-version-1-0a_deepmagic/): identifies the 2014 Pathfinder book. It does not establish the 2020 5e compilation’s declaration or copyright chain.
- [Open5e repository license](https://github.com/open5e/open5e-api/blob/1253adb7e58dde6cae556c6bd3515dcb521b723e/LICENSE.md): expressly makes no licensing claims for included third-party SRD/OGL content. Its software license is not a grant for those spell books.

### Supplied Tome of Heroes declaration

A supplied copyright-page screenshot identifies ©2022 Open Design LLC and ISBNs `978-1-950789-30-6` and `978-1-950789-32-0`. Its SHA-256 is `532c4434927b0e76abe9c692d6b7eb8323c364471b941b0c28eeb5e1ac641ed7`.

The declaration includes spells as Open Game Content, excluding place names and specific character references, such as gods and NPCs. It also excludes text related to Draconic Rune Casting, Hedge Magic, and the listed black-powder subclasses, rules, items, and weapons. This supports the grant already visible in the authorized preview. The screenshot does not contain the complete OGL or Section 15 chain.

A keyword screen of the 91 prepared candidates flags **Deadly Salvo**. Its prose invokes the gunpowder weapon property and refers to the Adventuring Gear chapter. Review the publisher spell page and declaration before approving it. Do not copy the excluded weapon rules or remove the dependency from its mechanics. The remaining cards still require an exclusions review; a keyword screen does not establish clearance.

Obtain the complete final Open Game License page, including all Section 15 entries, and the relevant spell pages before publication approval.

## Recovered import provenance

[Open5e import PR #178](https://github.com/open5e/open5e-api/pull/178) identifies Extended, Compilation, and Warlock as a Foundry-module import. Its discussion records uncertainty about the underlying publications. Contributors subsequently added class and school metadata using a community wiki.

The [original spell files](https://github.com/open5e/open5e-api/tree/34b88208ba629bb152508fd5ba9d27a510918889/data) retain per-spell `source` codes. Their titles match all current candidates in these three feeds: 64 Extended, 31 Compilation, and 43 Warlock records. Matching titles establish a provenance lead only. They do not establish identical rules text or publication permission.

The original source-code counts are:

| Feed        | Literal source code                                                                           | Records |
| ----------- | --------------------------------------------------------------------------------------------- | ------: |
| Extended    | `HH DM:Cw,ZG`                                                                                 |      25 |
| Extended    | `HH DM:LL,MM:LL`                                                                              |      10 |
| Extended    | `HH DM:Ru`                                                                                    |       6 |
| Extended    | `HH DM:S`                                                                                     |       3 |
| Extended    | `DM:B&D MWB`                                                                                  |       3 |
| Extended    | `DM:Cw`, `HH DM:EH`, `DM:M`, `HH DM:Cw`                                                       |  2 each |
| Extended    | `HH DM:Ri`, `DM:B&D`, `DM:T`, `HH DM:LL`, `HH DM:B`, `HH DM:H`, `HH DM:I`, `DM:CD`, `HH DM:E` |  1 each |
| Compilation | `DC&SS`                                                                                       |      16 |
| Compilation | `ToOM:PH`, `MWB`                                                                              |  6 each |
| Compilation | `HH MWB`                                                                                      |       2 |
| Compilation | `HH`                                                                                          |       1 |
| Warlock     | `W:LM`                                                                                        |      13 |
| Warlock     | `W22`, `W:SR`, `W12`                                                                          |  4 each |
| Warlock     | `W23`, `WG W10`, `WG W8`, `WG W3`                                                             |  3 each |
| Warlock     | `W21`                                                                                         |       2 |
| Warlock     | `WG W6`, `WL24`, `W19`, `W14`                                                                 |  1 each |

Keep these codes literal until publisher evidence establishes their meanings and editions. Extended and Compilation are mixed-source buckets, not verified standalone book titles.

The [original Deep Magic import](https://github.com/open5e/open5e-api/blob/9ec5bb06a8550aca1b3dd9254591b974c83f7367/data/deep_magic/document.json) includes `ogl-lines`. Those lines describe a community wiki and contain a broad multi-book Section 15 list. The [Extended import](https://github.com/open5e/open5e-api/blob/34b88208ba629bb152508fd5ba9d27a510918889/data/deep_magic_extended/document.json) also retains that list. Neither establishes the exact publisher declaration or complete chain for each imported book.

The publisher’s [Community Use Policy](https://koboldpress.com/kobold-press-community-use-policy/) grants specified non-commercial permissions. It covers listed assets, descriptions, blog material, and descriptive references. It does not supply a blanket grant to republish spell collections. Its notice cannot replace each source’s OGL requirements.

## Publisher material needed

Start with legally obtained publisher PDFs for the 2020 _Deep Magic for 5th Edition_ compilation and _Tome of Heroes_. For each, review:

1. The title, edition, and copyright pages.
2. The Open Game Content and Product Identity declarations.
3. The complete OGL page and Section 15 chain.
4. Spell pages needed to resolve exclusions, class gaps, and material-component warnings.

For the other feeds, identify the literal source codes above against publisher books or Warlock issues before approving any subset. Copyright pages alone cannot resolve missing mechanics.

Keep supplied PDFs outside Git. A local folder path is sufficient; contributors do not need to upload entire books to a public service.

## Publication gates

Deep Magic requires its edition-specific OGC/PI declaration and complete Section 15. Tome of Heroes requires the complete chain and an exclusions review.

Deep Magic Extended, Warlock, and the Kobold compilation require their underlying book or issue identities, declarations, and chains. Their Community Use Policy descriptions do not establish an independent OGL grant.

Open5e Originals requires its own content grant and required notices. Black Flag’s v1 ORC label and v2 CC-BY label require publisher verification if spell records become available.

Preparation has no duration errors. Moon Trap, Iron Gut, Stone Aegis, and Mind Maze explicitly have conditional durations without Concentration in both API versions. The validator accepts those durations without changing the source flags.

Complete v1 snapshots recover 533 absent class lists when source aliases, stable IDs, names, and prose match. Existing v2 assignments remain unchanged. Each report records recovered classes and the legacy snapshot hash.

The five Kobold feeds retain 121 component warnings. Both API versions lack the corresponding material descriptions or carry a non-material casting note. Do not invent missing materials. Passing dataset validation does not resolve the licensing gates.
