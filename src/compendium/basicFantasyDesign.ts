// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Nicola Mustone

import type { Creature } from "../schema/creature.ts";
import { basicFantasyCreatures } from "./basicFantasy.ts";
import { actionDamage, multiattackDamage } from "./crestimate.ts";

const groups = [
  {
    slugs: [
      "ant-large",
      "ant-huge",
      "ant-giant",
      "bee-giant",
      "bee-giant-queen",
      "beetle-giant-oil",
      "beetle-giant-tiger",
      "beetle-giant-bombardier",
      "cave-locust-giant",
      "fly-giant",
      "water-termite-giant",
    ],
    role: "skirmisher",
    comparables: ["Giant Centipede", "Giant Wasp", "Giant Fire Beetle"],
  },
  {
    slugs: [
      "cattle",
      "aurochs",
      "bison",
      "woolly-rhino",
      "titanothere",
      "ostrich",
      "emu",
      "bear-cave",
    ],
    role: "brute",
    comparables: ["Draft Horse", "Boar", "Brown Bear"],
  },
  {
    slugs: [
      "dinosaur-deinonychus",
      "dinosaur-stegosaurus",
      "pterodactyl",
      "giant-hawk",
      "normal-roc",
      "large-roc",
    ],
    role: "skirmisher",
    comparables: ["Pteranodon", "Giant Eagle", "Roc"],
  },
  {
    slugs: [
      "fish-giant-bass",
      "fish-giant-catfish",
      "fish-giant-piranha",
      "huge-barracuda",
      "giant-barracuda",
      "leech-giant",
      "sea-serpent",
      "squid-giant-male",
      "squid-giant-female",
      "whale-narwhal",
      "whale-sperm",
    ],
    role: "brute",
    comparables: ["Giant Octopus", "Hunter Shark", "Killer Whale"],
  },
  {
    slugs: ["giant-cyclops", "giant-mountain"],
    role: "artillery",
    comparables: ["Hill Giant", "Stone Giant", "Frost Giant"],
  },
  {
    slugs: [
      "golem-amber",
      "golem-bone",
      "golem-bronze",
      "golem-wood",
      "living-statue-crystal",
      "living-statue-iron",
      "living-statue-stone",
    ],
    role: "brute",
    comparables: ["Animated Armor", "Stone Golem", "Iron Golem"],
  },
  {
    slugs: [
      "basilisk-greater",
      "salamander-frost",
      "salamander-lightning",
      "salamander-sand",
    ],
    role: "controller",
    comparables: ["Basilisk", "Salamander", "Fire Elemental"],
  },
  {
    slugs: [
      "blood-rose",
      "hangman-tree",
      "assassin-vine",
      "jelly-green",
      "rot-grub",
      "yellow-mold",
    ],
    role: "controller",
    comparables: ["Violet Fungus", "Gray Ooze", "Shambling Mound"],
  },
  {
    slugs: [
      "lizard-giant-draco",
      "lizard-giant-gecko",
      "lizard-giant-tuatara",
      "lizard-giant-horned-chameleon",
      "large-monitor-lizard",
      "huge-monitor-lizard",
      "giant-monitor-lizard",
      "rhagodessa-giant",
      "caecilia-giant",
      "snake-spitting-cobra",
      "spider-giant-tarantula",
      "shrew-common-giant",
      "shrew-venomous-giant",
    ],
    role: "controller",
    comparables: ["Giant Lizard", "Giant Spider", "Giant Venomous Snake"],
  },
  {
    slugs: [
      "barkling",
      "common-lizard-man",
      "subterranean-lizard-man",
      "caveman",
      "orc",
      "rock-baboon",
      "urgoblin",
      "trollwife",
      "trollkin-infant",
      "trollkin-juvenile",
      "trollkin-adolescent",
    ],
    role: "brute",
    comparables: ["Goblin Warrior", "Warrior Infantry", "Troll"],
  },
  {
    slugs: [
      "nixie",
      "pixie",
      "alicorn",
      "parrot-or-cockatiel",
      "box-turtle",
      "snapping-turtle",
    ],
    role: "skirmisher",
    comparables: ["Sprite", "Rat", "Unicorn"],
  },
  {
    slugs: ["zombraire", "skeletaire"],
    role: "artillery",
    comparables: ["Skeleton", "Zombie", "Priest Acolyte"],
  },
];

