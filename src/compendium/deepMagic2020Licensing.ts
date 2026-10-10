// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import type { Spell } from "../schema/spell.ts";

const NAMED_REFERENCES = [
  "Althea",
  "Avronin",
  "Candle’s",
  "Carmello-Volta",
  "Gordolay",
  "Hedren",
  "Kareef",
  "Sir Mittinz",
  "Weiler",
  "Nyarlathotep",
  "Leng",
  "Koth",
] as const;

export const DEEP_MAGIC_2020_LICENSE_FINDINGS: Readonly<
  Record<
    string,
    { name: string; textSha256: string; physicalPages: readonly number[] }
  >
> = {
  "kobold-press-deepm:altheas-travel-tent": {
    name: "Althea’s Travel Tent",
    textSha256:
      "94b5c7a511af5d5920b22fac71067b57bccca32947bd0663509e5a98452d885e",
    physicalPages: [36],
  },
  "kobold-press-deepm:avronins-astral-assembly": {
    name: "Avronin’s Astral Assembly",
    textSha256:
      "531ec29a9b4613aaaf952238b1d88ca7838fea794831008adba74e232ea3c874",
    physicalPages: [41, 42],
  },
  "kobold-press-deepm:candles-insight": {
    name: "Candle’s Insight",
    textSha256:
      "cbffff6efed437f5c54e993ebad0a525e833717c4a9ae04ddcbbd80f0ec51884",
    physicalPages: [48],
  },
  "kobold-press-deepm:carmello-voltas-irksome-preserves": {
    name: "Carmello-Volta’s Irksome Preserves",
    textSha256:
      "d42b4514ba752aec184c4723acc4f6151f0de82f0b0b5305a010d985c6d3b29e",
    physicalPages: [48],
  },
  "kobold-press-deepm:eldritch-communion": {
    name: "Eldritch Communion",
    textSha256:
      "df9d79418e78bd2d70d9a05a5870a6d1c64c326bc3e3238dc036f507b9e030c3",
    physicalPages: [339],
  },
  "kobold-press-deepm:gordolays-pleasant-aroma": {
    name: "Gordolay’s Pleasant Aroma",
    textSha256:
      "daf59aefdd0257048984a47b693d441ad33a69e23028451c4ecbd57c18c00ca7",
    physicalPages: [77],
  },
  "kobold-press-deepm:hedrens-birds-of-clay": {
    name: "Hedren’s Birds of Clay",
    textSha256:
      "56015a3d4c370f679a2152c3b036c687b4324db5375eb5cfe2c9d40b1228a040",
    physicalPages: [81],
  },
  "kobold-press-deepm:hunger-of-leng": {
    name: "Hunger of Leng",
    textSha256:
      "4cbb3a413909d9ef087923df8a05c49f7d80fc6be408d46155b0762b0b076c8f",
    physicalPages: [340],
  },
  "kobold-press-deepm:kareefs-entreaty": {
    name: "Kareef’s Entreaty",
    textSha256:
      "aa950556dba1504210f6f0c11c8dfed5ac30485f998694756e17c997e80005cf",
    physicalPages: [88],
  },
  "kobold-press-deepm:semblance-of-dread": {
    name: "Semblance of Dread",
    textSha256:
      "fc26720c264e1201c6f77c7a0b05b51665450fb03f8b0304beecd4a0c0176e29",
    physicalPages: [341],
  },
  "kobold-press-deepm:sign-of-koth": {
    name: "Sign of Koth",
    textSha256:
      "86f4d6dd0c077fc431bcc2e949240f614534e6403a27690f7d694fd33d88a076",
    physicalPages: [341, 342],
  },
  "kobold-press-deepm:sir-mittinzs-move-curse": {
    name: "Sir Mittinz’s Move Curse",
    textSha256:
      "29399516e143e77cd7dcfad7cb3adcf12c116e1428b1f972ef2ed57b8470572c",
    physicalPages: [107],
  },
  "kobold-press-deepm:sleep-of-the-deep": {
    name: "Sleep of the Deep",
    textSha256:
      "7e523c13e5b2779a2c139dfb7b947217fbe3b008ec9e7f5f475399db2cf94faf",
    physicalPages: [342],
  },
  "kobold-press-deepm:summon-eldritch-servitor": {
    name: "Summon Eldritch Servitor",
    textSha256:
      "83d3f1c7fed83be9d7f0da53c406855693ae7978cbe55a028a79d9cfea7f3e7b",
    physicalPages: [342],
  },
  "kobold-press-deepm:warp-mind-and-matter": {
    name: "Warp Mind and Matter",
    textSha256:
      "23165e0ff3f85e4161e42634e69bcfd7e599e62ca1e57e1887b13bbcf7d2d28b",
    physicalPages: [343],
  },
  "kobold-press-deepm:weilers-ward": {
    name: "Weiler’s Ward",
    textSha256:
      "3d77290ca1cdefb5ed737d62cadf7c9094bcc523b31853273ebf5bf27b296cdd",
    physicalPages: [121],
  },
  "kobold-press-deepm:yellow-sign": {
    name: "Yellow Sign",
    textSha256:
      "5613a17bc7e4c7f1b907b811efcea2462fd1045b89a27387f4ae47916f23ade6",
    physicalPages: [343],
  },
};

