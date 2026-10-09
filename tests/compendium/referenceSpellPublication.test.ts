// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { Spell } from "../../src/schema/spell.ts";
import {
  approveReferenceSpells,
  REFERENCE_SPELL_APPROVALS,
  type ReferenceSpellApproval,
} from "../../src/compendium/referenceSpellPublication.ts";

const SPELL: Spell = {
  id: "test:spell",
  name: "Test Spell",
  source: "test",
  level: 1,
  school: "Evocation",
  castingTime: "1 action",
  range: "60 feet",
  components: { verbal: true, somatic: true, material: false },
  duration: "instantaneous",
  concentration: false,
  ritual: false,
  text: "A reference card.",
};

/** Create an approval for a synthetic snapshot without relying on ignored local artifacts. */
function approvalFor(content: string): ReferenceSpellApproval {
  return {
    source: "test",
    preparation: "test",
    file: "test.json",
    count: 1,
    edition: "5.0",
    sha256: createHash("sha256").update(content).digest("hex"),
    acceptedWarningIds: [],
  };
}

describe("reference-only publication approvals", () => {
  it("limits publication to explicitly reviewed snapshots", () => {
    expect(REFERENCE_SPELL_APPROVALS.map((approval) => approval.count)).toEqual(
      [369, 295, 181, 179],
    );
    expect(
      new Set(REFERENCE_SPELL_APPROVALS.map((approval) => approval.source))
        .size,
    ).toBe(4);
    expect(
      REFERENCE_SPELL_APPROVALS.flatMap(
        (approval) => approval.acceptedWarningIds,
      ),
    ).toEqual(["kibblestasty-casting-compendium-v2.3:bile-beam"]);
  });

  it("accepts validated reference cards and rejects changes after approval", () => {
    const content = JSON.stringify([SPELL]);
    const approval = approvalFor(content);
    expect(approveReferenceSpells(content, approval)).toEqual([
      { ...SPELL, edition: "5.0" },
    ]);
    expect(
      REFERENCE_SPELL_APPROVALS.filter((entry) => !entry.ruleset).every(
        (entry) => entry.edition === "5.0",
      ),
    ).toBe(true);
    expect(() => approveReferenceSpells(content + " ", approval)).toThrow(
      "Snapshot changed",
    );
    expect(() =>
      approveReferenceSpells(content, { ...approval, count: 2 }),
    ).toThrow("scope changed");
  });

  it("keeps A5E distinct without assigning an SRD edition", () => {
    const content = JSON.stringify([SPELL]);
    const { edition: _edition, ...snapshot } = approvalFor(content);
    const result = approveReferenceSpells(content, {
      ...snapshot,
      ruleset: "a5e",
    });
    expect(result).toEqual([SPELL]);
    expect(result[0]).not.toHaveProperty("edition");
  });

  it.each([
    { source: "different" },
    { edition: "5.0" as const },
    { mechanics: { attackRoll: true } },
  ])("rejects changed publication scope: %s", (change) => {
    const content = JSON.stringify([{ ...SPELL, ...change }]);
    expect(() => approveReferenceSpells(content, approvalFor(content))).toThrow(
      "scope changed",
    );
  });

  it("rejects unaccepted findings and accepts only the documented material warning", () => {
    const content = JSON.stringify([
      { ...SPELL, components: { ...SPELL.components, material: true } },
    ]);
    const approval = approvalFor(content);
    expect(() => approveReferenceSpells(content, approval)).toThrow(
      "Unaccepted validation",
    );
    expect(
      approveReferenceSpells(content, {
        ...approval,
        acceptedWarningIds: ["test:spell"],
      }),
    ).toHaveLength(1);
    const invalid = JSON.stringify([
      {
        ...SPELL,
        concentration: true,
        duration: "Concentration, up to 1 minute",
      },
    ]);
    expect(() => approveReferenceSpells(invalid, approvalFor(invalid))).toThrow(
      "Unaccepted validation",
    );
  });
});
