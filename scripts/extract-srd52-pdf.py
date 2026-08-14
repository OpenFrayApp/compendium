# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone
#
# Extract the SRD 5.2.1 bestiary from WotC's official CC-BY PDF into structured
# per-creature blocks (header lines + section entries), the intermediate consumed
# by scripts/ingest-srd52.ts.
#
#   pip install pdfplumber
#   python scripts/extract-srd52-pdf.py SRD_CC_v5.2.1.pdf srd52-blocks.json
#
# Why Python: the two-column stat-block layout needs column cropping. Approach: crop
# each page into L/R columns; anchor each creature on its "AC N Initiative" line
# (name two lines above). The verbatim TEXT of the header and each section comes from
# extract_text() (which orders/dedups words correctly). The font pass (entry names are
# Optima-BoldItalic, creature names GillSans-SemiBold) only supplies the *order of
# entry names* per section; the section text is then split on those names. Blocks
# without a parsed header/page are dropped — bounding output to the Monsters A–Z
# bestiary and excluding magic-item stat blocks (e.g. the Giant Fly figurine).
# The PDF is downloaded separately (not committed): https://www.dndbeyond.com/srd

import json
import re
import sys

import pdfplumber

BI = "BoldItalic"
LABELS = {"Traits", "Actions", "Bonus Actions", "Reactions", "Legendary Actions"}
TIER = re.compile(r"^(At Will|\d+\s*/\s*Day)\b", re.I)
NOISE = re.compile(
    r"^(System Reference Document 5\.2(?:\.\d)? ?\d*|\d+ System Reference Document 5\.2(?:\.\d)?|Monsters A.Z)$"
)
# A standalone block/group heading: 1–3 Title-Case words, no punctuation. Real prose
# and spell-list lines carry commas or end in a period, so they never match.
HEADING = re.compile(r"^[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*){0,2}$")

PDF = sys.argv[1] if len(sys.argv) > 1 else "SRD_CC_v5.2.1.pdf"
OUT = sys.argv[2] if len(sys.argv) > 2 else "srd52-blocks.json"
pdf = pdfplumber.open(PDF)
ac_pages = [i for i, p in enumerate(pdf.pages) if re.search(r"AC \d+ Initiative", p.extract_text() or "")]
lo, hi = min(ac_pages), max(ac_pages)


def printed_page(page):
    t = page.extract_text() or ""
    m = re.search(r"(\d+)\s+System Reference Document 5\.2|System Reference Document 5\.2\s+(\d+)", t)
    return int(m.group(1) or m.group(2)) if m else None


def crop_text(page, a, b):
    return (page.crop((page.width * a, 0, page.width * b, page.height)).extract_text() or "").replace("−", "-")


def join(desc, line):
    if desc.endswith("-") and re.search(r"[a-z]-$", desc) and line[:1].islower():
        return desc[:-1] + line  # de-hyphenate a word split across lines
    return (desc + " " + line).strip() if desc else line


# ── Pass A: verbatim text via extract_text (correct word order) ──────────────────
# Per creature: header lines, source page, and the joined text of each section.
text_stream = []
for idx in range(lo, hi + 1):
    page = pdf.pages[idx]
    pg = printed_page(page)
    for a, b in [(0, 0.5), (0.5, 1.0)]:
        for line in crop_text(page, a, b).splitlines():
            line = line.rstrip()
            if line.strip() and not NOISE.match(line.strip()):
                text_stream.append({"t": line, "pg": pg})

ac_a = [i for i, s in enumerate(text_stream) if re.match(r"^AC \d+ Initiative", s["t"])]
records = {}
for k, ai in enumerate(ac_a):
    name = text_stream[ai - 2]["t"].strip()
    end = ac_a[k + 1] - 2 if k + 1 < len(ac_a) else len(text_stream)
    # The next creature's name (sometimes rendered twice) and group headings
    # ("Red Dragons", "Guards") sit between blocks and the fixed -2 offset leaves them
    # dangling on this creature's last section — e.g. a spell list absorbing "Grick" or
    # "Red Dragons". Trim trailing copies of the next name plus any standalone
    # heading-like line (1–3 Title-Case words, no punctuation); real prose/spell-list
    # lines end in a period or carry commas, so they're untouched.
    if k + 1 < len(ac_a):
        next_name = text_stream[ac_a[k + 1] - 2]["t"].strip()
        while end > ai:
            tail = text_stream[end - 1]["t"].strip()
            if tail == next_name or HEADING.match(tail):
                end -= 1
            else:
                break
    hdr, sec, sect_lines = [], None, {}
    for s in text_stream[ai - 1 : end]:
        if s["t"] in LABELS:
            sec = s["t"]
            sect_lines.setdefault(sec, [])
            continue
        if s["t"].strip() == name:  # a running-header copy of the creature name
            continue
        (sect_lines[sec] if sec else hdr).append(s["t"])
    sect_text = {}
    for label, lines in sect_lines.items():
        text = ""
        for l in lines:
            text = join(text, l)
        sect_text[label] = text
    records[name] = {"header": hdr, "sourcePage": text_stream[ai]["pg"], "sectionText": sect_text}


