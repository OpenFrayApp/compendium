# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone
#
# Extract the Tome of Beasts (1st volume, Kobold Press, © 2016 Open Design, OGL 1.0a)
# bestiary into structured per-creature blocks, the intermediate consumed by
# scripts/ingest-tob1.ts.
#
#   pip install pymupdf
#   python scripts/tob1.py "Tome of Beasts.pdf" tob1-blocks.json
#
# LICENSE: ToB 1's OGC declaration (p.4) opens "monster names, descriptions, monster
# statistics, and monster abilities"; Product Identity is the generic "proper names
# (characters, place names, new deities, etc.), … sidebars, and trade dress" — it does
# NOT reserve whole creature categories the way ToB 3 does, so PI exclusions here are
# per-creature *named unique individuals* (Demon Lords, the Shadow Fey rulers, named
# devils — see EXCLUDE), cross-checked against Open5e's "tob" set.
#
# FORMAT — ToB 1 is its own layout; the ToB 2/3 filters do NOT transfer. The stat block
# is SegoeUI in a two-column page with PI flavor in VerdigrisMVBProText, but:
#   * most creature NAMES are HelveticaNeue-BlackCond ~11pt (a few are HelveticaNeue-Bold);
#     ToB 3 uses SegoeUI-Bold. These are not Segoe, so we keep that face explicitly.
#   * SECTION headers (ACTIONS / REACTIONS / LEGENDARY ACTIONS / LAIR ACTIONS) are
#     CovingtonCond ~14.8pt (ToB 3 uses Biondi) — NOT CovingtonCond-Bold (page running
#     header) nor Covington-SC700 (the decorative drop-cap title banner);
#   * body / ability values are plain SegoeUI (ToB 3 uses SegoeUI-Semilight);
#   * a trait/action NAME is SegoeUI-BoldItalic; the size/type line is SegoeUI-Italic in
#     lowercase 2014 form ("Large undead, chaotic evil").
#
# DELUXE creatures (the named bosses + the Shadow Fey court) print their name ONLY in the
# Covington-SC700 banner — drop-cap glyphs scattered across the page, unreconstructable in
# reading order. For those we anchor on the stat block anyway (every real size/type line is
# immediately followed by "Armor Class") and recover the name from the PDF bookmark TOC,
# matching the banner's letter-set to the right TOC entry on that page.
#
# The PDF is NOT committed; it's supplied at ingest time.

import json
import re
import sys

import fitz  # pymupdf

# A real size/type line: "Large undead, chaotic evil", "Medium swarm of Tiny beasts,
# unaligned". re.I because 2014 stat blocks lowercase the type.
TYPES = "Aberration|Beast|Celestial|Construct|Dragon|Elemental|Fey|Fiend|Giant|Humanoid|Monstrosity|Ooze|Plant|Undead"
SIZE = re.compile(rf"^(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+(Swarm of\s+\w+\s+\w+|{TYPES})\b[^,]*,", re.I)
SECTIONS = {"ACTIONS", "BONUS ACTIONS", "REACTIONS", "LEGENDARY ACTIONS", "MYTHIC ACTIONS", "LAIR ACTIONS", "VILLAIN ACTIONS"}
FIELD = re.compile(r"^(Armor Class|Hit Points|Speed|Saving Throws|Skills|Damage Vulnerabilities|Damage Resistances|Damage Immunities|Condition Immunities|Senses|Languages|Challenge|Proficiency Bonus)\b")
NAME_FONTS = ("HelveticaNeue-BlackCond", "HelveticaNeue-Bold")