const roles: Record<string, string> = {
  "giant-cyclops": "brute",
  "giant-mountain": "brute",
  "bee-giant-queen": "brute",
  "beetle-giant-oil": "controller",
  "beetle-giant-bombardier": "artillery",
  "cave-locust-giant": "controller",
  "water-termite-giant": "controller",
  "dinosaur-stegosaurus": "brute",
  "lizard-giant-gecko": "skirmisher",
  "lizard-giant-tuatara": "brute",
  barkling: "skirmisher",
  "subterranean-lizard-man": "controller",
  "box-turtle": "brute",
  "snapping-turtle": "brute",
};

const signatures: Record<string, string> = {
  "yellow-mold": "Triggered six-round poisonous spores",
  barkling: "Scent-tracking armored pack hunter",
  "bear-cave": "Two-claw hug and one final turn at 0 HP",
  "blood-rose": "Befuddling fragrance and occupied blood-draining canes",
  "cave-locust-giant": "Leaping bump, shriek, or disabling spit",
  "beetle-giant-oil": "Adjacent blistering oil spray",
  "beetle-giant-bombardier": "Hot gas with a two-turn cooldown",
  "bee-giant": "Sting that kills the attacking bee",
  "bee-giant-queen": "Immobile queen with a Bite instead of Sting",
  "basilisk-greater": "Petrifying gaze and poisonous skin",
  "caecilia-giant": "Natural-19-or-20 swallow of Small prey",
  "fish-giant-bass": "Natural-20 swallow",
  "fish-giant-catfish": "Poisoned fins spread across separate targets",
  "lizard-giant-gecko": "Full-Speed ceiling climbing",
  "lizard-giant-tuatara": "Cold-tolerant claw-and-shearing-bite routine",
  "lizard-giant-draco": "Three-round descending glide",
  "lizard-giant-horned-chameleon":
    "Tongue capture followed by an automatic Bite",
  "rhagodessa-giant":
    "Two adhesive legs capture one victim for automatic biting",
  "hangman-tree":
    "Four stationary nooses that remain occupied while strangling",
  "assassin-vine": "Entanglement followed by crushing",
  "leech-giant": "Attached blood drain",
  "golem-amber": "Invisible detection and Lightning absorption",
  "golem-bone": "Four weapons or two heavy weapons",
  "golem-bronze": "Molten contact retaliation",
  "living-statue-iron": "Trapping metal weapons",
  "living-statue-stone": "Two at-will lava sprays",
  "salamander-frost": "Five attacks inside a Cold aura",
  "salamander-lightning": "Twin bites inside a Lightning aura",
  "salamander-sand": "Petrification and congealing stone",
  "spider-giant-tarantula": "Venomous contagious dance",
  "snake-spitting-cobra": "Blinding spit or venomous Bite",
  "water-termite-giant": "Stunning spray and hull feeding",
  "whale-sperm": "Underwater stunning sound beam",
  pixie: "Invisibility that persists during attacks",
  nixie: "Ten-nixie cooperative charm",
  urgoblin: "Regenerating hobgoblin-like warrior",
  "giant-cyclops": "Single heavy hit, poor rock aim, and yearly curse",
};

