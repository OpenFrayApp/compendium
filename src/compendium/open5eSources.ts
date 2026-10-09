// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { CandidateKey } from './open5ePreparation.ts'

// The 2023 sample reserves named individuals and all text related to archdevils,
// demon lords, and fey rulers, including named minion entries.
const TOB_RESERVED = new Set([
  'akyishigal', 'alquam', 'camazotz', 'mechuiti', 'qorgeth', 'mammon', 'totivillus',
  'lord of the hunt', 'moonlit king', 'queen of night and magic', 'queen of witches',
  'river king', 'snow queen', 'bear king', 'avatar of boreas', 'emperor of the ghouls',
  "baba yaga's horsemen", "ia'affrat", 'spawn of akyishigal', 'spawn of arbeyach',
])

const EXCLUDED_WOTC = /\b(?:beholder|mind flayer|illithid|githyanki|githzerai|displacer beast|umber hulk|yuan-ti|slaad|kuo-toa|carrion crawler)\b/i

/** Exclude reserved names and related entries without dropping unrelated generic creatures. */
export function exclusionReason(key: CandidateKey, name: string): string | undefined {
  const normalized = name.trim().toLowerCase().replace(/’/g, "'")
  if (EXCLUDED_WOTC.test(normalized)) return 'SRD-excluded Wizards of the Coast name; excluded under repository policy.'
  if (key === 'tob-2023' && TOB_RESERVED.has(normalized)) return 'Reserved named individual or related entry under the Tome of Beasts 2023 Product Identity declaration.'
  return undefined
}

export const OPEN5E_SOURCE_REVIEW = {
  'a5e-mm': {
    license: 'OGL-1.0a',
    noticeUrl: 'https://a5esrd.com/how-to-use-the-open-game-license',
    blockers: [
      'The feed identifies the 2021 commercial Monstrous Menagerie, not the current CC-BY A5ESRD. Verify the book’s OGC/PI declaration and complete Section 15 chain.',
      'CC-BY may be elected only after matching all included feed material to the publisher’s A5ESRD content.',
      'Verify the Miremuck Goblin King and Yobbo HP/dice pairs; other reviewed arithmetic deviations remain cited warnings.',
      'Verify expertise dice and elite XP multipliers; the API’s flat fields omit source mechanics.',
      'Titanic-size records are withheld because the upstream Creature schema cannot represent their size.',
    ],
  },
  bfrd: {
    license: 'CC-BY-4.0',
    noticeUrl: 'https://koboldpress.com/kobold-press-releases-the-black-flag-reference-document-bfrd-in-creative-commons-updated-with-new-material-for-gms/',
    blockers: [
      'Black Flag publishes check/save modifiers that can include proficiency; Open5e synthesizes ability scores. The current Creature schema cannot represent that distinction.',
      'The sidecar preserves modifiers and available fixed statistics. Stealth is publisher-checked for only Aboleth and Ancient Red Dragon; do not publish this incomplete conversion.',
      'The feed describes BFRD v0.2; compare it with the publisher’s CC-BY release and preserve that release’s exact required attribution.',
    ],
  },
  'tob-2023': {
    license: 'OGL-1.0a',
    noticeUrl: 'https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/190499-sample.pdf',
    blockers: [
      'The authorized 2023 sample establishes the OGC/PI declaration but omits the OGL and Section 15. Obtain the edition’s complete verbatim attribution chain.',
      'Review remaining creature prose for reserved proper names, setting references, and text related to archdevils, demon lords, and fey rulers.',
      'Verify Soul Eater’s Constitution save; the Dwarven Ringmage and Valkyrie publisher errata are applied.',
    ],
  },
  tdcs: {
    license: 'OGL-1.0a',
    noticeUrl: 'https://greenronin.com/blog/2017/06/01/critical-role-release-plan/',
    blockers: [
      'Obtain the 2017 edition’s OGC/PI declaration and full Section 15 chain from an authorized public source; do not substitute the Reborn edition.',
      'Verify generic creature names are reusable and review the Stoneguard and Waverider saving throws.',
      'The feed duplicates Flamecharm inside Firetamer’s Scimitar and merges spell-level headings. Preserve source prose until primary-source corrections are verified.',
    ],
  },
} as const
