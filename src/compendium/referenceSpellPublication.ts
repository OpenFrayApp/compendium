// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import type { Spell } from "../schema/spell.ts";
import type { Edition } from "../schema/primitives.ts";
import { validateSpellDataset } from "./validate.ts";

export interface ReferenceSpellApproval {
  source: string;
  preparation: string;
  file: string;
  count: number;
  edition: Edition;
  sha256: string;
  acceptedWarningIds: string[];
}

export const REFERENCE_SPELL_APPROVALS: ReferenceSpellApproval[] = [
  {
    source: "kibblestasty-casting-compendium-v2.3",
    preparation: "kibbles-casting-v23-preparation",
    file: "kibbles-casting-v23-spells.json",
    count: 295,
    edition: "5.0",
    sha256: "337409cc7078f3a425bc8ddaf25af2cf0f3f325d2ed13f55c9dabf673d93ea3a",
    acceptedWarningIds: ["kibblestasty-casting-compendium-v2.3:bile-beam"],
  },
  {
    source: "somanyrobots-spells-that-dont-suck",
    preparation: "spells-that-dont-suck-preparation",
    file: "spells-that-dont-suck-spells.json",
    count: 181,
    edition: "5.0",
    sha256: "2ca2be2cd64557ef02bdc0fc7137b87553a0bcd4f35c8db465530a7ef5f290ec",
    acceptedWarningIds: [],
  },
  {
    source: "somanyrobots-so-many-spells",
    preparation: "so-many-spells-preparation",
    file: "so-many-spells-spells.json",
    count: 179,
    edition: "5.0",
    sha256: "69cbebe97a86cf16e001d2367ed71f2ab5664904e823c23cec5efa94c6e8e2cd",
    acceptedWarningIds: [],
  },
  {
    source: "kobold-press-toh",
    preparation: "tome-of-heroes-preparation",
    file: "tome-of-heroes-spells.json",
    count: 90,
    edition: "5.0",
    sha256: "193349583d5f5a6e28d4396a32a3e19784c56f0046d6f5a2ada7b4749ce1176f",
    acceptedWarningIds: [],
  },
];

/** Enforce the reviewed snapshot, source boundaries, and reference-only publication verdict. */
export function approveReferenceSpells(
  content: string,
  approval: ReferenceSpellApproval,
): Spell[] {
  if (createHash("sha256").update(content).digest("hex") !== approval.sha256) {
    throw new Error(
      `Snapshot changed for ${approval.source}; review and renew its publication approval`,
    );
  }
  const spells: Spell[] = JSON.parse(content);
  if (
    !Array.isArray(spells) ||
    spells.length !== approval.count ||
    spells.some(
      (spell) =>
        spell.source !== approval.source || spell.mechanics || spell.edition,
    )
  ) {
    throw new Error(`Reference-only scope changed for ${approval.source}`);
  }
  const result = validateSpellDataset(spells);
  if (
    result.issues.some(
      (issue) =>
        issue.severity === "error" ||
        issue.field !== "components" ||
        issue.message !== "material flag and material text disagree" ||
        !approval.acceptedWarningIds.includes(issue.id),
    )
  ) {
    throw new Error(`Unaccepted validation finding for ${approval.source}`);
  }
  return spells.map((spell) => ({ ...spell, edition: approval.edition }));
}