/** Record accepted selection and hash-pinned exception decisions without approving publication. */
export function reviewDeepMagic2020Licensing(spells: readonly Spell[]) {
  if (
    spells.some(
      (spell) => spell.source !== "kobold-press-deepm" || spell.mechanics,
    ) ||
    new Set(spells.map((spell) => spell.id)).size !== spells.length
  )
    throw new Error("Deep Magic 2020 licensing review scope changed");

  const exceptions = spells.flatMap((spell) => {
    const content = `${spell.name}\n${spell.text}`;
    const names = NAMED_REFERENCES.filter((name) => content.includes(name));
    const dependencies = [
      ...(/void taint/i.test(spell.text) ? ["Void taint"] : []),
      ...(/flesh warp/i.test(spell.text) ? ["Flesh warping"] : []),
      ...(/(?:short|long)[-‑ ]term madness|indefinite madness/i.test(spell.text)
        ? ["Madness"]
        : []),
      ...(/ritual focus|group[- ]spellcasting/i.test(spell.text)
        ? ["Custom ritual rules"]
        : []),
    ];
    const finding = Object.hasOwn(DEEP_MAGIC_2020_LICENSE_FINDINGS, spell.id)
      ? DEEP_MAGIC_2020_LICENSE_FINDINGS[spell.id]
      : undefined;
    if (!names.length && !dependencies.length && !finding) return [];
    const unchanged =
      finding?.name === spell.name &&
      finding.textSha256 ===
        createHash("sha256").update(spell.text).digest("hex");
    return [
      {
        id: spell.id,
        name: spell.name,
        status: unchanged
          ? "reviewed-under-accepted-selection-basis"
          : "pending-targeted-exception-review",
        namedReferences: names,
        supportingRules: dependencies,
        physicalPages: finding?.physicalPages ?? [],
        decision: unchanged
          ? "Retain the selected spell text as a manual reference. Do not import character lore, supporting-rule definitions, or summoned-creature stat blocks."
          : "Review new or changed flagged text before retaining it under the selection basis.",
      },
    ];
  });

  return {
    selectionBasis: "accepted-open5e-subset-under-2020-publisher-grant",
    selectionCount: spells.length,
    declarationPhysicalPage: 3,
    grant:
      "The Open Game Content includes the spells previously published and the backer spells.",
    evidence: [
      "Pinned Open5e deepm candidate selection matched to the supplied 2020 book.",
      "Original Open5e import contains 514 matching spell names; the reaction-only rope card is consolidated.",
      "Community provenance leads cover all 514 unique names and support the selection; they are not publisher grants.",
    ],
    notice:
      "Open5e selection is accepted provenance evidence, not a blanket license guarantee. Exception flags are review leads, not findings that material is protected or permission to publish.",
    exceptions,
    pendingExceptionCount: exceptions.filter(
      (row) => row.status === "pending-targeted-exception-review",
    ).length,
    requiredAttribution:
      "Full OGL 1.0a, verified 35-notice Section 15 chain, and OpenFray Open Game Content designation.",
    publishable: false,
    approvedCount: 0,
  };
}
