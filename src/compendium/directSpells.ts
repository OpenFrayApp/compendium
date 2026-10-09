// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Spell } from "../schema/spell.ts";
import { slug } from "./srd52.ts";

export interface DirectSpellBlock {
  name: string;
  sourcePage?: number;
  header: string;
  fields: Record<string, string>;
  text: string;
  removedAdvice: string[];
}

export const DIRECT_SPELL_HEADER =
  /^(?:([1-9])(?:st|nd|rd|th)-level (abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation|psionic)|(abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation|psionic) cantrip)(?:\s*\([^)]*\))*$/i;

/** Map source display fields while leaving compound and conditional mechanics as prose. */
export function mapDirectSpellBlock(
  block: DirectSpellBlock,
  source: string,
  options: { allowMissingClasses?: boolean } = {},
): Spell {
  const match = DIRECT_SPELL_HEADER.exec(block.header);
  if (!match || !block.name || !block.text)
    throw new Error(`Invalid spell block: ${block.name}`);
  for (const field of [
    ...(options.allowMissingClasses ? [] : ["Classes"]),
    "Casting Time",
    "Range",
    "Components",
    "Duration",
  ]) {
    if (!block.fields[field]?.trim())
      throw new Error(`Missing ${field}: ${block.name}`);
  }
  const concentration = /^concentration\b/i.test(block.fields.Duration);
  const ritual =
    /\([^)]*\britual\b[^)]*\)/i.test(block.header) ||
    /ritual/i.test(block.fields["Casting Time"]);
  const duration = concentration
    ? `up to ${block.fields.Duration.replace(/^concentration\s*[,;:]?\s*/i, "").replace(/^up to\s+/i, "")}`
    : block.fields.Duration;
  const components = block.fields.Components;
  const material = /\bM\b/.test(components);
  const materials = /\bM\s*\(([\s\S]*)\)\s*$/.exec(components)?.[1];
  const school = match[2] ?? match[3];
  return {
    id: `${source}:${slug(block.name)}`,
    source,
    name: block.name,
    ...(block.sourcePage !== undefined && { sourcePage: block.sourcePage }),
    level: Number(match[1] ?? 0),
    school: school[0].toUpperCase() + school.slice(1).toLowerCase(),
    ...(block.fields.Classes && {
      classes: block.fields.Classes.split(",").map((entry) => entry.trim()),
    }),
    castingTime:
      ritual && !/ritual/i.test(block.fields["Casting Time"])
        ? `${block.fields["Casting Time"]} or Ritual`
        : block.fields["Casting Time"],
    range: block.fields.Range,
    duration,
    concentration,
    ritual,
    components: {
      verbal: /\bV\b/.test(components),
      somatic: /\bS\b/.test(components),
      material,
      ...(materials && { materials }),
    },
    text: block.text,
  };
}
