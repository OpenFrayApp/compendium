// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { prepareGmBinderSpells } from "../../src/compendium/gmBinderSpells.ts";

interface PreparationConfig {
  name: string;
  root: string;
  url: string;
  command: string;
  prepare: (html: string) => ReturnType<typeof prepareGmBinderSpells>;
}

/** Cache source HTML and emit independent, unpublished spell candidates with replay evidence. */
export async function prepareGmBinderLibrary(
  config: PreparationConfig,
  args = process.argv.slice(2),
): Promise<void> {
  const strict = args.includes("--strict");
  const [cachePath, ...extra] = args.filter((arg) => arg !== "--strict");
  if (
    extra.length ||
    args.some((arg) => arg.startsWith("--") && arg !== "--strict")
  ) {
    throw new Error(
      `Usage: npm run ${config.command} -- [source.html] [--strict]`,
    );
  }
  const root = config.root;
  let html: string;
  if (cachePath) html = readFileSync(cachePath, "utf8");
  else {
    const response = await fetch(config.url, {
      signal: AbortSignal.timeout(60_000),
      headers: { "User-Agent": "openfray-compendium" },
    });
    if (!response.ok) throw new Error(`GM Binder returned ${response.status}`);
    html = await response.text();
  }
  mkdirSync(root, { recursive: true });
  writeFileSync(`${root}/source.html`, html);
  const { spells, blocks, report } = config.prepare(html);
  writeFileSync(`${root}/blocks.json`, JSON.stringify(blocks, null, 2));
  writeFileSync(`${root}/candidate-spells.json`, JSON.stringify(spells));
  writeFileSync(
    `${root}/report.json`,
    JSON.stringify(
      {
        ...report,
        preparedAt: new Date().toISOString(),
        input: cachePath ? "offline" : "live",
        sha256: createHash("sha256").update(html).digest("hex"),
      },
      null,
      2,
    ),
  );
  console.log(
    `${config.name}: ${spells.length}/${report.rawCount} provisional spells; ${report.withheld.length} withheld; ${report.validation.errors} errors, ${report.validation.warns} warnings → ${root}`,
  );
  console.log(
    "Publisher license evidence retained. Publishing remains blocked; no Open5e feed, SRD dataset, or console changes.",
  );
  if (strict && !report.publishable) process.exitCode = 1;
}
