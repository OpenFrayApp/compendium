// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";

export interface WarlockSourceEntry {
  id: string;
  source: "grimoire-1" | "grimoire-2" | "grimoire-3" | "liminal";
  printedPages: readonly number[];
  text: string;
}

export interface WarlockBoundaryFinding {
  id: string;
  source: WarlockSourceEntry["source"];
  printedPages: readonly number[];
  entrySha256: string;
  status: "reviewed" | "withheld";
  omissions: readonly { start: number; end: number; reason: string }[];
  boundaryNotes: readonly string[];
}

export const WARLOCK_CONTENT_BOUNDARIES = [
  {
    id: "kobold-press-wz:avert-evil-eye",
    source: "grimoire-1",
    printedPages: [247],
    omissions: [
      {
        start: 108,
        end: 256,
        reason: "nonmechanical-preface",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "7d57527b33f35a26981d0e67c352711dbe0c5f17e6228c14703c5c353f4819cc",
  },
  {
    id: "kobold-press-wz:commanders-pavilion",
    source: "grimoire-1",
    printedPages: [201, 202],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "94c361af6024f413d69980250be4d7ec2063c298ceadfdffa5dc8d4e3ccbcf1c",
  },
  {
    id: "kobold-press-wz:eternal-echo",
    source: "grimoire-1",
    printedPages: [63],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain interactions with undead control and Turn Undead as prose; no class-feature implementation is included.",
    ],
    entrySha256:
      "8d51e508767469402dd4d061cae6a52b2a055bb6b872f41371ba863fe10b8a09",
  },
  {
    id: "kobold-press-wz:order-of-revenge",
    source: "grimoire-1",
    printedPages: [228],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain links to Revenge’s Eye and source-original spell terminology; do not import another spell’s text.",
    ],
    entrySha256:
      "031315d02c247432bc3c3fe19b55874f01895fb313e18edbd67bbbb9ddefe760",
  },
  {
    id: "kobold-press-wz:reassemble",
    source: "grimoire-1",
    printedPages: [63, 64],
    omissions: [],
    status: "withheld",
    boundaryNotes: [
      "The required material contains a reserved setting identity; replacing it would change the requirement.",
    ],
    entrySha256:
      "93c48767bfaaa06d483b648b0dbb35c1ef98f7d6ce526bbf05425358867a22b7",
  },
  {
    id: "kobold-press-wz:revenges-eye",
    source: "grimoire-1",
    printedPages: [228, 229],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain the Order of Revenge dependency. Source-original action terminology requires later fidelity review.",
    ],
    entrySha256:
      "035819403a55333a4c9589b98241c10ec2225dda19752cdf94d247a6e4d99993",
  },
  {
    id: "kobold-press-wz:skull-road",
    source: "grimoire-1",
    printedPages: [64],
    omissions: [],
    status: "withheld",
    boundaryNotes: [
      "Reserved destinations determine portal routing and travel; generic replacements would change the rule.",
    ],
    entrySha256:
      "d0b189754ab0a212a82e9e4de5ca18c046213c22306db66e6f2de692d3de9ce6",
  },
  {
    id: "kobold-press-wz:vagrants-nondescript-cloak",
    source: "grimoire-1",
    printedPages: [229],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain linked spell dependencies and conditional Advantage in prose.",
    ],
    entrySha256:
      "7c7e6e97425af9367586c9c924c3bf6c9c6d3c3b1887964a2d72f200d2f57603",
  },
  {
    id: "kobold-press-wz:vengeful-panopy-of-the-ley-line-ignited",
    source: "grimoire-1",
    printedPages: [233, 234],
    omissions: [
      {
        start: 874,
        end: 1204,
        reason: "setting-lore",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "Retain all ley-line binding requirements and weakening rules in prose. Do not import or automate the supporting subsystem.",
    ],
    entrySha256:
      "1c8ece874e5546f70ce2585fc705296733fec87b5d12be7cd600e946c5800a73",
  },
  {
    id: "kobold-press-wz:who-goes-there",
    source: "grimoire-1",
    printedPages: [202],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "460577195b1a4305253f542a9a52b38d5ef0bd0ebd21d450f471db7639124977",
  },
  {
    id: "kobold-press-wz:battle-chant",
    source: "grimoire-2",
    printedPages: [176, 177],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "599ce06d4ff9f210e255bbfedd6e1e2ed52580a6aa436022a302ba38438d2da7",
  },
  {
    id: "kobold-press-wz:hedgehog-dozen",
    source: "grimoire-2",
    printedPages: [177],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Keep conditional Advantage in prose; duplicate-count consistency is a fidelity issue, not a license grant.",
    ],
    entrySha256:
      "3ede53b4006f1c241828fbd03094e76706e93664f8e1837a24da4dd3901ad5a0",
  },
  {
    id: "kobold-press-wz:march-of-the-dead",
    source: "grimoire-2",
    printedPages: [177],
    omissions: [
      {
        start: 485,
        end: 637,
        reason: "setting-lore",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "Omit separable setting-use lore. Preserve construct typing, zombie abilities, orders, and control durations. Do not copy a creature stat block.",
    ],
    entrySha256:
      "cfea3e74be356124ecbd1b1f1254ebe395396d6030abaefa8847fd3a5134bc68",
  },
  {
    id: "kobold-press-wz:remove-insulation",
    source: "grimoire-2",
    printedPages: [165],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain the printed Fortitude save; no automatic Constitution substitution.",
    ],
    entrySha256:
      "b4573d1a77e5c2ae7a06e5117de2312f33a3003eb4b549dc66b3f0d7d999ec89",
  },
  {
    id: "kobold-press-wz:storm-of-axes",
    source: "grimoire-2",
    printedPages: [178],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Preserve Concentration plus one round; no fixed-duration substitution.",
    ],
    entrySha256:
      "aaee8efc6c17387964a501035c4feda8d23c84d149f5fb8c2a68e3a2ace3ad81",
  },
  {
    id: "kobold-press-wz:summon-clockwork-beast",
    source: "grimoire-2",
    printedPages: [20, 21],
    omissions: [],
    status: "withheld",
    boundaryNotes: [
      "The declaration abbreviates the spell title and the entry interleaves subclass rules. No clean spell body is released pending source-fidelity and designation confirmation.",
    ],
    entrySha256:
      "ac52d7eb745851dee605d9c590090aaf28ae5e248985abc5f2df54e96c7df621",
  },
  {
    id: "kobold-press-wz:abrupt-hug",
    source: "grimoire-3",
    printedPages: [201],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "ff4fa6623d522d59639b347f61717786ccc02d6a9145acffb58b730542dc64d2",
  },
  {
    id: "kobold-press-wz:bombardment-of-stings",
    source: "grimoire-3",
    printedPages: [202],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "544756da408c81fd6b7802062fd5b0a36de99c830897e4a79e7b2bfcc7fffd1c",
  },
  {
    id: "kobold-press-wz:charming-aesthetics",
    source: "grimoire-3",
    printedPages: [57],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "adeaa79c75c16c33edd5afea26e87be9e77f7b48637d0d75d4327ab06a87cb37",
  },
  {
    id: "kobold-press-wz:exchanged-knowledge",
    source: "grimoire-3",
    printedPages: [120],
    omissions: [
      {
        start: 251,
        end: 274,
        reason: "reserved-setting-descriptor",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "Remove only the named library descriptor; retain the information benefit, book costs, saves, penalties, and linked remedies. Do not model proficiency or build data.",
    ],
    entrySha256:
      "7ce142dd08fe3e371422a3da21c5e7954d1b7109a9b16c232ff74635bcedc46c",
  },
  {
    id: "kobold-press-wz:inconspicuous-facade",
    source: "grimoire-3",
    printedPages: [120],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "0a11abbaceb8a1952af99fd26dffe2ecbcb77cac50cbc57201148d8d950c5564",
  },
  {
    id: "kobold-press-wz:rise-of-the-green",
    source: "grimoire-3",
    printedPages: [59],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Preserve the treant reference and summoned-creature rules. No treant stat block is copied; later wiring must use a separately licensed existing library entry.",
    ],
    entrySha256:
      "ea6908411095fd736d0d0d5b3433b90b0a9f5e878dd3ef734f5b789dcdff445d",
  },
  {
    id: "kobold-press-wz:suppress-regeneration",
    source: "grimoire-3",
    printedPages: [204],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Retain the printed Fortitude save; no automatic Constitution substitution.",
    ],
    entrySha256:
      "950eef30e8a068d386c9c481bf620798fa2fbca0bf4b6ead8ee46c2694cb277a",
  },
  {
    id: "kobold-press-wz:toxic-pollen",
    source: "grimoire-3",
    printedPages: [57],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "df0159da8f081667eacd63ad7054b16273419b48403f88d25f5de85f094c1247",
  },
  {
    id: "kobold-press-wz:zymurgic-aura",
    source: "grimoire-3",
    printedPages: [264],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "27050091c940623e19c3449943c28e2e85930e8270c5236995e8d64854f5efdf",
  },
  {
    id: "kobold-press-wz:bardo",
    source: "liminal",
    printedPages: [4],
    omissions: [
      {
        start: 211,
        end: 257,
        reason: "nonmechanical-preface",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "Retain cleric/paladin restriction as prose without build automation.",
    ],
    entrySha256:
      "040c6560bcbd82f23736ef20d4b78cadc720c3829194877536dc93cea8327871",
  },
  {
    id: "kobold-press-wz:devouring-darkness",
    source: "liminal",
    printedPages: [4],
    omissions: [
      {
        start: 135,
        end: 220,
        reason: "nonmechanical-preface",
      },
      {
        start: 246,
        end: 255,
        reason: "reserved-setting-descriptor",
      },
      {
        start: 791,
        end: 805,
        reason: "reserved-setting-descriptor",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "2003df046321ac3a824f3e299cfc308eb6b8e445f473faef76693f3b1888346c",
  },
  {
    id: "kobold-press-wz:door-of-the-far-traveler",
    source: "liminal",
    printedPages: [5],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "57dc8491149db6f00c00b618df9f8661d9b25f33e58d240030a0bea6d4daa423",
  },
  {
    id: "kobold-press-wz:ethereal-stairs",
    source: "liminal",
    printedPages: [5, 6],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "ca5e21cb8b16b27652fb183676bdb1c704e8a32e65356244de59e78ee0f84c3d",
  },
  {
    id: "kobold-press-wz:hypnagogia",
    source: "liminal",
    printedPages: [6, 7],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "7c8e1048f9dc5639bfc2a36c77b976aa29deec721a0fabda5ec13493a7e6c64f",
  },
  {
    id: "kobold-press-wz:hypnic-jerk",
    source: "liminal",
    printedPages: [7],
    omissions: [
      {
        start: 108,
        end: 274,
        reason: "nonmechanical-preface",
      },
    ],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "505bca62426805a6c0cdb81198ad41baa8ffcd0ca82f5106b80122fa309b3a12",
  },
  {
    id: "kobold-press-wz:mind-maze",
    source: "liminal",
    printedPages: [7],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "64adb603c17ff23f2122587c0f20f18db9669848a5384b5b8e51f9db10856362",
  },
  {
    id: "kobold-press-wz:mirror-realm",
    source: "liminal",
    printedPages: [7, 8],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "e5a129225207c69ff072929fdcfa062924c9f229804d7215b431ddb05af14e14",
  },
  {
    id: "kobold-press-wz:reciprocating-portal",
    source: "liminal",
    printedPages: [8],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "ff6cd2ba75f3657c28872c0375362e5e24ec75733e669faf653b25af1b479cf3",
  },
  {
    id: "kobold-press-wz:rive",
    source: "liminal",
    printedPages: [9],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "cf2a25dee9af5595c44dde13fd8ab538dd70f451724748b074d5699d7887843e",
  },
  {
    id: "kobold-press-wz:pierce-the-veil",
    source: "liminal",
    printedPages: [9, 10],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "Preserve caller-specified entity and plane rules. No named setting entity or creature stat block is supplied.",
    ],
    entrySha256:
      "2aac6437b1398ffe5f9c591b7207deb64476e0b4e953f55e60f8322ed39dddf3",
  },
  {
    id: "kobold-press-wz:subliminal-aversion",
    source: "liminal",
    printedPages: [10],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "42dd95794b363854d99c25e6c1cbb52bbfa4c8bac2bee8affc6c044d8ea927d2",
  },
  {
    id: "kobold-press-wz:threshold-slip",
    source: "liminal",
    printedPages: [10],
    omissions: [],
    status: "reviewed",
    boundaryNotes: [
      "No reserved setting identity or separate supporting-content import identified in this bounded spell entry.",
    ],
    entrySha256:
      "64854d6bcbf01e7a09046ac06d9c65d4b0bc98d78f1f63c42eb30d1cca842f6b",
  },
] as const satisfies readonly WarlockBoundaryFinding[];

export const WARLOCK_EXCLUDED_SPELLS = [
  {
    id: "kobold-press-wz:child-of-light-and-darkness",
    reason: "No supplied Shadow Realms spell entry.",
  },
  {
    id: "kobold-press-wz:obfuscate-object",
    reason: "No supplied Shadow Realms spell entry.",
  },
  {
    id: "kobold-press-wz:pratfall",
    reason: "No supplied Shadow Realms spell entry.",
  },
  {
    id: "kobold-press-wz:shadow-adaptation",
    reason: "No supplied Shadow Realms spell entry.",
  },
  {
    id: "kobold-press-wz:putrescent-faerie-circle",
    reason: "No supplied Warlock Lair 24 spell entry.",
  },
] as const;

/** Omit only reviewed character ranges without changing surrounding rules. */
export function omitWarlockExcludedRanges(
  text: string,
  ranges: WarlockBoundaryFinding["omissions"],
): string {
  let previousEnd = 0;
  for (const range of ranges) {
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < previousEnd ||
      range.end <= range.start ||
      range.end > text.length
    )
      throw new Error("Invalid Warlock omission range");
    previousEnd = range.end;
  }
  let result = text;
  for (const range of [...ranges].reverse())
    result = result.slice(0, range.start) + result.slice(range.end);
  return result;
}

