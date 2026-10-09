// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import {
  legacySpellDocument,
  type LegacySpellClassSnapshot,
} from "../src/compendium/open5eSpellClasses.ts";
import {
  EXCLUDED_OPEN5E_SPELL_SOURCES,
  assertSpellSnapshot,
  fetchSpellSnapshot,
  prepareOpen5eSpells,
  spellDocument,
  thirdPartySpellDocuments,
  type Open5eSpellSnapshot,
} from "../src/compendium/open5eSpells.ts";

/** Fetch API JSON with a bounded timeout and explicit content negotiation. */
async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "openfray-compendium",
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok)
    throw new Error(`Open5e returned ${response.status}: ${url}`);
  return response.json();
}

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const [key, cachePath, legacyCachePath, ...extra] = args.filter(
  (arg) => arg !== "--strict",
);
if (
  !key ||
  extra.length ||
  args.some((arg) => arg.startsWith("--") && arg !== "--strict")
) {
  throw new Error(
    "Usage: npm run prepare:open5e-spells -- <document-key|all> [snapshot.json] [legacy-cache-directory] [--strict]",
  );
}
const loaded: Open5eSpellSnapshot = cachePath
  ? JSON.parse(readFileSync(cachePath, "utf8"))
  : await fetchSpellSnapshot(fetchJson, key === "all" ? undefined : key);
assertSpellSnapshot(loaded);
if (key !== "all") spellDocument(loaded, key);
const documents = thirdPartySpellDocuments(loaded);
const supported = new Set(documents.map((document) => document.key));
const snapshot = {
  ...loaded,
  documents,
  records: loaded.records.filter((record) =>
    supported.has(record.document.key),
  ),
};
const skipped = [
  ...new Set(
    loaded.records
      .filter((record) => !supported.has(record.document.key))
      .map((record) => record.document.key),
  ),
].sort();
const root = "output/open5e-spell-preparation";
mkdirSync(root, { recursive: true });
const excludedSources = new Set([
  ...EXCLUDED_OPEN5E_SPELL_SOURCES,
  ...loaded.documents
    .filter((document) => !supported.has(document.key))
    .map((document) => document.key),
]);
for (const excluded of excludedSources)
  rmSync(`${root}/${excluded}`, { recursive: true, force: true });
writeFileSync(`${root}/discovery.json`, JSON.stringify(snapshot, null, 2));
const observed = [
  ...new Set(snapshot.records.map((record) => record.document.key)),
].sort();
const selected =
  key === "all"
    ? observed.filter((document) => {
        try {
          spellDocument(snapshot, document);
          return true;
        } catch {
          return false;
        }
      })
    : [key];
if (!selected.length)
  throw new Error("No supported third-party spell sources in snapshot");
const index: {
  document: string;
  rawCount: number;
  keptCount: number;
  errors: number;
  warnings: number;
}[] = [];
for (const document of selected) {
  const dir = `${root}/${document}`;
  mkdirSync(dir, { recursive: true });
  const local = {
    ...snapshot,
    documents: [spellDocument(snapshot, document)],
    records: snapshot.records.filter(
      (record) => record.document.key === document,
    ),
  };
  writeFileSync(`${dir}/raw.json`, JSON.stringify(local, null, 2));
  const legacyFile = legacyCachePath
    ? join(legacyCachePath, `${legacySpellDocument(document)}.json`)
    : undefined;
  const legacyRaw =
    legacyFile && existsSync(legacyFile)
      ? readFileSync(legacyFile, "utf8")
      : undefined;
  const legacy: LegacySpellClassSnapshot | undefined = legacyRaw
    ? JSON.parse(legacyRaw)
    : undefined;
  const { spells, report } = prepareOpen5eSpells(local, document, legacy);
  if (legacyRaw) writeFileSync(`${dir}/raw-v1.json`, legacyRaw);
  else rmSync(`${dir}/raw-v1.json`, { force: true });
  writeFileSync(`${dir}/candidate-spells.json`, JSON.stringify(spells));
  writeFileSync(
    `${dir}/report.json`,
    JSON.stringify(
      {
        ...report,
        legacyClassSnapshot: legacyRaw
          ? {
              document: legacySpellDocument(document),
              sha256: createHash("sha256").update(legacyRaw).digest("hex"),
            }
          : null,
      },
      null,
      2,
    ),
  );
  index.push({
    document,
    rawCount: report.rawCount,
    keptCount: report.keptCount,
    errors: report.validation.errors,
    warnings: report.validation.warns,
  });
  console.log(
    `${document}: ${spells.length}/${report.rawCount} provisional spells; ${report.excluded.length} excluded; ${report.withheld.length} withheld; ${report.validation.errors} errors, ${report.validation.warns} warnings → ${dir}`,
  );
  if (strict && !report.publishable) process.exitCode = 1;
}
writeFileSync(
  `${root}/index.json`,
  JSON.stringify(
    {
      publishable: false,
      inventory: documents.map((document) => ({
        document: document.key,
        name: document.name,
        gamesystem: document.gamesystem,
        licenses: document.licenses,
        rawCount: snapshot.records.filter(
          (record) => record.document.key === document.key,
        ).length,
      })),
      emptySources: documents
        .filter((document) => !observed.includes(document.key))
        .map((document) => document.key)
        .sort(),
      sources: index,
      skipped,
    },
    null,
    2,
  ),
);
console.log(
  "Publishing blocked: see source reports. Existing SRD pipelines and console files are unchanged.",
);
