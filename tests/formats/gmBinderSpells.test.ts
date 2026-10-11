// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import { describe, expect, it } from 'vitest'
import { extractGmBinderSpells } from '../../src/formats/gmBinderSpells.ts'
import { stdsHtml as page, spellHeading as heading } from '../helpers/directSpellFixtures.ts'

describe('GM Binder spell extraction', () => {
  it('removes advice, executable content, decoration, and document commentary at the shared interface', () => {
    const html = page(`<style>Decorative style</style><section>${heading('Sanitized')}
      <p>Only <strong>rules</strong> remain.</p><script>Executable content</script><img alt="Decorative art" src="never-fetch.png">
      <div class="footnote">Decorative footnote</div><div class="column-break">Column decoration</div>
      <blockquote><p>Design advice</p></blockquote></section>`)
    const result = extractGmBinderSpells(html, [])
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0].text).toBe('Only **rules** remain.')
    expect(result.blocks[0].removedAdvice).toEqual(['Design advice'])
    expect(result.licenseEvidence).toContain('Creative Commons Attribution 4.0 International')
  })
  it('preserves nested stat blocks and tables while omitting advice panels', () => {
    const html = page(`<section>${heading('Summon Test', '3rd-level conjuration (ritual)')}
      <p>You summon a spirit.</p><table><tr><th>Roll</th><th>Result</th></tr><tr><td>1</td><td>Cold <em>or</em> fire</td></tr></table>
      <blockquote><p>GM advice that must not ship.</p></blockquote>
      <blockquote><h3>Spirit</h3><p><strong>Armor Class</strong> 14</p><p><strong>Hit Points</strong> 30</p><h4>Attack</h4><p>Hit: 1d6 damage.</p></blockquote></section>`)
    const result = extractGmBinderSpells(html, [])
    expect(result.blocks[0].text).toContain(
      '| Roll | Result |\n| --- | --- |\n| 1 | Cold _or_ fire |'
    )
    expect(result.blocks[0].text).toContain('**Hit Points** 30')
    expect(result.blocks[0].text).not.toContain('GM advice')
    expect(result.blocks[0].removedAdvice).toEqual(['GM advice that must not ship.'])
  })

  it('uses document order across page breaks instead of truncating a spell to its HTML section', () => {
    const html =
      page(`<div class="phb"><section>${heading('First')}<p>Beginning.</p></section><div class="pageNumber">99</div></div>
      <div class="phb"><p>Continued rules.</p><section>${heading('Second', 'evocation cantrip')}<p>Separate rules.</p></section></div>`)
    const result = extractGmBinderSpells(html, [])
    expect(result.blocks[0].text).toBe('Beginning.\n\nContinued rules.')
    expect(result.blocks[1].header).toBe('evocation cantrip')
    expect(result.blocks[1].text).toBe('Separate rules.')
  })

  it('attaches exact named summon stat blocks even when their printed placement differs', () => {
    const html = page(`<section>${heading('Animal')}<p>It uses the Animal Spirit stat block.</p>
      <blockquote><h2>Animal Spirit</h2><p><em>Medium Beast</em></p><p>Armor Class 12. Hit Points 25.</p><p>Animal-only rules.</p></blockquote>
      <blockquote><h2>Golem Spirit</h2><p><em>Medium Construct</em></p><p>Armor Class 14. Hit Points 35.</p><p>Golem-only rules.</p></blockquote>
      ${heading('Golem')}<p>It uses the Golem Spirit stat block.</p>
      ${heading('Other')}<p>Unrelated rules.</p>
      <blockquote><h2>Corpse Puppet</h2><p><em>Medium Undead</em></p><p>Armor Class 13. Hit Points 15.</p><p>Puppet-only rules.</p></blockquote>
      ${heading('Puppets')}<p>Use the Corpse Puppet stat block below.</p></section>`)
    const result = extractGmBinderSpells(html, [])
    const text = (name: string) => result.blocks.find((spell) => spell.name === name)!.text
    expect(text('Animal')).toContain('Animal-only rules.')
    expect(text('Animal')).not.toContain('Golem-only rules.')
    expect(text('Golem')).toContain('Golem-only rules.')
    expect(text('Puppets')).toContain('Puppet-only rules.')
    expect(text('Other')).toBe('Unrelated rules.')
  })

  it('does not discard later spells nested beneath a stat block section by GM Binder', () => {
    const html = page(`<section>${heading('First')}<p>It uses the Spirit stat block.</p>
      <blockquote><section><h2>Spirit</h2><p><em>Medium Beast</em></p><p>Armor Class 12. Hit Points 20.</p>
      <section><h3>Actions</h3><p>Stat block action.</p><section>${heading('Later')}<p>Later spell rules.</p></section></section></section></blockquote></section>`)
    const result = extractGmBinderSpells(html, [])
    expect(result.blocks).toHaveLength(2)
    for (const block of result.blocks) {
      expect(block.header).toBe('2nd-level evocation')
      expect(block.fields).toEqual({
        Classes: 'Sorcerer, Wizard',
        'Casting Time': '1 action',
        Range: '60 feet',
        Components: 'V, S, M (a pearl (worth 100 gp))',
        Duration: 'Concentration, 1 minute'
      })
    }
    expect(result.blocks.find((spell) => spell.name === 'First')!.text).toContain(
      'Stat block action.'
    )
    expect(result.blocks.find((spell) => spell.name === 'First')!.text).not.toContain(
      'Later spell rules.'
    )
    expect(result.blocks.find((spell) => spell.name === 'Later')!.text).toBe('Later spell rules.')
  })
})
