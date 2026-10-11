// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { Spell } from '../../src/schema/spell.ts'
import {
  approveReferenceSpells,
  REFERENCE_SPELL_APPROVALS,
  referenceSpellApprovalsFor,
  type ReferenceSpellApproval
} from '../../src/compendium/referenceSpellPublication.ts'

const SPELL: Spell = {
  id: 'test:spell',
  name: 'Test Spell',
  source: 'test',
  level: 1,
  school: 'Evocation',
  castingTime: '1 action',
  range: '60 feet',
  components: { verbal: true, somatic: true, material: false },
  duration: 'instantaneous',
  concentration: false,
  ritual: false,
  text: 'A reference card.'
}

/** Create an approval for a synthetic snapshot without relying on ignored local artifacts. */
function approvalFor(content: string): ReferenceSpellApproval {
  return {
    source: 'test',
    preparation: 'test',
    file: 'test.json',
    count: 1,
    edition: '5.0',
    sha256: createHash('sha256').update(content).digest('hex'),
    acceptedWarningIds: []
  }
}

/** Pin synthetic bytes for gate testing without changing or renewing any production approval. */
function syntheticApproval(
  content: string,
  approval: ReferenceSpellApproval
): ReferenceSpellApproval {
  return { ...approval, sha256: createHash('sha256').update(content).digest('hex') }
}

describe('reference-only publication approvals', () => {
  it.each(REFERENCE_SPELL_APPROVALS)('retains every publication gate for $source', (approval) => {
    expect(() => approveReferenceSpells('[]', approval)).toThrow('Snapshot changed')
    const spells = Array.from({ length: approval.count }, (_, index) => ({
      ...SPELL,
      id: `${approval.source}:fixture-${index}`,
      source: approval.source
    }))
    const content = JSON.stringify(spells)
    const synthetic = syntheticApproval(content, approval)
    expect(approveReferenceSpells(content, synthetic)).toEqual(
      spells.map((spell) => ({ ...spell, edition: '5.0' }))
    )
    expect(() => approveReferenceSpells(content + ' ', synthetic)).toThrow('Snapshot changed')
    for (const changed of [
      spells.slice(1),
      [{ ...spells[0], source: 'unreviewed' }, ...spells.slice(1)],
      [{ ...spells[0], edition: '5.0' }, ...spells.slice(1)],
      [{ ...spells[0], mechanics: { attackRoll: true } }, ...spells.slice(1)]
    ]) {
      const changedContent = JSON.stringify(changed)
      expect(() =>
        approveReferenceSpells(changedContent, syntheticApproval(changedContent, approval))
      ).toThrow('scope changed')
    }
    const warned = JSON.stringify([
      { ...spells[0], components: { ...SPELL.components, material: true } },
      ...spells.slice(1)
    ])
    expect(() => approveReferenceSpells(warned, syntheticApproval(warned, approval))).toThrow(
      'Unaccepted validation finding'
    )
    for (const id of approval.acceptedWarningIds) {
      const accepted = JSON.stringify([
        { ...spells[0], id, components: { ...SPELL.components, material: true } },
        ...spells.slice(1)
      ])
      expect(approveReferenceSpells(accepted, syntheticApproval(accepted, approval))).toHaveLength(
        approval.count
      )
      const otherFinding = JSON.stringify([
        { ...spells[0], id, concentration: true, duration: '1 round' },
        ...spells.slice(1)
      ])
      expect(() =>
        approveReferenceSpells(otherFinding, syntheticApproval(otherFinding, approval))
      ).toThrow('Unaccepted validation finding')
    }
  })

  it('limits publication to six explicitly reviewed snapshots', () => {
    expect(REFERENCE_SPELL_APPROVALS.map((approval) => approval.count)).toEqual([
      35, 503, 295, 181, 179, 90
    ])
    expect(new Set(REFERENCE_SPELL_APPROVALS.map((approval) => approval.source)).size).toBe(6)
    expect(REFERENCE_SPELL_APPROVALS.flatMap((approval) => approval.acceptedWarningIds)).toEqual([
      'kobold-press-wz:zymurgic-aura',
      'kibblestasty-casting-compendium-v2.3:bile-beam'
    ])
  })

  it('selects only an approved source and rejects unknown or empty selections', () => {
    expect(referenceSpellApprovalsFor()).toBe(REFERENCE_SPELL_APPROVALS)
    expect(referenceSpellApprovalsFor('kobold-press-deepm')).toEqual([REFERENCE_SPELL_APPROVALS[1]])
    expect(() => referenceSpellApprovalsFor('unreviewed')).toThrow('No reference spell approval')
    expect(() => referenceSpellApprovalsFor('')).toThrow('No reference spell approval')
  })

  it('pins Deep Magic 2020 as a 503-card manual-only 2014-edition library', () => {
    expect(referenceSpellApprovalsFor('kobold-press-deepm')[0]).toMatchObject({
      count: 503,
      edition: '5.0',
      acceptedWarningIds: [],
      sha256: '12b17d8c76deb0d6169b5ae5d46c5a7f98f205870ba64df464f85efc1bd9d0c7'
    })
  })

  it('accepts validated reference cards and rejects changes after approval', () => {
    const content = JSON.stringify([SPELL])
    const approval = approvalFor(content)
    expect(approveReferenceSpells(content, approval)).toEqual([{ ...SPELL, edition: '5.0' }])
    expect(REFERENCE_SPELL_APPROVALS.every((entry) => entry.edition === '5.0')).toBe(true)
    expect(() => approveReferenceSpells(content + ' ', approval)).toThrow('Snapshot changed')
    expect(() => approveReferenceSpells(content, { ...approval, count: 2 })).toThrow(
      'scope changed'
    )
  })

  it.each([
    { source: 'different' },
    { edition: '5.0' as const },
    { mechanics: { attackRoll: true } }
  ])('rejects changed publication scope: %s', (change) => {
    const content = JSON.stringify([{ ...SPELL, ...change }])
    expect(() => approveReferenceSpells(content, approvalFor(content))).toThrow('scope changed')
  })

  it('rejects unaccepted findings and accepts only the documented material warning', () => {
    const content = JSON.stringify([
      { ...SPELL, components: { ...SPELL.components, material: true } }
    ])
    const approval = approvalFor(content)
    expect(() => approveReferenceSpells(content, approval)).toThrow('Unaccepted validation')
    expect(
      approveReferenceSpells(content, {
        ...approval,
        acceptedWarningIds: ['test:spell']
      })
    ).toHaveLength(1)
    const invalid = JSON.stringify([
      {
        ...SPELL,
        concentration: true,
        duration: 'Concentration, up to 1 minute'
      }
    ])
    expect(() => approveReferenceSpells(invalid, approvalFor(invalid))).toThrow(
      'Unaccepted validation'
    )
  })
})
