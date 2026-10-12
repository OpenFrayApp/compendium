// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Creature } from "../schema/creature.ts";
import {
  basicFantasyReview,
  type BasicFantasyReview,
} from "./basicFantasyReview.ts";

/** Reject an exclusion justified only by a 2014 counterpart or an unresolved ID. */
export function assertBasicFantasyCounterpartEditions(
  existing: Creature[],
  authored: Creature[],
  reviews: readonly BasicFantasyReview[] = basicFantasyReview,
): void {
  const byId = new Map(
    [...existing, ...authored].map((creature) => [creature.id, creature]),
  );
  for (const review of reviews) {
    if (review.status !== "counterpart") continue;
    for (const id of review.counterpartIds ?? []) {
      const counterpart = byId.get(id);
      if (!counterpart) throw new Error(`Missing counterpart: ${id}`);
      if (counterpart.edition !== "5.5")
        throw new Error(
          `2014-only counterpart cannot exclude ${review.key}: ${id}`,
        );
    }
  }
}
