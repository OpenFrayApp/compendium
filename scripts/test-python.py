# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2026 Nicola Mustone

import importlib
import sys
import unittest
from pathlib import Path

if sys.version_info[:2] != (3, 14):
    sys.exit("Python 3.14 is required; see docs/verification.md")

for module in ("fitz", "pdfplumber"):
    try:
        importlib.import_module(module)
    except ImportError as error:
        sys.exit(f"Required Python dependency unavailable: {error}. Install requirements.txt")

root = Path(__file__).resolve().parents[1]
suite = unittest.defaultTestLoader.discover(str(root / "tests" / "scripts"), pattern="test_*.py")
if suite.countTestCases() == 0:
    sys.exit("No Python tests discovered")
sys.exit(0 if unittest.TextTestRunner(verbosity=2).run(suite).wasSuccessful() else 1)
