export interface PoeModifierRoll {
    id: string;
    text: string;
    value: number;
    min: number;
    max: number;
}

export interface PoeModifier {
    id: string;
    type: 'prefix' | 'suffix' | 'implicit' | 'enchant' | 'unique';
    tier?: number;
    name?: string;
    isCrafted?: boolean;
    isFractured?: boolean;
    tags: string[];
    lines: string[];
    rolls: PoeModifierRoll[];
}

export interface PoeItem {
    itemClass: string;
    rarity: string;
    name: string;
    baseType: string;
    modifiers: PoeModifier[];
    rawText: string;
}

export function parsePoeItemText(text: string): PoeItem | null {
    if (!text) return null;
    const lines = text
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== 'Searing Exarch Item' && l !== 'Eater of Worlds Item');
    if (lines.length < 5) return null;

    const itemClassMatch = lines[0].match(/Item Class:\s*(.*)/);
    const rarityMatch = lines[1].match(/Rarity:\s*(.*)/);

    if (!itemClassMatch || !rarityMatch) return null;

    const itemClass = itemClassMatch[1];
    const rarity = rarityMatch[1];

    let name = '';
    let baseType = '';

    // The 3rd line might be name, 4th might be baseType if rare.
    // We'll just grab everything up to the first '--------'
    const firstDividerIndex = lines.indexOf('--------');
    if (firstDividerIndex === -1) return null;

    if (firstDividerIndex - 2 >= 2) {
        name = lines[2];
        baseType = lines[3];
    } else {
        name = lines[2];
        baseType = lines[2];
    }

    const modifiers: PoeModifier[] = [];

    // Parse explicit modifiers starting from `{ Prefix/Suffix ... }`
    let currentMod: PoeModifier | null = null;

    for (let i = firstDividerIndex; i < lines.length; i++) {
        const line = lines[i];

        // Check if new modifier
        // Alternatively, just matching '{ Prefix Modifier "Flaring" (Tier: 1) — Damage, Physical, Attack — 8% Increased }'
        if (line.startsWith('{') && line.includes('Modifier')) {
            let type: PoeModifier['type'] = 'implicit';
            if (line.includes('Prefix')) type = 'prefix';
            else if (line.includes('Suffix')) type = 'suffix';
            else if (line.includes('Enchant')) type = 'enchant';
            else if (line.includes('Unique')) type = 'unique';

            const tierMatch = line.match(/Tier:\s*(\d+)/i);
            const tier = tierMatch ? parseInt(tierMatch[1], 10) : undefined;

            const nameMatch = line.match(/"([^"]+)"/);
            const modName = nameMatch ? nameMatch[1] : undefined;

            // Extract tags
            const tagsMatch = line.match(/—\s*(.*?)\s*(?:—|\})/);
            let tags: string[] = [];
            if (tagsMatch && tagsMatch[1]) {
                tags = tagsMatch[1].split(',').map((s) => s.trim());
            }

            const isCrafted = line.includes('Crafted');
            const isFractured = line.includes('Fractured');

            currentMod = {
                id: `mod-${Math.random().toString(36).substr(2, 9)}`,
                type,
                tier,
                name: modName,
                isCrafted,
                isFractured,
                tags,
                lines: [],
                rolls: [],
            };
            modifiers.push(currentMod);
            continue;
        }

        if (currentMod && !line.startsWith('--------') && !line.startsWith('{')) {
            currentMod.lines.push(line);
            // Look for ranges: e.g. 39(34-47) or 159(155-169) or -20(-25-50)
            const rangeRegex =
                /([+-]?\d+(?:\.\d+)?)\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*-\s*([+-]?\d+(?:\.\d+)?)\s*\)/g;
            let match;
            while ((match = rangeRegex.exec(line)) !== null) {
                const val = parseFloat(match[1]);
                let min = parseFloat(match[2]);
                let max = parseFloat(match[3]);

                // flip min/max if min > max
                // items such as progenesis have modifiers like this which break the calculation
                // 17(20-10)% reduced Charges per use

                if (min > max) {
                    [min, max] = [max, min];
                }

                currentMod.rolls.push({
                    id: `roll-${Math.random().toString(36).substr(2, 9)}`,
                    text: match[0],
                    value: val,
                    min,
                    max,
                });
            }
        } else if (line.startsWith('--------')) {
            currentMod = null; // Next block might be implicit or explicit or influence
        }
    }

    return {
        itemClass,
        rarity,
        name,
        baseType,
        modifiers,
        rawText: text,
    };
}
