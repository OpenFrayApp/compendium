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

## Publication gates

Deep Magic requires its edition-specific OGC/PI declaration and complete Section 15. Tome of Heroes requires the complete chain and an exclusions review.

Deep Magic Extended, Warlock, and the Kobold compilation require their underlying book or issue identities, declarations, and chains. Their Community Use Policy descriptions do not establish an independent OGL grant.

Open5e Originals requires its own content grant and required notices. Black Flag’s v1 ORC label and v2 CC-BY label require publisher verification if spell records become available.

Preparation reports four duration errors and 121 component warnings across the five Kobold feeds. Compare source fields before correcting them; do not infer concentration, materials, or class assignments. Passing dataset validation does not resolve the licensing gates.
