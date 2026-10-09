// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import {
  prepareSoManySpells,
  SO_MANY_SPELLS_URL,
} from "../src/compendium/soManySpells.ts";
import { prepareGmBinderLibrary } from "./lib/prepare-gmbinder-spells.ts";

await prepareGmBinderLibrary({
  name: "So Many Spells",
  root: "output/so-many-spells-preparation",
  url: SO_MANY_SPELLS_URL,
  command: "prepare:so-many-spells",
  prepare: prepareSoManySpells,
});
