# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone
#
# Extract the SRD 5.2.1 spell descriptions from WotC's official CC-BY PDF into
# structured per-spell blocks, the intermediate consumed by
# scripts/ingest-srd52-spells.ts.
#
#   pip install pdfplumber
#   python scripts/extract-srd52-spells-pdf.py SRD_CC_v5.2.1.pdf srd52-spell-blocks.json
#
# Approach: the spell list is a two-column layout. Crop each page L/R and pull text
# with extract_text(use_text_flow=True) — the content-stream order is the true
# reading order, which avoids the row-bucketing that reorders bold names/headings
# into the prose (the artifact the bestiary extractor fights with a font pass). Each
# spell is a Name line immediately followed by a "Level N <School> (classes)" or
# "<School> Cantrip (classes)" header; the four field lines (Casting Time / Range /
# Components / Duration) follow, then the description. Spells are segmented by those
# header lines. The PDF is downloaded separately (not committed):
# https://www.dndbeyond.com/srd

import json
import re
import sys

import pdfplumber

# ── table reconstruction ─────────────────────────────────────────────────────
# The PDF's borderless lookup tables (Confusion's d10, Scrying's save modifiers, …)
# flatten into a run of prose. Using reading-order words *with positions*
# (extract_words(use_text_flow=True)), a row key/value is the cell reached across a
# big column gap, which prose word-spacing never is. We rebuild those as markdown
# and splice them back into the flattened text by matching their reading-order run.
GAP = 6.0
DIE = re.compile(r"^\d{1,3}(?:[–-]\d{1,3})?$")
NDM = re.compile(r"^\d*d\d+$")
SIGNED = re.compile(r"^[+\-−]\d+$")


def _dehyph(s):
    return re.sub(r"(\w)- (\w)", r"\1\2", s)


def _norm(s):
    return re.sub(r"\s+", " ", _dehyph(s)).replace("−", "-").strip()


def _gap_after(ws, i):
    if i + 1 < len(ws) and abs(ws[i + 1]["top"] - ws[i]["top"]) <= 3:
        return ws[i + 1]["x0"] - ws[i]["x1"]
    return -1


def _nl(ws, i):
    return i == 0 or abs(ws[i]["top"] - ws[i - 1]["top"]) > 3


def _md(headers, rows):
    out = [f"| {headers[0]} | {headers[1]} |", "| --- | --- |"]
    out += [f"| {k} | {v} |" for k, v in rows]
    return "\n".join(out)


def _dice_tables(ws):
    """(flat, markdown) for each d10/d100-style table: short key, big gap, cell text."""
    out, n, i = [], len(ws), 0
    while i < n:
        if NDM.match(ws[i]["text"]) and _nl(ws, i):
            h = i
            j = h + 1
            while j < n and not (DIE.match(ws[j]["text"]) and _gap_after(ws, j) > GAP and _nl(ws, j)):
                j += 1
            if j < n and ws[h]["x0"] - ws[j]["x0"] <= 14:
                col1 = ws[j]["x0"]
                vbound = col1 + 14
                header = ws[h : j]
                rows, bad = [], False
                while j < n and DIE.match(ws[j]["text"]) and _gap_after(ws, j) > GAP and _nl(ws, j) and abs(ws[j]["x0"] - col1) <= 12:
                    k = j + 1
                    while k < n and not (ws[k]["x0"] < vbound and _nl(ws, k)):
                        k += 1
                    cell = ws[j + 1 : k]
                    # a value holding its own keyed pair (multi-column layout) → bail
                    if any(DIE.match(cell[t]["text"]) and _gap_after(cell, t) > GAP for t in range(len(cell))):
                        bad = True
                    rows.append((ws[j]["text"], _norm(" ".join(w["text"] for w in cell))))
                    j = k
                if not bad and len(rows) >= 2:
                    h0 = _norm(" ".join(w["text"] for w in header))
                    parts = h0.split(" ", 1)
                    flat = _norm(" ".join(w["text"] for w in ws[h:j]))
                    out.append((flat, _md((parts[0], parts[1] if len(parts) > 1 else ""), rows)))
                    i = j
                    continue
        i += 1
    return out


