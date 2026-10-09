// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Open5eSpellRecord } from "./open5eSpells.ts";

export interface LegacySpellClassRecord {
  slug: string;
  name: string;
  desc: string;
  dnd_class: string;
  document__slug: string;
}

export interface LegacySpellClassSnapshot {
  count: number;
  next: string | null;
  results: LegacySpellClassRecord[];
}

const aliases = new Map([
  ["deepm", "dmag"],
  ["deepmx", "dmag-e"],
  ["wz", "warlock"],
  ["open5e", "o5e"],
]);

/** Resolve the explicit v1 document alias without inferring a source from a spell name. */
export function legacySpellDocument(key: string): string {
  return aliases.get(key) ?? key;
}

/** Recover absent class lists only from complete, same-source snapshots with matching IDs and prose. */
export function recoverLegacySpellClasses(
  records: Open5eSpellRecord[],
  key: string,
  snapshot?: LegacySpellClassSnapshot,
): Map<string, string[]> {
  const recovered = new Map<string, string[]>();
  if (!snapshot) return recovered;
  if (
    !Array.isArray(snapshot.results) ||
    snapshot.next !== null ||
    snapshot.count !== snapshot.results.length
  )
    throw new Error("Incomplete legacy spell class snapshot");
  const source = legacySpellDocument(key);
  const legacy = new Map<string, LegacySpellClassRecord>();
  for (const entry of snapshot.results) {
    if (entry.document__slug !== source)
      throw new Error("Mixed legacy spell class sources");
    if (typeof entry.slug !== "string" || legacy.has(entry.slug))
      throw new Error("Invalid or duplicate legacy spell key");
    legacy.set(entry.slug, entry);
  }
  for (const record of records) {
    if (
      record.document.key !== key ||
      !Array.isArray(record.classes) ||
      record.classes.length ||
      typeof record.desc !== "string"
    )
      continue;
    const prefix = `${key}_`;
    if (!record.key.startsWith(prefix)) continue;
    const entry = legacy.get(record.key.slice(prefix.length));
    if (
      !entry ||
      entry.name !== record.name ||
      typeof entry.desc !== "string" ||
      typeof entry.dnd_class !== "string"
    )
      continue;
    if (
      entry.desc.replace(/\s+/g, " ").trim() !==
      record.desc.replace(/\s+/g, " ").trim()
    )
      continue;
    const classes = entry.dnd_class
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    if (classes.length) recovered.set(record.key, [...new Set(classes)]);
  }
  return recovered;
}
