# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import html
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

BASE = "https://kpogl.wikidot.com"
CANDIDATE_SHA256 = "29e55aa8d3671deaee20f68d12e69fca05c79b46095aebd1769b23cccf17abd6"


def normalized(text):
    """Compare spelling and punctuation variants without changing original source names."""
    return re.sub("[^a-z0-9]", "", text.lower())


def cached_page(path, directory):
    """Cache public wiki provenance leads without sending local spell content to the server."""
    if not re.fullmatch(r"/(?:publication:deep-magic-for-5th-edition(?:/p/[23])?|spell:[a-z0-9-]+)", path):
        raise ValueError("Unexpected public source path")
    file = directory / (hashlib.sha256(path.encode()).hexdigest() + ".html")
    if file.exists():
        return file.read_text(encoding="utf-8")
    request = Request(BASE + path, headers={"User-Agent": "OpenFray-source-review/1.0"})
    with urlopen(request, timeout=45) as response:
        if response.geturl().split("/")[2] != "kpogl.wikidot.com":
            raise ValueError("Unexpected redirect")
        content = response.read().decode("utf-8")
    if 'id="page-content"' not in content:
        raise ValueError("Missing wiki page content")
    file.write_text(content, encoding="utf-8")
    return content


def spell_links(content):
    """Recover spell-page identities from the publication index rather than guessing URLs."""
    body = content.split('id="page-content"', 1)[1]
    return [(html.unescape(re.sub("<[^>]+>", "", name)), path)
            for path, name in re.findall(r'<a[^>]+href="(/spell:[a-z0-9-]+)"[^>]*>(.*?)</a>', body, re.S)]


def page_tags(content):
    """Retain the community wiki's literal tags as unverified provenance leads."""
    match = re.search(r'<div class="page-tags">(.*?)</div>', content, re.S)
    if not match:
        return []
    return [html.unescape(tag) for tag in re.findall(r'/system:page-tags/tag/([^"#]+)', match[1])]


def review_spell(args):
    """Record cached provenance tags without granting or interpreting publication permission."""
    spell, paths, directory = args
    result = {"id": spell["id"], "name": spell["name"], "status": "unverified-community-provenance"}
    if len(paths) != 1:
        return {**result, "paths": paths, "error": "No unique publication-index match"}
    path = paths[0]
    try:
        content = cached_page(path, directory)
        return {**result, "url": BASE + path, "tags": page_tags(content),
                "htmlSha256": hashlib.sha256(content.encode()).hexdigest()}
    except Exception as error:
        return {**result, "url": BASE + path, "error": str(error)}


def main():
    """Gather bounded community provenance leads for the pinned 2020 candidate set."""
    parser = argparse.ArgumentParser(description="Gather unverified Deep Magic spell provenance leads.")
    parser.add_argument("candidates")
    parser.add_argument("output")
    args = parser.parse_args()
    content = Path(args.candidates).read_bytes()
    if hashlib.sha256(content).hexdigest() != CANDIDATE_SHA256:
        raise ValueError("Candidate snapshot changed")
    spells = json.loads(content)
    output = Path(args.output)
    cache = output / "wiki-cache"
    cache.mkdir(parents=True, exist_ok=True)
    names = {}
    for suffix in ["", "/p/2", "/p/3"]:
        for name, path in spell_links(cached_page("/publication:deep-magic-for-5th-edition" + suffix, cache)):
            names.setdefault(normalized(name), set()).add(path)
            names.setdefault(normalized(path.split(":", 1)[1]), set()).add(path)
    jobs = []
    for spell in spells:
        name = re.sub(r"\s*\((?:Reaction|Deep Magic)\)$", "", spell["name"], flags=re.I)
        paths = names.get(normalized(name), set()) or names.get(normalized(spell["id"].split(":", 1)[1]), set())
        jobs.append((spell, sorted(paths), cache))
    results = []
    with ThreadPoolExecutor(max_workers=2) as pool:
        for result in pool.map(review_spell, jobs):
            results.append(result)
            print(f"{len(results)}/{len(spells)} provenance leads: {result['name']}", flush=True)
    report = {"publishable": False, "approvedCount": 0, "candidateSha256": CANDIDATE_SHA256,
              "notice": "Community tags are source leads, not publisher licensing evidence.", "candidates": results}
    (output / "provenance-leads.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    failures = sum("error" in result for result in results)
    print(f"Finished: {len(results)} candidates, {failures} unresolved fetch or identity errors; zero approvals")


if __name__ == "__main__":
    main()
