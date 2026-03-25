import { describe, it, expect } from 'vitest';
import { parsePoeItemText } from './poe-parser';

const axeText = `Item Class: Two Hand Axes
Rarity: Rare
Vengeance Spawn
Vaal Axe
--------
Two Handed Axe
Quality: +20% (augmented)
Physical Damage: 617-1077 (augmented)
Critical Strike Chance: 5.00%
Attacks per Second: 1.39 (augmented)
Weapon Range: 1.3 metres
--------
Requirements:
Level: 72
Str: 158
Dex: 76
Int: 48
--------
Sockets: R-R-R-R-R-R 
--------
Item Level: 85
--------
8% increased Explicit Physical Modifier magnitudes (enchant)
--------
{ Implicit Modifier — Attack }
25% chance to Maim on Hit
(Maimed enemies have 30% reduced Movement Speed)
--------
{ Prefix Modifier "Flaring" (Tier: 1) — Damage, Physical, Attack  — 8% Increased }
Adds 39(34-47) to 75(72-84) Physical Damage
{ Prefix Modifier "Tyrannical" (Tier: 2) — Damage, Physical, Attack  — 8% Increased }
159(155-169)% increased Physical Damage
{ Prefix Modifier "Dictator's" (Tier: 1) — Damage, Physical, Attack  — 8% Increased }
75(75-79)% increased Physical Damage
+194(175-200) to Accuracy Rating
{ Suffix Modifier "of Fame" (Tier: 3) — Attack, Speed }
21(20-22)% increased Attack Speed
{ Suffix Modifier "of the Conquest" (Tier: 1) }
Skills fire an additional Projectile
{ Master Crafted Suffix Modifier "of Craft" — Damage, Physical  — 8% Increased }
+35(31-35)% to Physical Damage over Time Multiplier
--------
Warlord Item`;

describe('poe-parser', () => {
  it('correctly parses the Vaal Axe example', () => {
    const item = parsePoeItemText(axeText);
    expect(item).not.toBeNull();
    if (!item) return;

    expect(item.itemClass).toBe('Two Hand Axes');
    expect(item.rarity).toBe('Rare');
    expect(item.name).toBe('Vengeance Spawn');
    expect(item.baseType).toBe('Vaal Axe');

    // Expected modifiers:
    // 1. Implicit
    // 2. Prefix Flaring (2 stats)
    // 3. Prefix Tyrannical
    // 4. Prefix Dictator's (2 stats)
    // 5. Suffix of Fame
    // 6. Suffix of the Conquest (no ranges)
    // 7. Master Crafted Suffix
    expect(item.modifiers.length).toBe(7);

    const flaring = item.modifiers.find(m => m.name === 'Flaring');
    expect(flaring).toBeDefined();
    expect(flaring?.tier).toBe(1);
    expect(flaring?.type).toBe('prefix');
    expect(flaring?.rolls.length).toBe(2);
    if (flaring && flaring.rolls.length === 2) {
      expect(flaring.rolls[0].value).toBe(39);
      expect(flaring.rolls[0].min).toBe(34);
      expect(flaring.rolls[0].max).toBe(47);
      
      expect(flaring.rolls[1].value).toBe(75);
      expect(flaring.rolls[1].min).toBe(72);
      expect(flaring.rolls[1].max).toBe(84);
    }
    
    // Check crafted modifier
    const crafted = item.modifiers.find(m => m.name === 'of Craft');
    expect(crafted).toBeDefined();
    expect(crafted?.rolls.length).toBe(1);
    expect(crafted?.rolls[0].value).toBe(35);
  });

  const hhText = `Item Class: Belts
Rarity: Unique
Headhunter
Leather Belt
--------
Quality (Life and Mana Modifiers): +20% (augmented)
--------
Requirements:
Level: 40
--------
Item Level: 85
--------
{ Implicit Modifier — Life  — 20% Increased }
+37(25-40) to maximum Life
--------
{ Unique Modifier — Damage }
26(20-30)% increased Damage with Hits against Rare monsters
{ Unique Modifier }
When you Kill a Rare monster, you gain its Modifiers for 60 seconds
{ Unique Modifier — Life  — 20% Increased }
+54(50-60) to maximum Life
{ Unique Modifier — Attribute }
+51(40-55) to Strength
{ Unique Modifier — Attribute }
+45(40-55) to Dexterity
--------
"A man's soul rules from a cavern of bone, learns and
judges through flesh-born windows. The heart is meat.
The head is where the Man is."
- Lavianga, Advisor to Kaom`;

  it('correctly parses Unique items like Headhunter', () => {
    const item = parsePoeItemText(hhText);
    expect(item).not.toBeNull();
    if (!item) return;

    expect(item.rarity).toBe('Unique');
    expect(item.name).toBe('Headhunter');
    
    const uniqueMods = item.modifiers.filter(m => m.type === 'unique');
    expect(uniqueMods.length).toBe(5);
    
    const implicitMods = item.modifiers.filter(m => m.type === 'implicit');
    expect(implicitMods.length).toBe(1);
    expect(implicitMods[0].rolls[0].value).toBe(37);
    
    // Check first unique mod
    expect(uniqueMods[0].rolls[0].value).toBe(26);
    expect(uniqueMods[0].rolls[0].min).toBe(20);
    expect(uniqueMods[0].rolls[0].max).toBe(30);

    // Check unique mod with no rolls
    expect(uniqueMods[1].rolls.length).toBe(0);
  });

  const ventorText = `Item Class: Rings
Rarity: Unique
Ventor's Gamble
Gold Ring
--------
Requirements:
Level: 65
--------
Item Level: 85
--------
{ Implicit Modifier — Drop }
6(6-15)% increased Rarity of Items found
--------
{ Unique Modifier — Life }
+9(0-60) to maximum Life
{ Unique Modifier — Elemental, Fire, Resistance }
+42(-25-50)% to Fire Resistance
{ Unique Modifier — Elemental, Cold, Resistance }
-20(-25-50)% to Cold Resistance
{ Unique Modifier — Elemental, Lightning, Resistance }
+43(-25-50)% to Lightning Resistance
{ Unique Modifier — Drop }
21(-40-40)% increased Rarity of Items found
{ Unique Modifier — Mana }
10(-15-15)% increased Mana Reservation Efficiency of Skills
--------
In a blaze of glory,
An anomaly defying all odds
The "unkillable" beast met the divine
And Ventor met his latest trophy.`;

  it('correctly parses negative range items like Ventors Gamble', () => {
    const item = parsePoeItemText(ventorText);
    expect(item).not.toBeNull();
    if (!item) return;

    expect(item.rarity).toBe('Unique');
    expect(item.name).toBe("Ventor's Gamble");
    
    const uniqueMods = item.modifiers.filter(m => m.type === 'unique');
    expect(uniqueMods.length).toBe(6);
    
    // Check fire res mod
    expect(uniqueMods[1].rolls[0].value).toBe(42);
    expect(uniqueMods[1].rolls[0].min).toBe(-25);
    expect(uniqueMods[1].rolls[0].max).toBe(50);

    // Check cold res mod
    expect(uniqueMods[2].rolls[0].value).toBe(-20);
    expect(uniqueMods[2].rolls[0].min).toBe(-25);
    expect(uniqueMods[2].rolls[0].max).toBe(50);
  });
});

