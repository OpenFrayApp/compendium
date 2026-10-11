// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { expect, it } from "vitest";
import type { Spell } from "../../src/schema/spell.ts";
import {
  compareWarlockGrimoireSpell,
  reviewWarlockGrimoire,
} from "../../src/compendium/warlockGrimoireReview.ts";

const spell: Spell = {
  id: "kobold-press-wz:eternal-echo",
  source: "kobold-press-wz",
  edition: "5.0",
  name: "Eternal Echo",
  level: 3,
  school: "Necromancy",
  castingTime: "action",
  range: "60 feet",
  duration: "special",
  concentration: false,
  ritual: false,
  components: { verbal: true, somatic: false, material: false },
  text: "The target takes a -4 penalty. It makes a saving throw.",
};
const echo =
  "63 ETERNAL ECHO 3rd-level necromancy Casting Time: 1 action Range: 60 feet Components: V Duration: Concentration The target takes a −4 penalty. It makes a saving throw. REASSEMBLE 5th-level necromancy";

it("reports concentration without changing the draft, approving it, or inventing a numeric duration", () => {
  const before = JSON.stringify(spell);
  const result = compareWarlockGrimoireSpell(spell, echo);
  expect(result.approved).toBe(false);
  expect(result.printedPages).toEqual([63]);
  expect(result.headerDifferences).toEqual([
    { field: "concentration", draft: false, book: true },
  ]);
  expect(result.bodyComparison.status).toBe("normalized-match");
  expect(result.classEvidence).toBe("contextual-class-review-required");
  expect(JSON.stringify(spell)).toBe(before);
});

it("does not equate changed saving throws, lost words, or changed numeric signs", () => {
  for (const text of [
    "The target takes a -4 penalty.",
    "The target takes a +4 penalty. It makes a saving throw.",
    "The target takes a -4 penalty. It makes an ability check.",
  ])
    expect(
      compareWarlockGrimoireSpell({ ...spell, text }, echo).bodyComparison
        .status,
    ).toBe("difference");
});

it("ignores typography and Markdown without losing word order", () => {
  expect(
    compareWarlockGrimoireSpell(
      {
        ...spell,
        text: "The target takes a -4 penalty. **It makes a saving throw.**",
      },
      echo,
    ).bodyComparison.status,
  ).toBe("normalized-match");
});

it.each([
  ["missing page", echo.replace("63 ", "64 ")],
  ["duplicate page", echo + "\n\n63 Duplicate"],
  ["changed heading", echo.replace("ETERNAL ECHO", "Eternal Echo")],
  [
    "mention without header",
    echo.replace(
      "ETERNAL ECHO 3rd-level necromancy",
      "ETERNAL ECHO is known here",
    ),
  ],
  ["missing boundary", echo.replace("REASSEMBLE", "OTHER HEADING")],
  ["duplicate boundary", echo + " REASSEMBLE"],
  [
    "changed source duration",
    echo.replace("Duration: Concentration", "Duration: 1 hour"),
  ],
])("rejects incomplete or ambiguous entry evidence: %s", (_label, content) => {
  expect(() => compareWarlockGrimoireSpell(spell, content)).toThrow();
});

it("rejects an unreviewed ID even when its title appears in narrative text", () => {
  expect(() =>
    compareWarlockGrimoireSpell(
      { ...spell, id: "kobold-press-wz:rive", name: "Rive" },
      "63 The River carries spells.",
    ),
  ).toThrow("No reviewed Grimoire entry");
});

it("reports omitted materials and stops before adjacent setting prose", () => {
  const candidate: Spell = {
    ...spell,
    id: "kobold-press-wz:vagrants-nondescript-cloak",
    name: "Vagrant's Nondescript Cloak",
    level: 2,
    school: "Abjuration",
    range: "Touch",
    duration: "1 hour",
    components: { verbal: true, somatic: true, material: true },
    text: "The target is warded.",
  };
  const source =
    "229 VAGRANT’S NONDESCRIPT CLOAK 2nd-level abjuration Casting Time: 1 action Range: Touch Components: V, S, M (a harmless test component) Duration: 1 hour The target is warded. Story Seeds Setting prose excluded.";
  const result = compareWarlockGrimoireSpell(candidate, source);
  expect(result.headerDifferences).toEqual([
    {
      field: "components.materials",
      draft: null,
      book: "a harmless test component",
    },
  ]);
  expect(result.bodyComparison.status).toBe("normalized-match");
});

it("joins a continuation without including the following entry", () => {
  const candidate = {
    ...spell,
    id: "kobold-press-wz:reassemble",
    name: "Reassemble",
    level: 5,
    range: "Touch",
    castingTime: "1hour",
    duration: "instantaneous",
    text: "The target is healed. The penalty lasts.",
    components: { verbal: true, somatic: true, material: false },
  };
  const source =
    "63 REASSEMBLE 5th-level necromancy Casting Time: 1 hour Range: Touch Components: V, S Duration: Instantaneous The target is healed.\n\n64 The penalty lasts. SKULL ROAD 5th-level conjuration Unrelated rules.";
  expect(
    compareWarlockGrimoireSpell(candidate, source).bodyComparison.status,
  ).toBe("normalized-match");
});

it("fails closed for changed artifacts instead of extending an old approval", () => {
  expect(() => reviewWarlockGrimoire("[]", echo, new Uint8Array())).toThrow(
    "Draft snapshot changed",
  );
});