const departures: Record<string, string> = {
  cattle:
    "Retain AC 14, Speed 50, and 1d4 Headbutt or 2d4 Trample. The source 2+2 HD becomes 2d10+2. No knockdown or free attack.",
  aurochs:
    "Retain AC 16, Speed 50, and 1d4 Headbutt or 2d4 Trample. Durability is 3d10+6 (22 HP), compared with source 3d8 (13.5 average). No knockdown or free attack.",
  bison:
    "Retain AC 16, Speed 50, and 1d4 Headbutt or 2d4 Trample. Durability is 4d10+8 (30 HP), compared with source 4d8 (18 average). No knockdown or free attack.",
  barkling:
    "Retain alternate Bite and Dagger, chain mail, scent tracking, and 30-foot Darkvision. Remove invented Pack Tactics. Unarmored AC and Speed remain explicit.",
  "basilisk-greater":
    "Retain poison bite, toxic skin, reflection risk, and petrifying gaze. Instant death becomes 3d6 Poison damage with a repeated-save condition. Petrification requires two failed saves. Toxic skin lasts a fixed 24 hours, replacing 2d20 hours.",
  "bear-cave":
    "Restore two claws, a bite, and the conditional 2d8 hug. Restore the shared bear rule allowing one final turn at 0 HP. Grapple escape is a 2024 addition.",
  "beetle-giant-oil":
    "Retain bite plus adjacent spray against different targets. No invented Fire vulnerability or daily spray cap. Blister penalties become Poisoned for 24 hours; Cure Wounds can remove the effect instead of healing.",
  "beetle-giant-bombardier":
    "Retain 1d6 Bite, 2d6 hot gas, five daily sprays, and two intervening turns between sprays. The gas is a 2024 Cone with a Dexterity save.",
  "bee-giant":
    "Retain the lethal-to-the-bee sting. Victim death on a failed save becomes 2d6 Poison damage and a repeated-save Poisoned condition.",
  "bee-giant-queen":
    "The source queen has separate 2-HD statistics, no movement, and a 1d8 Bite. It is not a scaled worker and cannot sting.",
  "blood-rose":
    "Use the middle source variant: two canes and roughly 3-HD durability. Retain 1d6 canes, 1d6 ongoing blood drain, and 30-foot fragrance. Use Charmed with safe approach and damage counterplay instead of compelled helplessness. Round 2 can sustain two drains (7 average total). Source Speed 1 becomes 5 for grid play.",
  "caecilia-giant":
    "Restore 1d8 Bite and swallowing only on a natural 19 or 20 against Small prey. No invented grapple requirement. Swallowed damage remains 1d8, typed Acid in 2024, with an explicit damage-based escape.",
  "fish-giant-bass":
    "Restore 1d6 Bite, natural-20 swallow, and 2d4 digestion damage. Medium-or-smaller eligibility expresses dwarf-sized prey. No invented grab-before-swallow action.",
  "fish-giant-catfish":
    "Restore Bite plus two poisoned fins against three distinct targets. Remove invented swallowing. Pain becomes Disadvantage, with repeat saves and no stacking.",
  "cave-locust-giant":
    "Restore alternate Bite, nonlethal bump, and disabling spit, 60-foot leap, and shriek. Source one-spit-per-encounter becomes recovery on a Short or Long Rest; disabling duration becomes 1 minute with repeat saves. No armor-bypassing attack roll.",
  "dinosaur-deinonychus":
    "Restore one 1d8 Bite, Speed 50, and no invented claw routine. Source pack hunting becomes conditional Pack Tactics.",
  "dinosaur-stegosaurus":
    "Restore Tail plus Bite against different targets, or one Trample instead. No knockdown rider or two-tail routine.",
  "lizard-giant-draco":
    "Restore Speed 40, Fly 70, and 1d10 Bite. It can glide for three rounds without ascending. No invented climbing speed.",
  "lizard-giant-gecko":
    "Distinct 1d8 Bite and full-Speed wall and ceiling climbing. No generic Giant Lizard substitution.",
  "lizard-giant-tuatara":
    "Distinct two-claw and 2d6 shearing-bite routine. Source cold tolerance becomes Cold Resistance, a deliberate stronger mechanical interpretation.",
  "lizard-giant-horned-chameleon":
    "Tongue or Bite, never a combined Multiattack. Retain 20-foot tongue and a subsequent automatic-hit 2d6 Bite while held. The Bite uses its action rather than adding a free extra attack. Add 2024 grapple escape. Horns are not weapons.",
  "large-monitor-lizard":
    "Retain 1d4 Bite, 60-foot straight-line sprint, and slow venom ticking once per minute. Use a fixed 10-minute duration with repeat saves instead of 2d4 turns.",
  "huge-monitor-lizard":
    "Retain 1d6 Bite, straight-line sprint, and fast 1d6-per-round venom. Use 1 minute with repeat saves instead of 2d4 rounds.",
  "giant-monitor-lizard":
    "Distinct venomous 1d8 Bite and sprint. Source instant death becomes 3d6 initial Poison damage plus repeated-save ongoing venom.",
  "common-lizard-man":
    "Restore one weapon attack, +1 weapon damage, armored Speed 20, unarmored Speed 30/Swim 40, and 10-minute breath holding.",
  "subterranean-lizard-man":
    "Restore Medium body, two claws and a bite, camouflage, and stench. Remove invented Heavy Spear. Stench becomes repeated-save Poisoned; source mammal-only targeting broadens to living creatures.",
  "giant-cyclops":
    "Use the requested display name Cyclop. Restore one club or one rock, armored Speed 20, poor rock aim, and yearly Bestow Curse. The -2 rock penalty becomes conditional Disadvantage, preserving correct 2024 attack math.",
  "giant-mountain":
    "Retain one 7d6 weapon or 4d6 rock attack, armored Speed 40, and 240-foot maximum rock range. CR 7 trades 189 HP against 24.5 routine damage, compared with the SRD Stone Giant’s 126 HP and two 22.5-damage club attacks. This is a 2024 BFRPG adaptation, not a copy of Creature Codex.",
  "golem-amber":
    "Restore two claws and one bite, Speed 60, invisible detection without broader Truesight, conditional tracking Advantage, and healing one-third of Lightning damage. AC is reduced from 21 to 19 with 85 HP, below the CR 5 median; source weapon gating becomes ordinary 2024 defenses.",
  "golem-bone":
    "Restore four one-handed weapon attacks or two two-handed attacks. Source magic-only weapon gating becomes physical Resistance. Berserk uses the 2024 Bloodied/d6 idiom instead of a cumulative percentage.",
  "golem-bronze":
    "Restore one 3d10 Fist plus 1d10 heat, Speed 80, and retaliatory 2d6 molten spray. Physical Resistance replaces magic-only weapon gating; its below-median HP compensates for AC 20 and contact retaliation. Berserk uses a Bloodied/d6 check.",
  "golem-wood":
    "Restore one 1d8 Fist and Speed 40. Fire vulnerability and Disadvantage on Fire saves replace source per-die and -2 penalties. Low Dexterity expresses stiff movement.",
  "hangman-tree":
    "Restore immobility and four limbs against different targets, each with 1d6 ongoing strangling damage. No mobile-tree template. Four held targets take 14 average damage per round, but their occupied limbs cannot make additional attacks.",
  "assassin-vine":
    "Retain 5-foot movement, 30-foot nonvisual sensing, entangle, and ongoing 1d8 crushing. Use grapple escape instead of a class-specific save. Strangle Vine is an explicit source alias, not a second creature.",
  "leech-giant":
    "Retain 1d6 Bite and attached 1d6-per-round blood drain. Add a difficult action-based detachment option; source requires killing the leech.",
  "living-statue-crystal":
    "Retain two 1d6 fists. Remove invented crystal fragility: the source explicitly says it has no special powers.",
  "living-statue-iron":
    "Retain two 1d8 fists, Speed 10, and trapping nonmagical metal weapons. Add a difficult action-based recovery option before destruction.",
  "living-statue-stone":
    "Restore two at-will 2d6 lava sprays at 5-foot reach. Remove invented fists and the twice-daily spray cap.",
  "rhagodessa-giant":
    "Restore two non-damaging adhesive legs, one victim, separate escape checks, and an automatic-hit Bite against prey held before the turn began. The Bite uses its action rather than adding a free extra attack. Captives gain conditional Advantage with Light melee weapons. It cannot bite uncaptured prey or climb ceilings.",
  "normal-roc":
    "Restore two Talons and one Bite. Carry prey only after both talons hit; carried prey is not attacked. Source 150-pound capacity becomes Small prey, using the smaller end of 2024 size categories.",
  "large-roc":
    "Restore two Talons and one Bite. Carry prey only after both talons hit; carried prey is not attacked. Source carrying weight becomes Large prey eligibility.",
  "squid-giant-male":
    "Restore eight 1d4 tentacles and conditional 1d10 Bite. Two hits establish a grip and permit biting; 2024 size and tentacle limits replace per-75-pound grip arithmetic. Ink is a Short-Rest retreat resource.",
  "squid-giant-female":
    "Restore eight 1d4 tentacles and conditional 1d12 Bite. Two hits establish a grip and permit biting; 2024 size and tentacle limits replace per-75-pound grip arithmetic. Ink is a Short-Rest retreat resource.",
  "salamander-frost":
    "Restore four claws, one bite, and 20-foot Cold aura. Source immunity excludes Cold-resistant targets from aura damage. Physical Resistance replaces magic-only weapon gating. Aura damage is not included in the estimator.",
  "salamander-lightning":
    "Retain two bites and a 20-foot Lightning aura; no invented extra bite Lightning damage. Physical Resistance replaces magic-only weapon gating. Aura damage is not included in the estimator.",
  "salamander-sand":
    "Retain one petrifying Bite, Piercing immunity, Slashing resistance, and 20-foot sand transformation. Use two-stage petrification and action-based release from congealed stone.",
  "sea-serpent":
    "Restore one 2d6 Bite and a separate 2d10 vessel-constriction action. Halving damage threshold translates the source Hardness rule.",
  "shrew-common-giant":
    "Restore Medium body, Speed 60, and two 1d6 bites. Remove invented scurry and burrowing.",
  "shrew-venomous-giant":
    "Restore Medium body, Speed 60, and two 1d6 bites. Death venom becomes bounded Poison damage and repeat saves; repeated bites do not stack the Poisoned condition.",
  "snake-spitting-cobra":
    "Retain one Bite or 5-foot blinding spit. Remove invented daily spit cap. Death venom becomes bounded Poison damage; blindness has repeat saves and Lesser Restoration recovery.",
  "spider-giant-tarantula":
    "Restore 1d8 Bite, ongoing 1d4 venom, and contagious dance. Use Disadvantage and loss of Reactions instead of -4 penalties. Secondary dancing does not spread further or cause Poison damage; repeat saves and restoration give counterplay.",
  trollwife:
    "Restore two 1d8 claws and 2d6 Bite. Regeneration becomes 5 HP per turn, compared with source 1, and retains Acid/Fire counterplay. It is weaker and less durable than the CR 5 SRD Troll.",
  "trollkin-infant":
    "Restore two claws and Bite. All ages share the same 5-HP regeneration with Acid/Fire counterplay; source regeneration does not scale with age. Use a representative source age-band body.",
  "trollkin-juvenile":
    "Restore two claws and Bite, Speed 50. All ages share 5-HP regeneration with Acid/Fire counterplay; use a representative source age-band body.",
  "trollkin-adolescent":
    "Restore two claws and Bite. All ages share 5-HP regeneration with Acid/Fire counterplay; use a representative source age-band body.",
  urgoblin:
    "Restore Medium body, one weapon, and troll-style regeneration. Remove invented Bully and Multiattack. Armor, shield, and unarmored movement are explicit.",
  "water-termite-giant":
    "Restore 5-foot stunning spray and automatic 2d4 hull feeding. No generic creature Bite or Poisoned spray. Use one representative 2-HD body and six feeding rounds before rest.",
  "whale-narwhal":
    "Restore 2d6 Tusk and Swim 60. AC reduced from 19 to 17 for the 2024 animal envelope; no invented magic horn.",
  "whale-sperm":
    "Restore one 3d20 Bite or a 50-foot underwater stunning sound beam. Remove invented Multiattack and swallowing. AC reduced from 22 to 18; sound duration is repeat-save 1 minute.",
  "yellow-mold":
    "Retain triggered once-daily 10-foot spores, 1d8 ongoing damage for six rounds, and sunlight dormancy. Remove invented initial 2d6 damage and Fire vulnerability; add repeated saves.",
  "jelly-green":
    "Retain attachment, first-round scraping, later Cold/Fire/cutting removal, corrosion, restoration cure, and sunlight destruction. Replace irreversible transformation with 1d6 ongoing Acid damage, with no invented initial damage. Direct sunlight destroys the jelly immediately. Source Speed 1 becomes 5 for grid play.",
  "rot-grub":
    "Retain 1 HP, unnoticed burrowing, two-round Fire/cutting removal, and disease-curing counterplay. Replace delayed unavoidable death with ongoing 1 Necrotic damage. Wisdom notice becomes a Perception check.",
  zombraire:
    "Remove invented Arcane Bolt and Undead Fortitude. Restore one Dagger or spell, blunt/projectile defenses, and charm/sleep/hold immunity. Select Magic Missile and Sleep as a fixed 2024 daily repertoire for the source level-2 caster.",
  skeletaire:
    "Remove invented Arcane Bolt and Bludgeoning vulnerability. Restore one Dagger or spell, edged/projectile defenses, and charm/sleep/hold immunity. Select Magic Missile and Sleep as a fixed 2024 daily repertoire; it cannot speak.",
  nixie:
    "Charm requires ten cooperating nixies. Shorten one-year charm to 24 hours with damage-triggered repeat saves. Retain daily Water Breathing; its standard 2024 24-hour duration replaces the source duration.",
  pixie:
    "Invisibility remains active during attacks, as the source explicitly requires. Remove invented spellcasting. Flight is 60 feet with source flight/rest durations.",
  alicorn:
    "Restore two clawlike hooves and Horn, Speed 70, and at-will attack-ending Invisibility. No healing or teleportation.",
  "parrot-or-cockatiel":
    "Restore alternate 1d4 Beak or Talons and Fly 100. Mimicry uses a 2024 Insight check; no conversational speech.",
  "box-turtle":
    "Retain shell, 5-foot walking, Swim 20, and 1d2 Bite. Withdrawal grants Half Cover as an explicit 2024 interpretation.",
  "snapping-turtle":
    "Retain shell, 5-foot walking, Swim 20, and 1d6 Bite. Withdrawal grants Half Cover as an explicit 2024 interpretation.",
};

