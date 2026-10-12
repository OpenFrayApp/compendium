// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { fetchOpen5ePages, type JsonFetcher } from "./open5ePagination.ts";
import type { Open5eSpellDocument, Open5eSpellRecord, Open5eSpellSnapshot } from "./open5eTypes.ts";
import type { Spell } from "../schema/spell.ts";
import { validateSpellDataset } from "./validate.ts";
import { reservedWotcName } from "./sourcePolicy.ts";
import {
  recoverLegacySpellClasses,
  type LegacySpellClassSnapshot,
} from "./open5eSpellClasses.ts";

const API = "https://api.open5e.com/v2/";
const KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const EXCLUDED_OPEN5E_SPELL_SOURCES = new Set([
  "srd-2024",
  "srd-2014",
  "spells-that-dont-suck",
  "kp",
  "open5e",
  "open5e-2024",
  "o5e",
]);

/** Validate snapshot identity without dropping malformed spell fields from the raw cache. */
export function assertSpellSnapshot(snapshot: Open5eSpellSnapshot): void {
  if (
    !snapshot ||
    !Array.isArray(snapshot.documents) ||
    !Array.isArray(snapshot.records) ||
    typeof snapshot.fetchedAt !== "string" ||
    !snapshot.fetchedAt
  )
    throw new Error("Invalid spell snapshot");
  const documents = new Set<string>();
  for (const document of snapshot.documents) {
    if (
      !document ||
      !KEY.test(document.key) ||
      documents.has(document.key) ||
      !document.name?.trim() ||
      !KEY.test(document.publisher?.key ?? "") ||
      !document.gamesystem?.key ||
      !Array.isArray(document.licenses)
    )
      throw new Error("Invalid or duplicate document metadata");
    documents.add(document.key);
  }
  const records = new Set<string>();
  for (const record of snapshot.records) {
    // The skipped 2014 SRD retains its historical API prefix after its document was renamed.
    const prefix =
      record?.document?.key === "srd-2014"
        ? "srd_"
        : `${record?.document?.key}_`;
    if (
      !record ||
      typeof record.key !== "string" ||
      records.has(record.key) ||
      !documents.has(record.document?.key) ||
      !record.key.startsWith(prefix) ||
      !record.key.slice(prefix.length)
    )
      throw new Error("Invalid, duplicate, or unmatched spell key");
    records.add(record.key);
  }
}

/** Select third-party D&D 5e documents outside the existing core and direct-publisher pipelines. */
export function thirdPartySpellDocuments(
  snapshot: Open5eSpellSnapshot,
): Open5eSpellDocument[] {
  return snapshot.documents.filter(
    (document) =>
      KEY.test(document.key) &&
      document.type === "SOURCE" &&
      (document.gamesystem.key === "5e-2014" ||
        document.gamesystem.key === "5e-2024") &&
      !EXCLUDED_OPEN5E_SPELL_SOURCES.has(document.key),
  );
}

/** Select a third-party spell source while protecting the existing authoritative SRD datasets. */
export function spellDocument(
  snapshot: Open5eSpellSnapshot,
  key: string,
): Open5eSpellDocument {
  const document = thirdPartySpellDocuments(snapshot).find(
    (entry) => entry.key === key,
  );
  if (!document) {
    throw new Error(
      `Unsupported spell source: ${key}; select a third-party D&D 5e document outside existing pipelines`,
    );
  }
  return document;
}