# Product Identity creatures to exclude wholesale — named unique individuals (proper
# names, ToB 1 PI). Cross-checked against Open5e's "tob" set, which independently omits
# them. A legal call worth a maintainer sanity-check.
EXCLUDE = [
    "AKYISHIGAL, DEMON LORD",   # Demon Lord of Cockroaches — NOT "Spawn of Akyishigal" (OGC)
    "ALQUAM, DEMON LORD",       # Demon Lord of Night
    "CAMAZOTZ, DEMON LORD",     # Demon Lord of Bats and Fire
    "MECHUITI, DEMON LORD",     # Demon Lord of Apes
    "QORGETH, DEMON LORD",      # Demon Lord of the Devouring Worm
    "MAMMON",                   # an arch-devil (named individual)
    "TOTIVILLUS",               # Scribe of Hell (named devil)
    "LORD OF THE HUNT",         # Shadow Fey court ruler
    "MOONLIT KING",             # Shadow Fey court ruler
    "QUEEN OF NIGHT AND MAGIC",
    "QUEEN OF WITCHES",
    "RIVER KING",
    "SNOW QUEEN",
    "BEAR KING",                # named individual
    "AVATAR OF BOREAS",         # avatar of a god (proper name / new deity)
    "EMPEROR OF THE GHOULS",    # named individual
]


def is_pi(name):
    u = name.upper().replace("’", "'")
    return any(k in u for k in EXCLUDE)


def letterset(s):
    return "".join(sorted(c for c in s.lower() if c.isalnum()))


PDF = sys.argv[1] if len(sys.argv) > 1 else "Tome of Beasts.pdf"
OUT = sys.argv[2] if len(sys.argv) > 2 else "tob1-blocks.json"
doc = fitz.open(PDF)

BOLD, ITALIC = 16, 2

# TOC (bookmarks) → creature names per printed page, dropping the A–Z section markers and
# front-matter so only real entries remain. Used to name the deluxe/banner creatures.
_TOC_SKIP = {"contents", "credits", "introduction", "tome of beasts", "appendix", "index", "open game license"}
toc_by_page = {}
for _lvl, _name, _pg in doc.get_toc():
    n = _name.strip()
    if len(n) <= 1 or n.lower() in _TOC_SKIP:
        continue
    toc_by_page.setdefault(_pg, []).append(n)


def banner_name(page, col_left, size_y, pg):
    """Recover a deluxe creature's name. The Covington-SC700 banner is unreconstructable
    in reading order (scattered drop-caps), so match its letter-set to a TOC entry on
    this page; fall back to the lone TOC entry, else a cleaned glyph dump."""
    mid = page.rect.width / 2
    glyphs = []
    for blk in page.get_text("dict")["blocks"]:
        for ln in blk.get("lines", []):
            for s in ln["spans"]:
                if s["font"].startswith("Covington-SC700") and s["text"].strip() and s["bbox"][1] < size_y - 2:
                    glyphs.append((s["bbox"][1], s["bbox"][0], s["text"]))
    cands = toc_by_page.get(pg, [])
    if glyphs:
        glyphs.sort()
        bands = [[glyphs[0]]]  # cluster into title bands by vertical gap
        for g in glyphs[1:]:
            if g[0] - bands[-1][-1][0] > 28:
                bands.append([])
            bands[-1].append(g)
        for band in reversed(bands):  # nearest above the stat block first
            target = letterset("".join(g[2] for g in band))
            for c in cands:
                if letterset(c) == target:
                    return c.upper()
    if len(cands) == 1:
        return cands[0].upper()
    return ""  # unresolved — reported, never silently mislabeled


def page_lines(page):
    """Stat-block lines only, in column reading order. Per line: `t`, the bold-italic
    trait/action name `bi`, first-span font `f`, `x`, `top`."""
    mid = page.rect.width / 2
    rows = []
    for blk in page.get_text("dict")["blocks"]:
        for ln in blk.get("lines", []):
            spans = ln["spans"]
            if not spans:
                continue
            text = "".join(s["text"] for s in spans).strip()
            if not text:
                continue
            f0, s0 = spans[0]["font"], spans[0]["size"]
            keep = (
                "Segoe" in f0                                   # the stat block
                or f0 in NAME_FONTS                             # the creature name
                or (f0 == "CovingtonCond" and 14 < s0 < 16 and text.upper() in SECTIONS)
            )
            if not keep:
                continue  # drops Verdigris (PI flavor), Covington-SC700 banner, page furniture
            bi = ""  # leading bold-italic run = a trait/action name
            for s in spans:
                if (s["flags"] & BOLD) and (s["flags"] & ITALIC):
                    bi += s["text"]
                else:
                    break
            rows.append({"t": text, "bi": bi, "f": f0, "x": round(ln["bbox"][0]), "top": round(ln["bbox"][1])})
    left = sorted([r for r in rows if r["x"] < mid], key=lambda r: r["top"])
    right = sorted([r for r in rows if r["x"] >= mid], key=lambda r: r["top"])
    return left + right