export const basicFantasyCrReviewExceptions: Record<string, string> = {
  "basic-fantasy-adaptations:basilisk-greater":
    "The estimator omits the 3d6 save-based venom because its clause contains a repeat-save duration, and omits toxic contact and petrification. It also mishandles some attacks followed by ongoing prose; the source attack subtotal is recorded separately. Actual bite plus failed poison save averages 17 damage. At CR 4, AC 17 and 68 HP trade high armor against the SRD median 76 HP; staged petrification supplies control rather than instant death. Basilisk and Gorgon provide the control comparison. This discrepancy is explicitly reviewed, not waived for unrelated creatures.",
};

/** Select source-specific intent and actual 2024 comparison creatures. */
export function basicFantasyDesign(creature: Creature) {
  const slug = creature.id.split(":")[1];
  if (creature.type === "dragon") {
    const species = slug.includes("cloud")
      ? "cloud"
      : slug.includes("plains")
        ? "plains"
        : "sea";
    return {
      role: creature.legendaryResistance ? "solo" : "brute",
      signature:
        species === "cloud"
          ? "Age-gated borrowed breaths and Humanoid shape-changing"
          : species === "plains"
            ? "Fast grassland hunter with heat breath"
            : "Aquatic steam dragon without a tail attack",
      comparables:
        species === "cloud"
          ? ["Young White Dragon", "Adult White Dragon", "Adult Bronze Dragon"]
          : species === "plains"
            ? [
                "Brass Dragon Wyrmling",
                "Young Brass Dragon",
                "Adult Brass Dragon",
              ]
            : [
                "Young Bronze Dragon",
                "Adult Bronze Dragon",
                "Adult Brass Dragon",
              ],
      rationale:
        "Preserve all seven source ages, two Claws plus Bite (or breath), and Tail for land dragons only. Wyrmlings have no breath. Older ages gain source breath shapes. Body HP, AC, abilities, and CR are independently selected for 2024 encounters, not converted HD-for-HD. Adult and older blocks add 2024 Legendary Resistance and three distinct single-cost options using source attacks, locomotion, shape-changing, or selected spells. Limited-use options cannot repeat before the next turn. No invented elemental Rend damage. Breath uses Recharge 5–6 rather than source daily-HD uses and alternate-round cooldown. Cloud defaults to Cold at age 2 and adds Lightning at age 4; a different source-selected breath pair requires a separate reviewed block. Lightning is 2/Day, intentionally independent of primary recharge. Adult and older blocks select spellcasting individuals with age-gated daily repertoires, replacing probabilities and slot progression. Younger blocks are noncaster examples. Plains Adult spells stay at level 1; Ancient Cloud reaches level 6 with Disintegrate. Advanced spell damage and buffs are outside the attack-only damage ceiling. No lair actions. Breath widths use 2024 Cone geometry or a Cube for steam; these differ from source fan/cloud proportions.",
    };
  }
  if (slug.includes("-elemental-"))
    return {
      role: "brute",
      signature: slug.includes("cold")
        ? "Freezing touch, aura, and heat intolerance"
        : slug.includes("lightning")
          ? "Single strike, magnetic pull, or deafening thunderclap"
          : slug.includes("metal")
            ? "Metal affinity and water barrier"
            : "Wood affinity with Fire and Lightning weaknesses",
      comparables: ["Air Elemental", "Earth Elemental", "Fire Elemental"],
      rationale:
        "Restore one attack per action at each source summon tier: 1d12, 2d8, or 3d6. Retain material-specific conditional 1d8 damage and weaknesses without baking conditional bonuses into the roller. Reduce extreme source AC to 16/17/18 and use 2024 physical Resistance instead of magic-only weapon gating. Staff/Device/Spell bodies use 60/90/119 HP at CR 3/5/6, so high armor/resistance is offset by much lower routine damage than SRD elementals. No invented universal two-attack routine. Magnetic telekinesis becomes a bounded 20-foot pull; ignored-armor attacks become conditional Advantage.",
    };
  const group = groups.find((g) => g.slugs.includes(slug));
  if (!group)
    throw new Error(`Missing source-led design review for ${creature.id}`);
  return {
    role: roles[slug] ?? group.role,
    comparables:
      slug === "basilisk-greater"
        ? ["Basilisk", "Gorgon", "Giant Venomous Snake"]
        : slug === "dinosaur-stegosaurus"
          ? ["Triceratops", "Brown Bear", "Tiger"]
          : group.comparables,
    signature:
      signatures[slug] ??
      (creature.actions ?? [])
        .filter((a) => a.name !== "Multiattack")
        .map((a) => a.name)
        .join(" or "),
    rationale:
      departures[slug] ??
      "Retain the source single attack, movement, and lack of special attack riders. Ability scores and size-based Hit Dice are conversion choices; HP is chosen for the 2024 animal envelope. No new knockdown, grappling, or damage rider.",
  };
}

