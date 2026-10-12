// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { KibblesV23Snapshot } from '../../src/compendium/sources/kibblesV23Spells.ts'

/** Build creator-licensed source HTML with specialized schools and non-SRD classes. */
export function gmBinderHtml(header = '4th-level necromancy (shadow magic)'): string {
  return `<section><h4>Test Spell</h4><p><em>${header}</em></p><hr><ul>
    <li><strong>Classes:</strong> Necromancer, Occultist, Wizard</li><li><strong>Casting Time:</strong> 1 action</li>
    <li><strong>Range:</strong> 60 feet</li><li><strong>Components:</strong> V, S</li><li><strong>Duration:</strong> 1 minute</li>
    </ul><p>If the target is in shadow, the next attack has advantage.</p></section>
    <section><h2>Credits &amp; References</h2><p>So Many Spells by somanyrobots. Creative Commons Attribution 4.0 International.</p>
    <p>System Reference Document 5.1 by Wizards of the Coast LLC.</p><p>Omega Ankh and KibblesTasty credited in Spells That Don’t Suck.</p></section>`
}

/** Build an extractor-shaped fixture with the verified newer mechanics and physical PDF provenance. */
export function kibblesSnapshot(): KibblesV23Snapshot {
  return {
    version: '2.3',
    scope: 'all-spells',
    detectedHeaders: 295,
    pdfPages: 86,
    sha256: 'a'.repeat(64),
    licenseEvidence:
      'Kibbles’ Casting Compendium by KibblesTasty Homebrew LLC. Spell text: CC-BY-4.0. No art included.',
    blocks: Array.from({ length: 295 }, (_, index) => ({
      name: index === 0 ? 'Become Stone' : index === 1 ? 'Crashing Wave' : `Fixture Spell ${index}`,
      sourcePage: (index % 86) + 1,
      header: '2nd-level transmutation (arcane, primal)',
      fields: {
        Classes: 'Druid, Spellblade, Wizard',
        'Casting Time': '1 action',
        Range: 'Self',
        Components: 'V, S',
        Duration: '1 round'
      },
      text:
        index === 0
          ? 'You gain 15 temporary hit points.'
          : index === 1
            ? 'A 15-foot cone increases to a 30 foot cone with displaced water.'
            : 'Conditional advantage stays prose.',
      removedAdvice: []
    }))
  }
}

/** Build a compact page with licensing evidence and repeated names outside the spell section. */
export function stdsHtml(body: string): string {
  return `<html><body><script>Never execute this source</script>${body}<h2>Changelog</h2><p>Not spell rules.</p>
    <h4>Test</h4><p><em>Replaced With: Other</em></p><p>Design commentary.</p>
    <section><h2>Credits &amp; References</h2><p>Omega Ankh &amp; somanyrobots. Creative Commons Attribution 4.0 International. Includes KibblesTasty spells.</p></section></body></html>`
}

/** Build a spell heading and metadata in the publisher's rendered structure. */
export function spellHeading(name: string, header = '2nd-level evocation', extra = ''): string {
  return `<h4>${name}</h4><p><em>${header}</em></p><hr><ul>
    <li><strong>Classes:</strong> Sorcerer, Wizard</li><li><strong>Casting Time:</strong> 1 action</li>
    <li><strong>Range:</strong> 60 feet</li><li><strong>Components:</strong> V, S, M (a pearl (worth 100 gp))</li>
    <li><strong>Duration:</strong> Concentration, 1 minute</li>${extra}</ul><hr>`
}
