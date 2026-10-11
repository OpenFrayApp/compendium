// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import type { Spell } from "../schema/spell.ts";

export const WARLOCK_GRIMOIRE_RTF_SHA256 =
  "0d3817ca5c585b82888845089e8ecb76c6fe6ccf962725f463b4ca1b6cba7b19";
export const WARLOCK_GRIMOIRE_TEXT_SHA256 =
  "be0ea3624a7d9cb997163c344f539b1146403d927ac844b7104ae02faf6ac2d1";
export const WARLOCK_DRAFT_SHA256 =
  "94fac4a9342f2798d15ef35cdbfcafb4eacbfbfe524b87af7696f60eb83fb006";

const entries = [
  {
    key: "avert-evil-eye",
    title: "AVERT EVIL EYE",
    pages: [247],
    end: "CANDLE’S INSIGHT",
    duration: "1 hour",
  },
  {
    key: "commanders-pavilion",
    title: "COMMANDER’S PAVILION",
    pages: [201, 202],
    end: "FEATHER FIELD",
    duration: "24 hours",
  },
  {
    key: "eternal-echo",
    title: "ETERNAL ECHO",
    pages: [63],
    end: "REASSEMBLE",
    duration: "Concentration",
  },
  {
    key: "order-of-revenge",
    title: "ORDER OF REVENGE",
    pages: [228],
    end: "REVENGE’S EYE",
    duration: "1 hour/caster level",
  },
  {
    key: "reassemble",
    title: "REASSEMBLE",
    pages: [63, 64],
    end: "SKULL ROAD",
    duration: "Instantaneous",
  },
  {
    key: "revenges-eye",
    title: "REVENGE’S EYE",
    pages: [228, 229],
    end: "VAGRANT’S NONDESCRIPT CLOAK",
    duration: "Concentration, up to 1 hour",
  },
  {
    key: "skull-road",
    title: "SKULL ROAD",
    pages: [64],
    end: "STAFF OF VIOLET FIRE",
    duration: "Concentration, up to 1 minute",
  },
  {
    key: "vagrants-nondescript-cloak",
    title: "VAGRANT’S NONDESCRIPT CLOAK",
    pages: [229],
    end: "Story Seeds",
    duration: "1 hour",
  },
  {
    key: "vengeful-panopy-of-the-ley-line-ignited",
    title: "VENGEFUL PANOPLY OF THE LEY LINE IGNITED",
    pages: [233, 234],
    end: "Feat: Cooperative Caster",
    duration: "Concentration, up to 10 minutes",
  },
  {
    key: "who-goes-there",
    title: "WHO GOES THERE?",
    pages: [202],
    end: "Ley Line Fuse Trap",
    duration: "Concentration, up to 10 minutes",
  },
] as const;