/** Measure source attack rolls without the estimator mistaking later ongoing prose for the initial hit. */
function sourceAttackDamage(creature: Creature): number {
  return multiattackDamage({
    ...creature,
    actions: creature.actions?.map((action) =>
      action.kind === "melee" || action.kind === "ranged"
        ? { ...action, text: (action.text ?? "").split("Hit:")[0] }
        : action,
    ),
  });
}

/** Price a conservative three-round dragon opening with all three damaging legendary uses. */
function dragonRounds(creature: Creature) {
  if (creature.type !== "dragon") return undefined;
  const routine = sourceAttackDamage(creature);
  const natural = (name: string) =>
    actionDamage(creature.actions?.find((action) => action.name === name));
  const legendary = creature.legendaryActions
    ? (creature.legendaryActions.perRound ?? 3) *
      natural(
        creature.actions?.some((action) => action.name === "Tail")
          ? "Tail"
          : "Claw",
      )
    : 0;
  const breath = creature.actions?.find(
    (action) => action.kind === "save" && action.name.includes("Breath"),
  );
  const opening = breath
    ? routine - natural("Bite") + actionDamage(breath)
    : routine;
  return {
    damage: [opening + legendary, routine + legendary, routine + legendary],
    assumptions:
      "Full hits and failed breath saves against one target; an opening breath replaces Bite, with no successful recharge during the next two rounds. Spellcasting damage and buffs are not included. All three Legendary Action uses are spent on attacks when available. Movement, shape-changing, and spellcasting options trade damage for utility.",
  };
}

export const basicFantasyDesignNotes = basicFantasyCreatures.map(
  (creature) => ({
    id: creature.id,
    name: creature.name,
    cr: creature.cr,
    size: creature.size,
    ...basicFantasyDesign(creature),
    sustainedAttackDamage: sourceAttackDamage(creature),
    estimatorAttackDamage: multiattackDamage(creature),
    crReviewException: basicFantasyCrReviewExceptions[creature.id],
    dragonRounds: dragonRounds(creature),
    immediateDamage: creature.actions
      ?.filter((a) => a.damage)
      .map((a) => ({
        action: a.name,
        damage: a.damage,
        estimatorDamage: actionDamage(a),
      })),
  }),
);