/** Fetch source metadata and document-filtered third-party spells without downloading SRD records. */
export async function fetchSpellSnapshot(
  fetchJson: JsonFetcher,
  key?: string,
): Promise<Open5eSpellSnapshot> {
  const documents = await fetchOpen5ePages<Open5eSpellDocument>(
    `${API}documents/?format=json&limit=100`,
    "/v2/documents/",
    fetchJson,
  );
  const snapshot: Open5eSpellSnapshot = {
    documents,
    records: [],
    fetchedAt: new Date().toISOString(),
  };
  assertSpellSnapshot(snapshot);
  const selected = key
    ? [spellDocument(snapshot, key)]
    : thirdPartySpellDocuments(snapshot);
  snapshot.documents = selected;
  for (const document of selected) {
    const url = new URL("spells/?format=json&limit=100", API);
    url.searchParams.set("document__key", document.key);
    const records = await fetchOpen5ePages<Open5eSpellRecord>(
      url.href,
      "/v2/spells/",
      fetchJson,
      { parameter: "document__key", value: document.key },
    );
    if (records.some((record) => record.document?.key !== document.key))
      throw new Error("Mixed spell documents in filtered response");
    snapshot.records.push(...records);
  }
  assertSpellSnapshot(snapshot);
  return snapshot;
}

/** Identify display fields that cannot be mapped safely without inventing source data. */
function missingFields(record: Open5eSpellRecord): string[] {
  const fields: string[] = [];
  for (const [field, value] of Object.entries({
    name: record.name,
    school: record.school?.name,
    casting_time: record.casting_time,
    range_text: record.range_text,
    duration: record.duration,
    desc: record.desc,
  })) {
    if (typeof value !== "string" || !value.trim()) fields.push(field);
  }
  if (!Number.isInteger(record.level) || record.level < 0 || record.level > 9)
    fields.push("level");
  for (const field of [
    "concentration",
    "ritual",
    "verbal",
    "somatic",
    "material",
  ] as const) {
    if (typeof record[field] !== "boolean") fields.push(field);
  }
  if (
    !Array.isArray(record.classes) ||
    record.classes.some(
      (entry) => typeof entry?.name !== "string" || !entry.name.trim(),
    )
  )
    fields.push("classes");
  for (const field of [
    "higher_level",
    "reaction_condition",
    "material_specified",
  ] as const) {
    if (record[field] != null && typeof record[field] !== "string")
      fields.push(field);
  }
  return fields;
}

/** Map display fields and preserve prose without interpreting unreviewed rollable mechanics. */
export function mapOpen5eSpell(
  record: Open5eSpellRecord,
  document: Open5eSpellDocument,
): Spell {
  if (EXCLUDED_OPEN5E_SPELL_SOURCES.has(document.key))
    throw new Error(`Unsupported spell source: ${document.key}`);
  if (record.document.key !== document.key)
    throw new Error("Spell document mismatch");
  const missing = missingFields(record);
  if (missing.length)
    throw new Error(`Unmappable spell fields: ${missing.join(", ")}`);
  const source = `${document.publisher.key}-${document.key}`;
  let castingTime = record.casting_time;
  if (record.reaction_condition)
    castingTime += ` (${record.reaction_condition})`;
  if (record.ritual && !/ritual/i.test(castingTime))
    castingTime += " or Ritual";
  const duration = record.concentration
    ? `up to ${record.duration.replace(/^concentration\s*[,;:]?\s*/i, "").replace(/^up to\s+/i, "")}`
    : record.duration;
  const edition =
    document.gamesystem.key === "5e-2024"
      ? "5.5"
      : document.gamesystem.key === "5e-2014"
        ? "5.0"
        : undefined;
  return {
    id: `${source}:${record.key.slice(document.key.length + 1)}`,
    source,
    ...(edition && { edition }),
    name: record.name,
    level: record.level,
    school: record.school.name,
    castingTime,
    range: record.range_text,
    duration,
    concentration: record.concentration,
    ritual: record.ritual,
    components: {
      verbal: record.verbal,
      somatic: record.somatic,
      material: record.material,
      ...(record.material_specified && {
        materials: record.material_specified,
      }),
    },
    ...(record.classes.length && {
      classes: record.classes.map((entry) => entry.name),
    }),
    text: record.higher_level
      ? `${record.desc}\n\n**At Higher Levels.** ${record.higher_level}`
      : record.desc,
  };
}