def printed_no(page):
    return page.number + 1


pages = [i for i in range(doc.page_count) if any(SIZE.match(l["t"]) for l in page_lines(doc[i]))]
lo, hi = min(pages), max(pages)

stream = []
for i in range(lo, hi + 1):
    for l in page_lines(doc[i]):
        l["pg"] = printed_no(doc[i])
        l["pageidx"] = i
        stream.append(l)


def join(a, b):
    if a.endswith("-") and re.search(r"[a-z]-$", a) and b[:1].islower():
        return a[:-1] + b
    return (a + " " + b).strip() if a else b


def entries(rows):
    """Group lines into named trait/action entries; a `bi` line starts a new one."""
    out = []
    for r in rows:
        if r["bi"]:
            name = r["bi"].strip().rstrip(".").strip()
            rest = r["t"][len(r["bi"]):].strip() if r["t"].startswith(r["bi"]) else r["t"]
            out.append({"name": name, "text": rest})
        elif out:
            out[-1]["text"] = join(out[-1]["text"], r["t"])
    return out


# A real stat block's size/type line is immediately followed by "Armor Class …". That
# test (not a fragile "all-caps line above") both rejects in-prose size mentions and lets
# the deluxe/banner creatures — whose name isn't in the line above — anchor too.
anchors = [k for k, l in enumerate(stream) if SIZE.match(l["t"]) and k + 1 < len(stream) and FIELD.match(stream[k + 1]["t"])]
blocks, excluded, unnamed = [], [], []
for ai, a in enumerate(anchors):
    prev = stream[a - 1] if a else None
    if prev and prev["f"] in NAME_FONTS and not re.search(r"[a-z]", prev["t"]):
        name = prev["t"].strip()
    else:  # deluxe / banner creature — recover the name from the TOC
        page = doc[stream[a]["pageidx"]]
        name = banner_name(page, stream[a]["x"] < page.rect.width / 2, stream[a]["top"], stream[a]["pg"])
        if not name:
            unnamed.append((stream[a]["pg"], stream[a]["t"]))
            continue
    if is_pi(name):
        excluded.append(name)
        continue
    end = anchors[ai + 1] - 1 if ai + 1 < len(anchors) else len(stream)
    body = stream[a:end]
    # body[0] is the size/type anchor line — always header, even where the book typeset
    # it in the trait-name face (e.g. Adult Flame Dragon's line is SegoeUI-BoldItalic).
    h = 1
    while h < len(body) and not body[h]["bi"] and body[h]["t"].upper() not in SECTIONS:
        h += 1
    header = [l["t"] for l in body[:h]]
    rest, sec, sects, trait_rows = body[h:], None, {}, []
    for l in rest:
        u = l["t"].upper()
        if u in SECTIONS:
            sec = "Actions" if u == "ACTIONS" else u.title()
            sects.setdefault(sec, [])
            continue
        (sects[sec] if sec else trait_rows).append(l)
    blocks.append({
        "name": name,
        "sourcePage": stream[a]["pg"],
        "header": header,
        "traits": entries(trait_rows),
        "sections": {k: entries(v) for k, v in sects.items()},
    })

json.dump(blocks, open(OUT, "w"), ensure_ascii=False)
print(f"pages idx {lo}..{hi} | {len(blocks)} OGC creature blocks → {OUT}")
print(f"excluded {len(excluded)} Product Identity entries: {sorted(set(excluded))}")
if unnamed:
    print(f"UNRESOLVED {len(unnamed)} anchors with no name: {unnamed}")
