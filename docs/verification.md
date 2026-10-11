# Verification

## Install

Use Node 24, npm, and Python 3.14 on macOS or Linux.
The version files declare the supported runtime lines.
`package.json` also declares the Node requirement.
The verification command rejects other Node and Python runtime lines.
Windows and older runtimes have not been verified.

Install dependencies from the repository root:

```sh
npm ci
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
npm run verify
```

`requirements.txt` pins direct and transitive Python dependencies.
PyMuPDF supplies the existing `fitz` extractors.
The SRD PDF extractors use `pdfplumber`, an explicit exception to the PyMuPDF convention.
No extractor library is replaced.
PyMuPDF currently prints a deprecation warning for `fitz`; the extractor imports remain unchanged.
OCR workflows additionally require Tesseract and its language data.
The public verification suite uses synthetic PDF text and mocked OCR, so it does not require Tesseract.

Installation can require network access.
After installation, verification needs no network, purchased PDFs, ignored review caches, or preexisting datasets.
Do not remove existing `output/`, PDFs, or review evidence to test this claim.
Use a separate checkout when checking installation isolation.

## Commands

Run commands from the repository root:

| Command                        | Checks                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `npm run verify`               | All Python suites, all TypeScript tests, and TypeScript typechecking                       |
| `npm test`                     | TypeScript tests, including offline pipeline and baseline command tests                    |
| `npm run test:python`          | Required Python dependencies and every `tests/scripts/test_*.py` suite                     |
| `npm run typecheck`            | TypeScript source, scripts, and tests                                                      |
| `npm run verify:offline`       | Original-content output bytes, counts, source identities, and publication approval records |
| `npm run format:check`         | Formatting across the eligible scope, without writing                                      |
| `npm run format -- <files...>` | Formatting only the explicitly selected eligible files                                     |
| `npm run check:prose`          | Current documentation voice checks                                                         |

`verify` stops and exits nonzero when a required check fails.
An unavailable Python interpreter or dependency stops verification with a failure.
Activate the virtual environment before running it.
Alternatively, select an interpreter explicitly:

```sh
PYTHON="$PWD/.venv/bin/python" npm run verify
```

`PYTHON` is an executable path, without flags.
It applies to `verify` and `test:python`.
Every existing npm command name remains available.
Source-specific ingest commands may still need source inputs; `verify` does not run those live workflows.

The audit baseline is 397 TypeScript tests across 31 files, 34 Python tests, and a passing typecheck.
The verification slice adds 11 TypeScript command tests: 408 tests across 35 files.
All 34 Python tests remain.
The four Khyberia extractor tests moved unchanged into `tests/scripts/test_extract_khyberia.py` for consistent discovery.
No test requirement was removed or consolidated.

## Offline example

After installation, run this example with networking disconnected:

```sh
. .venv/bin/activate
npm run verify
npm run verify:offline
work="$(mktemp -d)"
npm run ingest:waking-garden -- "$work/waking-garden-creatures.json"
npm run validate -- "$work/waking-garden-creatures.json"
```

The example writes only into a newly created temporary directory.
It emits 67 Waking Garden creature templates with zero validation errors and warnings.
It neither reads nor replaces existing `output/` datasets.
Retain or remove only the temporary directory you created after inspecting the result.

## Output baselines

[The offline baseline](../tests/fixtures/verification/offline-baseline.json) records outputs captured at revision `5fc4624` using Node 24.21.0.
Each record contains its npm command, count, source identities, and SHA-256 of the exact emitted bytes.
The baseline contains hashes and metadata, without private source text.

| Dataset                   | Records |
| ------------------------- | ------: |
| Waking Garden creatures   |      67 |
| Brood and Bloom creatures |      67 |
| Brood and Bloom spells    |      23 |
| Strong Waters spells      |      11 |

`verify:offline` runs the four existing npm ingest commands into a fresh temporary directory.
It compares their exact serialized bytes with the committed baseline.
It removes only its own temporary output directory, including after failure.
The same comparison runs within the TypeScript suite.

The baseline also records all six reference spell publication approvals.
It pins the approval module bytes and preserves each source, candidate hash, count, edition, file, preparation, and accepted-warning list.
These comparisons do not re-export reference spells or renew any approval.
A custom baseline can be compared with `node scripts/verify-offline.ts <baseline.json>`.
The normal command always uses the committed baseline.

For an intentional output change, retain the previous baseline and explain the changed bytes in source review.
Capture the changed command output in a separate temporary directory and calculate its SHA-256.
Only update baseline metadata after the applicable content or publication review.
A changed reference candidate requires renewed publication approval through its existing review process.
Do not change approval hashes to make structural cleanup pass.

## Formatting and prose scope

The formatter uses pinned Prettier and `.prettierrc.json`.
Its eligible scope is root JSON and Markdown, TypeScript source and tests, JavaScript/TypeScript scripts, verification fixtures, and this guide.
`.prettierignore` protects authored original collections, vendored schema, approval module bytes, source snapshots, legal transcripts, and published historical records.
All existing `docs/` records are excluded; this guide is explicitly included.
Python formatting is not configured.
`format` requires explicit file paths and rejects files outside its scope before writing anything.
Run it only on files changed for the current task.
Keep broad formatting changes in a separate mechanical commit.

The prose checker uses the parent workspace’s rules with repository-specific scope.
It checks root Markdown and this guide.
It excludes legal credits, the code of conduct, the entire dated changelog, and existing source-review records.
It fails on em-dash asides and reports softer patterns without failing.
Code blocks, code spans, and glossary definitions receive the same handling as the parent checker.
Other writing rules still require review against the shared and local style guides.

[The tooling debt inventory](../tests/fixtures/verification/tooling-debt.json) records existing debt at revision `5fc4624`.
That snapshot contains 82 formatting findings, 16 prose findings in `README.md`, and 10 soft rhetorical-contrast matches.
The contributor-navigation README replaces the prose findings; `check:prose` now passes.
Formatting debt remains in unchanged files; run the commands to see current findings.
The inventory does not suppress findings or alter the protected records.
Formatting and prose are separate commands; they do not block `verify` while formatting debt remains.
Run targeted formatting checks on changed eligible files:

```sh
npm run format:check -- scripts/verify.mjs docs/verification.md
```

## Limits and missing parity inputs

Passing verification establishes represented invariants and public-fixture behavior.
It grants no publication approval and does not verify every rule against its primary source.
Full-source parity requires the licensed inputs and pinned snapshots used by each source review.

This checkout does not supply:

- The SRD PDFs or cached SRD 2014 API responses.
- Purchased Tome of Beasts, Creature Codex, Tome of Heroes, Deep Magic, or Warlock source material.
- The Khyberia and Kibbles PDFs or complete extraction snapshots.
- Full GM Binder snapshots for Spells That Don’t Suck and So Many Spells.
- Open5e live responses or complete cached source snapshots.
- The six approved reference candidate datasets and their private review evidence.
- OCR language data and full-source OCR review caches.

Public tests exercise synthetic or licensed fixtures and existing approval rejection behavior.
The recorded candidate hashes can be compared by maintainers against their retained candidate bytes.
The baseline proves approval metadata and module-byte parity.
Candidate-dataset parity requires the retained candidate files.
Maintainers must reproduce affected full-source pipelines before declaring full-source parity for later cleanup.
Keep private evidence outside Git and share only sanitized counts, hashes, exit statuses, and validation findings.

The installation audit reports seven existing npm advisories: one low, one moderate, three high, and two critical.
This slice adds only pinned Prettier to npm dependencies; dependency remediation is separate work.
