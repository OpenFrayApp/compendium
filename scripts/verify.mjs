// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { spawnSync } from 'node:child_process'

if (Number(process.versions.node.split('.')[0]) !== 24) {
  console.error('Node 24 is required; see docs/verification.md')
  process.exit(1)
}

/** Run a required check and propagate launch errors, signals, and failing exit codes. */
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.error) console.error(`Cannot run ${command}: ${result.error.message}`)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(process.env.PYTHON ?? 'python3', ['scripts/test-python.py'])
if (!process.argv.includes('--python-only')) {
  run('npm', ['test'])
  run('npm', ['run', 'typecheck'])
}