/** Prepare independent source candidates with explicit fidelity and licensing blockers. */
export function prepareOpen5eSpells(
  snapshot: Open5eSpellSnapshot,
  key: string,
  legacy?: LegacySpellClassSnapshot,
) {
  assertSpellSnapshot(snapshot);
  const document = spellDocument(snapshot, key);
  const records = snapshot.records.filter(
    (record) => record.document.key === key,
  );
  const classRecovery = recoverLegacySpellClasses(records, key, legacy);
  const excluded: { key: string; name: string; reason: string }[] = [];
  const withheld: { key: string; name: string; reason: string }[] = [];
  const fidelity: { key: string; name: string; message: string }[] = [];
  const spells: Spell[] = [];
  for (const record of records) {
    if (typeof record.name === "string" && reservedWotcName(record.name)) {
      excluded.push({
        key: record.key,
        name: record.name,
        reason:
          "Potential reserved Wizards of the Coast name; withheld under conservative repository policy.",
      });
      continue;
    }
    const missing = missingFields(record);
    if (missing.length) {
      withheld.push({
        key: record.key,
        name: record.name ?? record.key,
        reason: `Unmappable spell fields: ${missing.join(", ")}`,
      });
      continue;
    }
    const recovered = classRecovery.get(record.key);
    spells.push(
      mapOpen5eSpell(
        recovered
          ? {
              ...record,
              classes: recovered.map((name) => ({ name })),
            }
          : record,
        document,
      ),
    );
    fidelity.push({
      key: record.key,
      name: record.name,
      message:
        "Display-only candidate: damage, saves, attacks, casting options, and scaling require mechanics review.",
    });
    if (!record.classes.length && !recovered)
      fidelity.push({
        key: record.key,
        name: record.name,
        message: "No class assignments supplied by the API.",
      });
    if (
      document.gamesystem.key !== "5e-2014" &&
      document.gamesystem.key !== "5e-2024"
    ) {
      fidelity.push({
        key: record.key,
        name: record.name,
        message: `Unsupported edition mapping: ${document.gamesystem.key}; edition remains unset.`,
      });
    }
  }
  spells.sort((a, b) => a.name.localeCompare(b.name));
  const preferredLicense =
    ["cc-by-40", "orc", "ogl-10a"].find((license) =>
      document.licenses.some((entry) => entry.key === license),
    ) ?? null;
  return {
    spells,
    report: {
      document: key,
      documentMetadata: document,
      fetchedAt: snapshot.fetchedAt,
      source: `${document.publisher.key}-${document.key}`,
      publishable: false,
      rawCount: records.length,
      keptCount: spells.length,
      preferredLicense,
      licenseStatus: "unverified-api-metadata",
      exclusionsReviewed: false,
      excluded,
      withheld,
      fidelity,
      classRecovery: [...classRecovery].map(([key, classes]) => ({
        key,
        classes,
      })),
      transformations: [
        "Append reaction conditions and ritual availability to casting time.",
        "Normalize concentration duration for the separate schema flag.",
        "Append higher-level prose under a display heading; preserve the API description.",
      ],
      blockers: [
        "Verify the exact source edition, licensed coverage, and publisher-required attribution; API license metadata alone is insufficient.",
        "For OGL sources, obtain the source’s OGC/PI declaration and complete verbatim Section 15 chain.",
        "Review exclusions, withheld records, display fields, and missing class assignments against authorized sources.",
        "Review structured mechanics and casting options before adding rollable fields; candidates currently contain display fields and prose only.",
        "Black Flag source-specific rules require review; do not assume ordinary SRD semantics.",
        "Resolve validation errors and review warnings; passing validation does not grant publishing approval.",
        "Console registration, shipped JSON, and credits require a separately authorized publishing change.",
      ],
      validation: validateSpellDataset(spells),
    },
  };
}
