// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

const RESERVED_WOTC =
  /\b(?:mordenkainen|tasha|bigby|otiluke|nystul|rary|drawmij|leomund|evard|melf|tenser|beholder|mind flayer|illithid|githyanki|githzerai|yuan-ti|vargouille)\b/i;

/** Identify potentially reserved Wizards names for conservative withholding pending source review. */
export function reservedWotcName(text: string): string | undefined {
  return RESERVED_WOTC.exec(text)?.[0];
}
