// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import {
  extractGmBinderSpells,
  prepareGmBinderSpells,
  type GmBinderSpellSource,
} from "./gmBinderSpells.ts";
import { mapDirectSpellBlock, type DirectSpellBlock } from "./directSpells.ts";
export type { DirectSpellBlock } from "./directSpells.ts";

export const STDS_URL = "https://www.gmbinder.com/share/-NR0OWlW60yv2EfA3qQp";
const CONFIG: GmBinderSpellSource = {
  source: "somanyrobots-spells-that-dont-suck",
  url: STDS_URL,
  requiredCredits: ["Omega Ankh", "somanyrobots", "KibblesTasty"],
  attribution:
    "Includes spells from Spells That Don’t Suck by Omega Ankh and somanyrobots, licensed CC-BY-4.0 and available at https://www.gmbinder.com/share/-NR0OWlW60yv2EfA3qQp. Includes spells from Kibbles’ Casting Compendium 2.0 by KibblesTasty Homebrew LLC, licensed CC-BY and available at https://www.kthomebrew.com/krd. Adapted into OpenFray’s schema; display formatting changed and advice panels omitted. License: https://creativecommons.org/licenses/by/4.0/legalcode.",
};

/** Extract the creators’ spell text and verify this document’s licensing credits. */
export function extractStdsSpells(html: string) {
  return extractGmBinderSpells(html, CONFIG.requiredCredits);
}

/** Map this source’s display fields without interpreting conditional mechanics. */
export function mapStdsSpell(block: DirectSpellBlock) {
  return mapDirectSpellBlock(block, CONFIG.source);
}

/** Prepare direct-source candidates with publisher licensing evidence and review gates. */
export function prepareStdsSpells(html: string) {
  return prepareGmBinderSpells(html, CONFIG);
}