/** Escape a literal source heading for an exact header expression. */
function literal(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Retain word order, numbers, and signs while ignoring typography and Markdown. */
function words(value: string): string[] {
  return (
    value
      .normalize("NFKC")
      .replace(/[’‘]/g, "'")
      .replace(/—/g, " ")
      .replace(/[–−]/g, "-")
      .replace(/([+-])\s+(?=\d)/g, "$1")
      .toLowerCase()
      .match(/[+-]?\d+(?:\.\d+)?(?:d\d+)?|[a-z]+(?:'[a-z]+)*/g) ?? []
  );
}

/** Normalize display-only header spacing and action/ritual notation for comparison. */
function display(value: string): string {
  return words(
    value
      .toLowerCase()
      .replace(/ or ritual$/, "")
      .replace(/^action$/, "1 action")
      .replace(/^up to /, ""),
  ).join(" ");
}

/** Compare one located draft against its bounded printed entry without changing it. */
export function compareWarlockGrimoireSpell(
  spell: Spell,
  transcription: string,
) {
  const entry = entries.find(
    (entry) => spell.id === `kobold-press-wz:${entry.key}`,
  );
  if (!entry) throw new Error(`No reviewed Grimoire entry: ${spell.id}`);
  const pages = new Map<number, string>();
  for (const match of transcription.matchAll(
    /(?:^|\n)(\d+) ([\s\S]*?)(?=\n\s*\n\d+ |\s*$)/g,
  )) {
    const page = Number(match[1]);
    if (pages.has(page)) throw new Error(`Duplicate printed page: ${page}`);
    pages.set(page, match[2]);
  }
  const content = entry.pages
    .map((page) => {
      const text = pages.get(page);
      if (!text) throw new Error(`Missing printed page: ${page}`);
      return text;
    })
    .join(" ");
  const parts = content.split(entry.title);
  if (parts.length !== 2)
    throw new Error(`No unique spell heading: ${entry.title}`);
  const bounded = parts[1].split(entry.end);
  if (bounded.length !== 2)
    throw new Error(`No unique entry boundary: ${entry.end}`);
  const header = bounded[0].match(
    new RegExp(
      `^ (\\d+)(?:st|nd|rd|th)-level ([a-z]+)(?: \\(([^)]*)\\))? Casting Time: (.*?) Range: (.*?) Components: (.*?) Duration: ${literal(entry.duration)} ([\\s\\S]+)$`,
    ),
  );
  if (!header) throw new Error(`Printed header changed: ${entry.title}`);
  const [
    ,
    level,
    school,
    qualifier = "",
    castingTime,
    range,
    components,
    body,
  ] = header;
  const concentration = entry.duration.startsWith("Concentration");
  const duration =
    entry.duration.replace(/^Concentration(?:, )?/, "") || "Special";
  const materials = components.match(/\((.*)\)$/)?.[1];
  const componentFlags = components.split(" (")[0].split(", ");
  const classes = qualifier
    .replace(/^ley line; /, "")
    .split(", ")
    .filter((label) => ["sorcerer", "warlock", "wizard"].includes(label));
  const differences: { field: string; draft: unknown; book: unknown }[] = [];
  const fields = [
    ["name", spell.name, entry.title],
    ["level", spell.level, Number(level)],
    ["school", spell.school, school],
    ["castingTime", spell.castingTime, castingTime],
    ["range", spell.range, range],
    ["duration", spell.duration, duration],
    ["concentration", spell.concentration, concentration],
    ["ritual", spell.ritual, qualifier === "ritual"],
    [
      "components.verbal",
      spell.components.verbal,
      componentFlags.includes("V"),
    ],
    [
      "components.somatic",
      spell.components.somatic,
      componentFlags.includes("S"),
    ],
    [
      "components.material",
      spell.components.material,
      componentFlags.includes("M"),
    ],
    [
      "components.materials",
      spell.components.materials ?? null,
      materials ?? null,
    ],
  ] as const;
  for (const [field, draft, book] of fields) {
    const equal =
      typeof draft === "string" && typeof book === "string"
        ? display(draft) === display(book)
        : draft === book;
    if (!equal) differences.push({ field, draft, book });
  }
  if (
    classes.length &&
    JSON.stringify(
      [...(spell.classes ?? [])].map((label) => label.toLowerCase()).sort(),
    ) !== JSON.stringify([...classes].sort())
  )
    differences.push({ field: "classes", draft: spell.classes, book: classes });
  const original = words(spell.text);
  const printed = words(body);
  let offset = 0;
  while (
    offset < original.length &&
    offset < printed.length &&
    original[offset] === printed[offset]
  )
    offset++;
  return {
    id: spell.id,
    name: spell.name,
    printedTitle: entry.title,
    printedPages: entry.pages,
    status: "located-transcription-only" as const,
    approved: false as const,
    headerDifferences: differences,
    bodyComparison: {
      status:
        offset === original.length && offset === printed.length
          ? "normalized-match"
          : "difference",
      draftWords: original.length,
      bookWords: printed.length,
      firstDifference:
        offset === original.length && offset === printed.length
          ? null
          : {
              wordOffset: offset,
              draft: original
                .slice(Math.max(0, offset - 5), offset + 30)
                .join(" "),
              book: printed
                .slice(Math.max(0, offset - 5), offset + 30)
                .join(" "),
            },
    },
    classEvidence: classes.length
      ? "explicit-header-list"
      : "contextual-class-review-required",
    licensingReview: [
      "Check Product Identity and supporting-rule dependencies before producing a publishable card.",
      ...(/Evermaw|River of Tears|Vitreous Mire|Plains of Bone|Mot\b|Bemmea|Wasted West/.test(
        body + components,
      )
        ? [
            "Named setting references require field-level clearance or a faithful permitted adaptation.",
          ]
        : []),
      ...(/ley line/i.test(body + qualifier)
        ? [
            "Ley-line dependencies require supporting-rule scope review; add no build automation.",
          ]
        : []),
    ],
  };
}

/** Audit the three pinned artifacts with zero approvals and no candidate mutations. */
export function reviewWarlockGrimoire(
  drafts: string,
  transcription: string,
  rtf: Uint8Array,
) {
  for (const [label, content, expected] of [
    ["Draft", drafts, WARLOCK_DRAFT_SHA256],
    ["Transcription", transcription, WARLOCK_GRIMOIRE_TEXT_SHA256],
    ["RTF", rtf, WARLOCK_GRIMOIRE_RTF_SHA256],
  ] as const) {
    if (createHash("sha256").update(content).digest("hex") !== expected)
      throw new Error(`${label} snapshot changed; renew Warlock source review`);
  }
  const spells: Spell[] = JSON.parse(drafts);
  if (
    spells.length !== 43 ||
    new Set(spells.map((spell) => spell.id)).size !== 43 ||
    spells.some(
      (spell) =>
        spell.source !== "kobold-press-wz" ||
        spell.edition !== "5.0" ||
        spell.mechanics,
    )
  )
    throw new Error("Warlock draft scope changed");
  const matchedIds = new Set(
    entries.map((entry) => `kobold-press-wz:${entry.key}`),
  );
  if (
    entries.some(
      (entry) =>
        !spells.some((spell) => spell.id === `kobold-press-wz:${entry.key}`),
    )
  )
    throw new Error("Reviewed Grimoire candidate missing");
  return {
    publishable: false,
    approvedCount: 0,
    source: "Warlock Grimoire (2019)",
    evidence: {
      rtfSha256: WARLOCK_GRIMOIRE_RTF_SHA256,
      transcriptionSha256: WARLOCK_GRIMOIRE_TEXT_SHA256,
      draftSha256: WARLOCK_DRAFT_SHA256,
    },
    inputCount: spells.length,
    locatedCount: entries.length,
    located: spells
      .filter((spell) => matchedIds.has(spell.id))
      .map((spell) => compareWarlockGrimoireSpell(spell, transcription)),
    unresolved: spells
      .filter((spell) => !matchedIds.has(spell.id))
      .map((spell) => ({
        id: spell.id,
        name: spell.name,
        reason:
          "No verified spell entry in the supplied compilation; obtain its actual source and license. This is not a finding that the spell is unlicensed.",
      })),
    blockers: [
      "Verify transcription fidelity, spell boundaries, and notices against a visual source.",
      "Resolve header/body differences, class metadata, Product Identity, and supporting-rule dependencies.",
      "Ship the full OGL, the verified 19-notice chain, and the OGC designation in console credits before publication.",
      "No draft changes, reference approval, or combat implementation are produced by this audit.",
    ],
  };
}
