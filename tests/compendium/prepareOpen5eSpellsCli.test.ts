// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const script = fileURLToPath(
  new URL("../../scripts/prepare-open5e-spells.ts", import.meta.url),
);
const validator = fileURLToPath(
  new URL("../../scripts/validate-compendium.ts", import.meta.url),
);

it("replays offline, keeps source IDs distinct, protects SRD datasets, and fails the publishing gate", () => {
  const dir = mkdtempSync(join(tmpdir(), "openfray-spells-"));
  try {
    const cache = join(dir, "snapshot.json");
    const keys = [
      "test",
      "second",
      "srd-2024",
      "srd-2014",
      "spells-that-dont-suck",
      "open5e",
      "a5e-ag",
      "bfrd",
      "vom",
    ];
    for (const key of ["spells-that-dont-suck", "a5e-ag"]) {
      const old = join(dir, "output/open5e-spell-preparation", key);
      mkdirSync(old, { recursive: true });
      writeFileSync(join(old, "candidate-spells.json"), "[]");
    }
    writeFileSync(
      cache,
      JSON.stringify({
        fetchedAt: "2026-10-08T00:00:00Z",
        documents: keys.map((key) => ({
          key,
          name: key,
          type: "SOURCE",
          publisher: { key: "publisher", name: "Publisher" },
          gamesystem:
            key === "a5e-ag"
              ? { key: "a5e", name: "A5E" }
              : { key: "5e-2014", name: "5th Edition 2014" },
          licenses: [{ key: "cc-by-40", name: "CC-BY" }],
        })),
        records: keys
          .filter((key) => !["bfrd", "vom"].includes(key))
          .map((key) => ({
            key: `${key === "srd-2014" ? "srd" : key}_test`,
            document: { key },
            name: "Same Spell",
            level: 1,
            school: { name: "Evocation" },
            casting_time: "action",
            range_text: "Self",
            duration: "Instantaneous",
            concentration: false,
            ritual: false,
            verbal: true,
            somatic: true,
            material: false,
            classes: [],
            desc: "You create a spark.",
          })),
      }),
    );
    const prepared = spawnSync(process.execPath, [script, "all", cache], {
      cwd: dir,
      encoding: "utf8",
    });
    expect(prepared.status, prepared.stderr).toBe(0);
    const root = join(dir, "output/open5e-spell-preparation");
    const index = JSON.parse(readFileSync(join(root, "index.json"), "utf8"));
    expect(
      index.sources.map((source: { document: string }) => source.document),
    ).toEqual(["open5e", "second", "test"]);
    expect(index.emptySources).toEqual(["bfrd", "vom"]);
    expect(index.inventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ document: "bfrd", rawCount: 0 }),
        expect.objectContaining({ document: "vom", rawCount: 0 }),
        expect.objectContaining({ document: "open5e", rawCount: 1 }),
      ]),
    );
    expect(index.skipped).toEqual([
      "a5e-ag",
      "spells-that-dont-suck",
      "srd-2014",
      "srd-2024",
    ]);
    for (const key of ["spells-that-dont-suck", "a5e-ag"])
      expect(existsSync(join(root, key))).toBe(false);
    const discovery = JSON.parse(
      readFileSync(join(root, "discovery.json"), "utf8"),
    );
    expect(
      discovery.documents.map((entry: { key: string }) => entry.key),
    ).toEqual(["test", "second", "open5e", "bfrd", "vom"]);
    expect(
      discovery.records.map(
        (entry: { document: { key: string } }) => entry.document.key,
      ),
    ).toEqual(["test", "second", "open5e"]);
    const first = JSON.parse(
      readFileSync(join(root, "test/candidate-spells.json"), "utf8"),
    );
    const second = JSON.parse(
      readFileSync(join(root, "second/candidate-spells.json"), "utf8"),
    );
    expect(first[0].id).not.toBe(second[0].id);
    const report = JSON.parse(
      readFileSync(join(root, "test/report.json"), "utf8"),
    );
    expect(report.publishable).toBe(false);
    expect(report.validation.errors).toBe(0);
    expect(report.fidelity.length).toBeGreaterThan(0);
    const checked = spawnSync(
      process.execPath,
      [validator, "--spells", join(root, "test/candidate-spells.json")],
      { cwd: dir, encoding: "utf8" },
    );
    expect(checked.status, checked.stderr).toBe(0);
    expect(checked.stdout).toContain("1 spells");
    const strict = spawnSync(
      process.execPath,
      [script, "test", cache, "--strict"],
      { cwd: dir, encoding: "utf8" },
    );
    expect(strict.status, strict.stderr).toBe(1);
    const protectedSource = spawnSync(
      process.execPath,
      [script, "srd-2024", cache],
      { cwd: dir, encoding: "utf8" },
    );
    expect(protectedSource.status).not.toBe(0);
    expect(protectedSource.stderr).toContain("Unsupported spell source");
    first[0].text = "";
    writeFileSync(
      join(root, "test/candidate-spells.json"),
      JSON.stringify(first),
    );
    const invalid = spawnSync(
      process.execPath,
      [validator, "--spells", join(root, "test/candidate-spells.json")],
      { cwd: dir, encoding: "utf8" },
    );
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toContain("no description text");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