# ── Pass B: font pass → the ordered list of entry names per section ──────────────
def col_words(page, a, b):
    crop = page.crop((page.width * a, 0, page.width * b, page.height))
    rows = {}
    for w in crop.extract_words(extra_attrs=["fontname"]):
        rows.setdefault(round(w["top"] / 3), []).append(w)
    out = []
    for k in sorted(rows):
        ws = sorted(rows[k], key=lambda w: w["x0"])
        text = " ".join(w["text"] for w in ws).strip().replace("−", "-")
        if not text or NOISE.match(text):
            continue
        bi = []
        for w in ws:
            if w["fontname"].endswith(BI):
                bi.append(w["text"])
            else:
                break
        out.append({"t": text, "bi": " ".join(bi), "semib": ws[0]["fontname"].endswith("SemiBold")})
    return out


fstream = []
for idx in range(lo, hi + 1):
    page = pdf.pages[idx]
    fstream += col_words(page, 0, 0.5) + col_words(page, 0.5, 1.0)
ac_b = [i for i, s in enumerate(fstream) if re.match(r"^AC \d+ Initiative", s["t"])]

entry_names = {}
for k, ai in enumerate(ac_b):
    name = fstream[ai - 2]["t"].strip()
    end = ac_b[k + 1] - 2 if k + 1 < len(ac_b) else len(fstream)
    sec, names, last = None, {}, None
    for s in fstream[ai - 1 : end]:
        if s["t"] in LABELS:
            sec = s["t"]
            names.setdefault(sec, [])
            last = None
            continue
        if sec is None or s["semib"]:  # skip creature-name lines (this one / next)
            continue
        if s["bi"] and not TIER.match(s["bi"]) and not s["t"].startswith("Legendary Action Uses"):
            nm = re.sub(r"\.$", "", s["bi"]).strip()
            if nm and nm != last:  # ignore a duplicate-rendered copy of the header
                names[sec].append(nm)
                last = nm
    entry_names[name] = names


# ── Combine: split each section's text on its ordered entry names ────────────────
def split_entries(text, names):
    text = text.strip()
    spans = []
    pos = 0
    for nm in names:
        i = text.find(nm + ".", pos)
        if i < 0:
            i = text.find(nm, pos)
        if i < 0:
            i = text.find(nm)  # fall back to anywhere
        if i < 0:
            continue
        spans.append((i, nm))
        pos = i + len(nm)
    preamble = text[: spans[0][0]].strip() if spans else (text if not names else "")
    entries = []
    for j, (i, nm) in enumerate(spans):
        start = i + len(nm)
        stop = spans[j + 1][0] if j + 1 < len(spans) else len(text)
        body = re.sub(r"\s+([,.])", r"\1", text[start:stop].lstrip(". ").strip())
        entries.append({"name": nm, "text": body})
    return entries, preamble


# The bestiary proper starts at the "Monsters A–Z" heading; creature-shaped stat
# blocks before it are magic-item content (figurines, the Deck of Many Things) whose
# multi-column layout the crop mangles. Drop anything before that page.
bestiary_start = next(
    (printed_page(pdf.pages[i]) for i in range(lo, hi + 1) if re.search(r"Monsters A.Z", pdf.pages[i].extract_text() or "")),
    0,
)
SIZE_RE = re.compile(r"^(Tiny|Small|Medium|Large|Huge|Gargantuan)\b", re.I)
blocks = []
for name, rec in records.items():
    if not rec["sourcePage"] or rec["sourcePage"] < bestiary_start:
        continue
    if not rec["header"] or not SIZE_RE.match(rec["header"][0]):
        continue
    names = entry_names.get(name, {})
    sections, preamble = {}, {}
    for label, text in rec["sectionText"].items():
        ents, pre = split_entries(text, names.get(label, []))
        sections[label] = ents
        if pre and label == "Legendary Actions":
            preamble[label] = pre
    blocks.append(
        {"name": name, "sourcePage": rec["sourcePage"], "header": rec["header"], "sections": sections, "preamble": preamble}
    )

json.dump(blocks, open(OUT, "w"), ensure_ascii=False)
print(f"pages idx {lo}..{hi} | {len(blocks)} bestiary creatures → {OUT}")
