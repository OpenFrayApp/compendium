// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { parse } from "parse5";
import type { Spell } from "../schema/spell.ts";
import {
  DIRECT_SPELL_HEADER,
  mapDirectSpellBlock,
  type DirectSpellBlock,
} from "./directSpells.ts";
export type { DirectSpellBlock } from "./directSpells.ts";
import { validateSpellDataset } from "./validate.ts";
import { reservedWotcName } from "./sourcePolicy.ts";

export interface GmBinderSpellSource {
  source: string;
  url: string;
  requiredCredits: string[];
  attribution: string;
}

interface HtmlNode {
  nodeName: string;
  tagName?: string;
  value?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: HtmlNode[];
  parentNode?: HtmlNode | null;
}
interface Bounds {
  start: number;
  end: number;
}

/** Read decoded text without executing or retaining page scripts and styles. */
function plain(node: HtmlNode): string {
  if (["script", "style"].includes(node.tagName ?? "")) return "";
  return node.value ?? (node.childNodes ?? []).map(plain).join("");
}

/** Convert source HTML into bounded spell blocks, preserving tables and nested stat blocks. */
export function extractGmBinderSpells(html: string, requiredCredits: string[]) {
  const root: HtmlNode = parse(html);
  const nodes: HtmlNode[] = [];
  const bounds = new Map<HtmlNode, Bounds>();
  /** Index document order independently of GM Binder's page and section wrappers. */
  function index(node: HtmlNode): void {
    const start = nodes.length;
    nodes.push(node);
    for (const child of node.childNodes ?? []) index(child);
    bounds.set(node, { start, end: nodes.length });
  }
  index(root);
  const candidates: { node: HtmlNode; header: string; metadata: HtmlNode }[] =
    [];
  for (const node of nodes.filter((entry) => entry.tagName === "h4")) {
    const siblings =
      node.parentNode?.childNodes?.filter((entry) => entry.tagName) ?? [];
    const at = siblings.indexOf(node);
    const header = plain(siblings[at + 1] ?? { nodeName: "" }).trim();
    if (!DIRECT_SPELL_HEADER.test(header)) continue;
    const metadata =
      siblings[at + 2]?.tagName === "hr" ? siblings[at + 3] : siblings[at + 2];
    if (metadata?.tagName !== "ul")
      throw new Error(`Missing metadata list for ${plain(node)}`);
    candidates.push({ node, header, metadata });
  }
  if (!candidates.length)
    throw new Error("No spell stat blocks found in GM Binder document");
  const majorEnds = nodes.filter(
    (entry) =>
      /^h[1-3]$/.test(entry.tagName ?? "") &&
      /^(?:Changelog|Credits\s*&\s*References|Appendix\b|Design Notes\b)/i.test(
        plain(entry).trim(),
      ),
  );
  const statHeadings = nodes.filter((entry) => {
    if (!/^h[23]$/.test(entry.tagName ?? "")) return false;
    const siblings =
      entry.parentNode?.childNodes?.filter((child) => child.tagName) ?? [];
    const description = siblings[siblings.indexOf(entry) + 1];
    return (
      description?.tagName === "p" &&
      /^(?:Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i.test(
        plain(description).trim(),
      )
    );
  });
  const boundaries = [
    ...candidates.map((candidate) => candidate.node),
    ...statHeadings,
    ...majorEnds,
  ]
    .map((entry) => bounds.get(entry)!.start)
    .sort((a, b) => a - b);
  const statBlocks = statHeadings.map((entry) => {
    const start = bounds.get(entry)!.start;
    return {
      name: plain(entry).trim(),
      start,
      end: boundaries.find((boundary) => boundary > start) ?? nodes.length,
    };
  });
  const attached = new Set<string>();
  const blocks: DirectSpellBlock[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const { node, header, metadata } = candidates[i];
    let from = bounds.get(metadata)!.end;
    let to =
      i + 1 < candidates.length
        ? bounds.get(candidates[i + 1].node)!.start
        : nodes.length;
    let renderingStatBlock = false;
    const sectionEnd = nodes.find(
      (entry) =>
        /^h[1-3]$/.test(entry.tagName ?? "") &&
        bounds.get(entry)!.start >= from &&
        /^(?:Changelog|Credits\s*&\s*References|Appendix\b|Design Notes\b)/i.test(
          plain(entry).trim(),
        ),
    );
    if (sectionEnd) to = Math.min(to, bounds.get(sectionEnd)!.start);
    const removedAdvice: string[] = [];
    /** Render only this spell's interval; retain semantic formatting across page breaks. */
    function render(entry: HtmlNode): string {
      const b = bounds.get(entry)!;
      if (b.end <= from || b.start >= to) return "";
      if (
        !renderingStatBlock &&
        statBlocks.some((stat) => b.start >= stat.start && b.end <= stat.end)
      )
        return "";
      if (entry.value !== undefined) {
        const parent = entry.parentNode?.tagName ?? "";
        if (
          !entry.value.trim() &&
          [
            "",
            "html",
            "body",
            "div",
            "section",
            "ul",
            "ol",
            "table",
            "thead",
            "tbody",
            "tr",
          ].includes(parent)
        )
          return "";
        return entry.value.replace(/\s+/g, " ");
      }
      const tag = entry.tagName ?? "";
      if (["script", "style", "img", "hr"].includes(tag)) return "";
      const classes =
        entry.attrs?.find((attribute) => attribute.name === "class")?.value ??
        "";
      if (/\b(?:pageNumber|footnote|column-break)\b/.test(classes)) return "";
      if (
        tag === "blockquote" &&
        !(/armor class/i.test(plain(entry)) && /hit points/i.test(plain(entry)))
      ) {
        const advice = plain(entry).trim();
        if (advice) removedAdvice.push(advice);
        return "";
      }
      if (tag === "table") {
        const rows = nodes
          .filter(
            (child) =>
              child.tagName === "tr" &&
              bounds.get(child)!.start >= Math.max(b.start, from) &&
              bounds.get(child)!.end <= Math.min(b.end, to),
          )
          .map((row) =>
            (row.childNodes ?? [])
              .filter((cell) => ["td", "th"].includes(cell.tagName ?? ""))
              .map((cell) =>
                (cell.childNodes ?? [])
                  .map(render)
                  .join("")
                  .trim()
                  .replace(/\|/g, "\\|")
                  .replace(/\n/g, "<br>"),
              ),
          );
        if (!rows.length) return "";
        const width = Math.max(...rows.map((row) => row.length));
        const lines = rows.map(
          (row) =>
            `| ${Array.from({ length: width }, (_, column) => row[column] ?? "").join(" | ")} |`,
        );
        lines.splice(1, 0, `| ${Array(width).fill("---").join(" | ")} |`);
        return `${lines.join("\n")}\n\n`;
      }
      const contents = (entry.childNodes ?? []).map(render).join("");
      if (["strong", "b"].includes(tag)) return `**${contents}**`;
      if (["em", "i"].includes(tag)) return `_${contents}_`;
      if (tag === "br") return "\n";
      if (tag === "li") return `- ${contents.trim().replace(/\n/g, "\n  ")}\n`;
      if (tag === "ul" || tag === "ol") return `\n${contents}\n`;
      if (/^h[1-6]$/.test(tag))
        return `${"#".repeat(Number(tag[1]))} ${contents.trim()}\n\n`;
      if (tag === "p" || tag === "blockquote") return `${contents.trim()}\n\n`;
      return contents;
    }
    const fields: Record<string, string> = {};
    for (const item of metadata.childNodes ?? []) {
      if (item.tagName !== "li") continue;
      const label = item.childNodes?.find(
        (child) => child.tagName === "strong",
      );
      const labelText = label ? plain(label) : "";
      const field = labelText.trim().replace(/:$/, "");
      if (!field || Object.hasOwn(fields, field))
        throw new Error(`Invalid or duplicate metadata for ${plain(node)}`);
      fields[field] = plain(item).trim().slice(labelText.length).trim();
    }
    let text = render(root).trim();
    const referenced = statBlocks.filter(
      (stat) =>
        /stat block/i.test(text) &&
        text.toLowerCase().includes(stat.name.toLowerCase()),
    );
    for (const stat of referenced) {
      renderingStatBlock = true;
      from = stat.start;
      to = stat.end;
      text += `\n\n${render(root).trim()}`;
      attached.add(stat.name);
    }
    blocks.push({
      name: plain(node).trim(),
      header,
      fields,
      text: text
        .replace(/\n[ \t]+\n/g, "\n\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
      removedAdvice,
    });
  }
  const credits = nodes.find(
    (node) =>
      node.tagName === "h2" &&
      /^Credits\s*&\s*References$/i.test(plain(node).trim()),
  );
  if (!credits?.parentNode)
    throw new Error("Missing source licensing and credits section");
  const licenseEvidence = plain(credits.parentNode).trim();
  if (
    !/Creative Commons Attribution 4\.0 International/i.test(licenseEvidence) ||
    requiredCredits.some(
      (credit) => !licenseEvidence.toLowerCase().includes(credit.toLowerCase()),
    )
  ) {
    throw new Error(
      "Publisher licensing or contributor credits changed; review the source before importing",
    );
  }
  return {
    blocks,
    licenseEvidence,
    unattachedStatBlocks: statBlocks
      .filter((stat) => !attached.has(stat.name))
      .map((stat) => stat.name),
  };
}

/** Prepare direct-source candidates with publisher licensing evidence and explicit review gates. */
export function prepareGmBinderSpells(
  html: string,
  config: GmBinderSpellSource,
) {
  const extracted = extractGmBinderSpells(html, config.requiredCredits);
  const spells: Spell[] = [];
  const withheld: { name: string; reason: string }[] = [];
  for (const block of extracted.blocks) {
    const reserved = reservedWotcName(`${block.name}\n${block.text}`);
    if (reserved) {
      withheld.push({
        name: block.name,
        reason: `Potential reserved Wizards of the Coast name (${reserved}); withheld pending reuse review.`,
      });
      continue;
    }
    try {
      spells.push(mapDirectSpellBlock(block, config.source));
    } catch (error) {
      withheld.push({
        name: block.name,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }
  spells.sort((a, b) => a.name.localeCompare(b.name));
  return {
    spells,
    blocks: extracted.blocks,
    report: {
      source: config.source,
      sourceUrl: config.url,
      license: "CC-BY-4.0",
      licenseEvidence: extracted.licenseEvidence,
      attribution: config.attribution,
      rawCount: extracted.blocks.length,
      keptCount: spells.length,
      withheld,
      unattachedStatBlocks: extracted.unattachedStatBlocks,
      omittedAdvice: extracted.blocks
        .filter((block) => block.removedAdvice.length)
        .map((block) => ({ name: block.name, panels: block.removedAdvice })),
      specializations: extracted.blocks
        .filter((block) => /\((?!ritual\))[^)]*\)/i.test(block.header))
        .map((block) => ({ name: block.name, header: block.header })),
      replacements: extracted.blocks
        .filter((block) => block.fields.Replaces)
        .map((block) => ({
          name: block.name,
          replaces: block.fields.Replaces,
        })),
      publishable: false,
      blockers: [
        "Review spell boundaries, tables, nested summon stat blocks, and omitted advice against the source.",
        "Candidates are display-only; review damage, saves, attacks, and scaling before adding rollable mechanics.",
        "Verify the current source’s rules edition and contributor attribution coverage; exclude art, site styling, appendices, and design commentary.",
        "Resolve validation findings and review withheld spells before publishing.",
        "Console registration, credits, and shipped JSON remain a separately authorized publishing change.",
      ],
      validation: validateSpellDataset(spells),
    },
  };
}