/** Verify all located source boundaries and withhold incomplete or reserved entries. */
export function prepareWarlockContentBoundaries(
  entries: readonly WarlockSourceEntry[],
) {
  const findings = new Map<string, WarlockBoundaryFinding>(
    WARLOCK_CONTENT_BOUNDARIES.map((finding) => [finding.id, finding]),
  );
  const seen = new Set<string>();
  const records = entries.map((entry) => {
    const finding = findings.get(entry.id);
    if (!finding || seen.has(entry.id))
      throw new Error(`Unreviewed Warlock entry: ${entry.id}`);
    seen.add(entry.id);
    if (
      finding.source !== entry.source ||
      JSON.stringify(finding.printedPages) !==
        JSON.stringify(entry.printedPages) ||
      createHash("sha256").update(entry.text).digest("hex") !==
        finding.entrySha256
    )
      throw new Error(`Warlock source boundary changed: ${entry.id}`);
    return {
      id: entry.id,
      source: entry.source,
      status: finding.status,
      boundaryNotes: finding.boundaryNotes,
      entryText:
        finding.status === "reviewed"
          ? omitWarlockExcludedRanges(entry.text, finding.omissions)
          : null,
      publicationApproved: false as const,
    };
  });
  if (seen.size !== findings.size)
    throw new Error("Incomplete Warlock boundary input");
  return {
    locatedCount: records.length,
    reviewedCount: records.filter((record) => record.status === "reviewed")
      .length,
    withheldCount: records.filter((record) => record.status === "withheld")
      .length,
    excluded: WARLOCK_EXCLUDED_SPELLS,
    records,
    publicationApproved: false as const,
  };
}
