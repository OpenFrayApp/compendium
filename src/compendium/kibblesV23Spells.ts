// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { mapDirectSpellBlock, type DirectSpellBlock } from "./directSpells.ts";
import { reservedWotcName } from "./sourcePolicy.ts";
import { validateSpellDataset } from "./validate.ts";

export const KIBBLES_V23_URL =
  "https://static1.squarespace.com/static/5e7eab9fcc76e2321541f8b3/t/67310012bfaa046721d850fb/1731264535758/SpellCompemdiumV2.3.pdf";
export interface KibblesV23Snapshot {
  version: string;
  scope: string;
  detectedHeaders: number;
  pdfPages: number;
  sha256: string;
  licenseEvidence: string;
  unattachedStatBlocks?: string[];
  blocks: (DirectSpellBlock & {
    sourcePage: number;
    extractionIssues?: string[];
    attachedStatBlocks?: string[];
    omittedParatext?: string[];
    creditedSource?: string | null;
    creditEvidence?: string;
  })[];
}

/** Prepare the full v2.3 collection while retaining extraction and reuse findings explicitly. */
export function prepareKibblesV23Spells(snapshot: KibblesV23Snapshot) {
  if (
    !snapshot ||
    snapshot.version !== "2.3" ||
    snapshot.scope !== "all-spells" ||
    !Number.isInteger(snapshot.pdfPages) ||
    snapshot.pdfPages < 1 ||
    !/^[a-f0-9]{64}$/.test(snapshot.sha256) ||
    !Array.isArray(snapshot.blocks) ||
    snapshot.blocks.length !== 295 ||
    snapshot.detectedHeaders !== snapshot.blocks.length ||
    !snapshot.licenseEvidence?.includes("Kibbles") ||
    !snapshot.licenseEvidence.includes("CC-BY-4.0")
  ) {
    throw new Error(
      "Invalid or incomplete Kibbles v2.3 full-library snapshot or missing publisher licensing evidence",
    );
  }
  const source = "kibblestasty-casting-compendium-v2.3";
  const spells = [];
  const withheld: { name: string; reason: string }[] = [];
  const fidelity: { name: string; message: string }[] = [];
  const separatelyCredited: {
    name: string;
    source: string;
    evidence: string;
  }[] = [];
  for (const block of snapshot.blocks) {
    if (
      !Number.isInteger(block.sourcePage) ||
      block.sourcePage < 1 ||
      block.sourcePage > snapshot.pdfPages
    ) {
      throw new Error(`Invalid PDF page provenance: ${block.name}`);
    }
    const reserved = reservedWotcName(`${block.name}\n${block.text}`);
    if (reserved || block.extractionIssues?.length) {
      withheld.push({
        name: block.name,
        reason: reserved
          ? `Potential reserved Wizards name (${reserved}); pending reuse review.`
          : block.extractionIssues!.join("; "),
      });
      continue;
    }
    if (block.creditedSource) {
      separatelyCredited.push({
        name: block.name,
        source: block.creditedSource,
        evidence: block.creditEvidence ?? "",
      });
      if (
        block.creditedSource !== "So Many Spells" ||
        !block.creditEvidence?.includes("So Many Spells")
      ) {
        withheld.push({
          name: block.name,
          reason:
            "Unverified separately credited source; review its licensing before mapping.",
        });
        continue;
      }
    }
    try {
      spells.push(
        mapDirectSpellBlock(block, source, { allowMissingClasses: true }),
      );
      if (!block.fields.Classes)
        fidelity.push({
          name: block.name,
          message: "No class assignments printed; classes remain unset.",
        });
      if (/psionic/i.test(block.header))
        fidelity.push({
          name: block.name,
          message:
            "Source-defined Psionic school preserved; do not assume ordinary SRD spellcasting semantics.",
        });
      if (/stat block/i.test(block.text) && !block.attachedStatBlocks?.length)
        fidelity.push({
          name: block.name,
          message:
            "References a stat block without an exact-name attachment; review the raw source.",
        });
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
    report: {
      source,
      sourceUrl: KIBBLES_V23_URL,
      version: "2.3",
      scope: snapshot.scope,
      rawCount: snapshot.blocks.length,
      keptCount: spells.length,
      detectedHeaders: snapshot.detectedHeaders,
      pdfPages: snapshot.pdfPages,
      pdfSha256: snapshot.sha256,
      license: "CC-BY-4.0",
      licenseEvidence: snapshot.licenseEvidence,
      attribution:
        "Includes content from Kibbles’ Casting Compendium by KibblesTasty Homebrew LLC and available at https://www.kthomebrew.com/krd. Kibbles’ Casting Compendium is licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0) available at https://creativecommons.org/licenses/by/4.0/legalcode. Adapted from version 2.3 into OpenFray’s schema; line wrapping and display formatting changed. Includes Wall of Blood from So Many Spells by somanyrobots, licensed CC-BY-4.0 and available at https://www.gmbinder.com/share/-NMZq9u_rDyV_XD5YTxf; retain that document’s commissioned-spell credits. This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.",
      withheld,
      fidelity,
      separatelyCredited,
      omittedParatext: snapshot.blocks
        .filter((block) => block.omittedParatext?.length)
        .map((block) => ({ name: block.name, text: block.omittedParatext })),
      unattachedStatBlocks: snapshot.unattachedStatBlocks ?? [],
      specializations: snapshot.blocks.map((block) => ({
        name: block.name,
        header: block.header,
      })),
      pageConvention:
        "Physical PDF page numbers, starting at 1; these can differ from printed book pagination.",
      publishable: false,
      blockers: [
        "Review all spell boundaries, tables, summon stat blocks, and chapter cutoffs against the source.",
        "Resolve withheld entries and unattached stat blocks; review missing class assignments and source-defined psionic rules.",
        "Candidates are display-only; structured attacks, saves, damage, and scaling are not inferred.",
        "Confirm edition and attribution packaging, including separately credited content; art is excluded.",
        "Console registration, shipped JSON, and credits require separate publishing authorization.",
      ],
      validation: validateSpellDataset(spells),
    },
  };
}