def _stage_tables(ws):
    """(flat, markdown) for "Stage / <col>" lookup tables (Control Weather's
    Precipitation / Temperature / Wind): a "Stage" header across a gap, then rows whose
    key is a small stage number set across a gap from the condition text."""
    out, n, i = [], len(ws), 0
    while i < n:
        if ws[i]["text"] == "Stage" and _nl(ws, i) and _gap_after(ws, i) > GAP:
            h = i
            vbound = ws[h + 1]["x0"] - 3  # x of the condition column; keys sit left of it
            header = (ws[h]["text"], ws[h + 1]["text"])  # "Stage", "Condition"
            j, rows = h + 2, []
            while j < n and DIE.match(ws[j]["text"]) and _nl(ws, j) and ws[j]["x0"] < vbound and _gap_after(ws, j) > GAP:
                k = j + 1
                # Cell ends at the next key (left of the condition column, new line) or when
                # the reading flow jumps UP to a different sub-column (Control Weather's Wind
                # table sits to the upper-right of Temperature). Wrapped cells only go down.
                while k < n and not ((ws[k]["x0"] < vbound and _nl(ws, k)) or ws[k]["top"] < ws[j]["top"] - 5):
                    k += 1
                rows.append((ws[j]["text"], _norm(" ".join(w["text"] for w in ws[j + 1 : k]))))
                j = k
            if len(rows) >= 2:
                out.append((_norm(" ".join(w["text"] for w in ws[h:j])), _md(header, rows)))
                i = j
                continue
        i += 1
    return out


def _modifier_tables(ws):
    """(flat, markdown) for 'label … <signed number>' tables (Scrying's save modifiers)."""
    n = len(ws)
    vals = [i for i in range(1, n) if SIGNED.match(ws[i]["text"]) and _gap_after(ws, i - 1) > GAP]
    groups = []
    for v in vals:
        if groups and v - groups[-1][-1] <= 40:
            groups[-1].append(v)
        else:
            groups.append([v])
    out = []
    for g in groups:
        if len(g) < 2:
            continue
        start = g[0]  # back up to include the "… Modifier" header (stop at a sentence end)
        while start > 0 and not ws[start - 1]["text"].endswith("."):
            start -= 1
        lead0 = " ".join(w["text"] for w in ws[start : g[0]])
        # Require an explicit "… Modifier" column header. Without it, a run of signed
        # numbers is something else — e.g. a summoned creature's ability mods/saves
        # ("Str 16 +3 …"), which must not be mangled into a table.
        if "Modifier" not in lead0:
            continue
        rows = []
        for idx, v in enumerate(g):
            lo = g[idx - 1] + 1 if idx > 0 else start
            label = re.sub(r"^.*?\bModifier\b\s*", "", _norm(" ".join(w["text"] for w in ws[lo:v])))
            rows.append((label, ws[v]["text"].replace("−", "-")))
        flat = _norm(" ".join(w["text"] for w in ws[start : g[-1] + 1]))
        lead = _norm(" ".join(w["text"] for w in ws[start : g[0]]))  # the leading "… Modifier" header
        m = re.match(r"(.*?)\s*(\S+\s+Modifier)\b", lead)
        headers = (m.group(1), m.group(2)) if m else ("", "Modifier")
        out.append((flat, _md(headers, rows)))
    return out


SCHOOLS = "Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation"
HEADER = re.compile(rf"^(?:Level [1-9]|(?:{SCHOOLS}) Cantrip)\b.*\(", re.I)
FIELD = re.compile(r"^(Casting Time|Range|Components|Duration):\s*(.*)$")
NOISE = re.compile(r"^(System Reference Document 5\.2(?:\.\d)? ?\d*|\d+ System Reference Document 5\.2(?:\.\d)?|Spell Descriptions|Spell List)$")

PDF = sys.argv[1] if len(sys.argv) > 1 else "SRD_CC_v5.2.1.pdf"
OUT = sys.argv[2] if len(sys.argv) > 2 else "srd52-spell-blocks.json"
pdf = pdfplumber.open(PDF)

spell_pages = [i for i, p in enumerate(pdf.pages) if "Casting Time:" in (p.extract_text() or "")]
lo, hi = min(spell_pages), max(spell_pages)


