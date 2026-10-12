// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone
//
// License by layer — this file mixes code, open game data, and protected content:
//   • Code (this module, its types and structure): AGPL-3.0-or-later, per the SPDX line
//     above, like the rest of the tooling.
//   • Stat blocks / mechanics — every creature field EXCEPT `description`: original OpenFray
//     content under CC-BY-4.0. Reuse the crunch, with attribution to OpenFray.
//   • Lore, art, and prose — each creature's `description` text, plus any future images and
//     "family" lore: © OpenFray, all rights reserved. Shown in the app, but not licensed
//     for reuse — don't copy it into other products.
// See CREDITS.md.

// "Brood & Bloom" — original OpenFray creatures (not SRD or third-party OGL content), so
// they are authored here directly rather than extracted from a PDF.

import type { Creature } from '../schema/creature.ts'

import { parasitesAndLazaretCreatures } from './brood-and-bloom/parasites-and-lazaret.ts'
import { fungalBloomCreatures } from './brood-and-bloom/fungal-bloom.ts'
import { wakelightBroodCreatures } from './brood-and-bloom/wakelight-brood.ts'
import { handsOfTheHostCreatures } from './brood-and-bloom/hands-of-the-host.ts'

export const broodAndBloomCreatures: Creature[] = [
  ...parasitesAndLazaretCreatures,
  ...fungalBloomCreatures,
  ...wakelightBroodCreatures,
  ...handsOfTheHostCreatures
]
