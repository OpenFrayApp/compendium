// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import {
  prepareStdsSpells,
  STDS_URL,
} from "../src/compendium/spellsThatDontSuck.ts";
import { prepareGmBinderLibrary } from "./lib/prepare-gmbinder-spells.ts";

await prepareGmBinderLibrary({
  name: "Spells That Don’t Suck",
  root: "output/spells-that-dont-suck-preparation",
  url: STDS_URL,
  command: "prepare:stds-spells",
  prepare: prepareStdsSpells,
});