def printed_page(page):
    t = page.extract_text() or ""
    m = re.search(r"(\d+)\s+System Reference Document 5\.2|System Reference Document 5\.2\s+(\d+)", t)
    return int(m.group(1) or m.group(2)) if m else None


def col_lines(page, a, b):
    crop = page.crop((page.width * a, 0, page.width * b, page.height))
    out = []
    for line in (crop.extract_text(use_text_flow=True) or "").replace("−", "-").splitlines():
        line = line.strip()
        if line and not NOISE.match(line):
            out.append(line)
    return out


# Clean line stream across the spell section, in reading order (L then R per page).
stream = []
for idx in range(lo, hi + 1):
    page = pdf.pages[idx]
    pg = printed_page(page)
    for a, b in [(0, 0.5), (0.5, 1.0)]:
        for line in col_lines(page, a, b):
            stream.append({"t": line, "pg": pg})

# A spell starts at each header line; its name is the line just above it.
header_ix = [i for i, s in enumerate(stream) if HEADER.match(s["t"])]


def join_cont(lines):
    """Join hyphen-split and wrapped lines into one string."""
    out = ""
    for l in lines:
        if out.endswith("-") and re.search(r"[a-z]-$", out) and l[:1].islower():
            out = out[:-1] + l
        else:
            out = (out + " " + l).strip() if out else l
    return out


spells = []
for k, hi_ix in enumerate(header_ix):
    name = stream[hi_ix - 1]["t"].strip()
    src_pg = stream[hi_ix]["pg"]
    end = header_ix[k + 1] - 1 if k + 1 < len(header_ix) else len(stream)  # up to next spell's name line
    body_lines = [s["t"] for s in stream[hi_ix:end]]

    # Header (Level/School/classes) wraps until the line containing the closing ")".
    hdr, i = [], 0
    while i < len(body_lines):
        hdr.append(body_lines[i])
        if ")" in body_lines[i]:
            i += 1
            break
        i += 1
    header_line = join_cont(hdr)

    # Four field lines (Casting Time / Range / Components / Duration). A label's value
    # is on the same line or, for narrow columns, wraps onto following lines. Duration
    # is the last field and single-valued, so once we have its value the body begins.
    fields = {}
    cur = None
    while i < len(body_lines):
        m = FIELD.match(body_lines[i])
        if m:
            cur = m.group(1)
            fields[cur] = m.group(2)
            i += 1
        elif cur == "Duration":
            if not fields["Duration"]:  # value wrapped onto this line
                fields["Duration"] = body_lines[i]
                i += 1
            break  # body follows the Duration value
        elif cur:
            fields[cur] = (fields[cur] + " " + body_lines[i]).strip()
            i += 1
        else:
            break
    text = join_cont(body_lines[i:])

    spells.append({
        "name": name,
        "sourcePage": src_pg,
        "header": header_line,
        "castingTime": fields.get("Casting Time", ""),
        "range": fields.get("Range", ""),
        "components": fields.get("Components", ""),
        "duration": fields.get("Duration", ""),
        "text": text,
    })

# ── splice reconstructed tables into the spell prose ─────────────────────────
def spell_norm_index(spells):
    return [(s, _norm(s["text"])) for s in spells]


tables = []
for idx in range(lo, hi + 1):
    page = pdf.pages[idx]
    for a, b in [(0, 0.5), (0.5, 1.0)]:
        ws = page.crop((page.width * a, 0, page.width * b, page.height)).extract_words(use_text_flow=True)
        tables += _dice_tables(ws) + _modifier_tables(ws) + _stage_tables(ws)

spliced = 0
# Normalize each spell once and apply every matching table — a spell with several tables
# (Control Weather) keeps all of them; re-normalizing per table would re-flatten the rest.
for s in spells:
    norm = _norm(s["text"])
    hit = False
    for flat, md in tables:
        if len(flat) >= 12 and flat in norm:
            norm = norm.replace(flat, f"\n\n{md}\n\n", 1)
            spliced += 1
            hit = True
    if hit:
        s["text"] = norm

json.dump(spells, open(OUT, "w"), ensure_ascii=False)
print(f"pages idx {lo}..{hi} | {len(spells)} spells, {spliced} tables → {OUT}")
