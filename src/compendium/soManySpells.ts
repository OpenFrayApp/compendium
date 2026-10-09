// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import {
  prepareGmBinderSpells,
  type GmBinderSpellSource,
} from "./gmBinderSpells.ts";

export const SO_MANY_SPELLS_URL =
  "https://www.gmbinder.com/share/-NMZq9u_rDyV_XD5YTxf";
const CONFIG: GmBinderSpellSource = {
  source: "somanyrobots-so-many-spells",
  url: SO_MANY_SPELLS_URL,
  requiredCredits: [
    "So Many Spells",
    "somanyrobots",
    "System Reference Document 5.1",
    "Wizards of the Coast LLC",
  ],
  attribution:
    "Includes spells from So Many Spells by somanyrobots, licensed CC-BY-4.0 and available at https://www.gmbinder.com/share/-NMZq9u_rDyV_XD5YTxf. Adapted into OpenFray’s schema; display formatting changed and advice panels omitted. Commissioned-spell credits are retained in the source licensing evidence. This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.",
};

/** Prepare the creator’s standalone spell collection with its own identity and licensing evidence. */
export function prepareSoManySpells(html: string) {
  return prepareGmBinderSpells(html, CONFIG);
}
