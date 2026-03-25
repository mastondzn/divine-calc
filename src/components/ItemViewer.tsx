import type { PoeItem, PoeModifierRoll, PoeModifier } from '../lib/poe-parser';

export function ItemViewer({
    item,
    selectedRolls,
    onToggleRoll,
}: {
    item: PoeItem | null;
    selectedRolls: Set<string>;
    onToggleRoll: (roll: PoeModifierRoll) => void;
}) {
    if (!item) {
        return (
            <div className="w-full h-125 flex items-center justify-center border border-zinc-800 rounded-lg bg-zinc-950/50 text-zinc-600 italic">
                No item data found
            </div>
        );
    }

    const renderModifier = (mod: PoeModifier) => {
        let textColor = 'text-[#8888FF]';
        if (mod.isCrafted) textColor = 'text-[#b8daf2]';
        if (mod.isFractured) textColor = 'text-[#A38D6D]';

        const getPercentileColor = (pct: number) => {
            if (pct < 30) return 'text-red-300/80 bg-red-500/10';
            if (pct < 70) return 'text-orange-300/80 bg-orange-500/10';
            if (pct < 95) return 'text-green-300/80 bg-green-500/10';
            return 'text-cyan-300/90 bg-cyan-500/10 font-bold';
        };

        return (
            <div key={mod.id} className="my-3 first:mt-0 relative group text-center">
                <div className="text-[11px] text-zinc-500 mb-0.5 font-sans tracking-wide">
                    {mod.isFractured ? 'Fractured ' : mod.isCrafted ? 'Crafted ' : ''}
                    {mod.type.charAt(0).toUpperCase() + mod.type.slice(1)} Modifier
                    {mod.name ? ` "${mod.name}"` : ''}
                    {mod.tier ? ` (T${mod.tier})` : ''}
                </div>

                {mod.lines.map((line, idx) => {
                    // If the line contains a roll we need to render checkboxes and interactive text
                    const rollsInLine = mod.rolls.filter((r) => line.includes(r.text));

                    if (rollsInLine.length === 0) {
                        return (
                            <div key={idx} className={`${textColor} text-[15px] leading-snug`}>
                                {line}
                            </div>
                        );
                    }

                    // We have rolls in this line, let's split the line by the rolls so we can format them
                    let remainingLine = line;
                    const segments: React.ReactNode[] = [];

                    // Simple string replacement approach for rendering parts
                    // Note: This assumes roll texts do not overlap and appear in order they are parsed.
                    // For a robust implementation, we'd split by regex matches.
                    rollsInLine.forEach((roll, rIdx) => {
                        const splitIdx = remainingLine.indexOf(roll.text);
                        if (splitIdx !== -1) {
                            const before = remainingLine.substring(0, splitIdx);
                            if (before)
                                segments.push(<span key={`text-${rIdx}-before`}>{before}</span>);

                            const isSelected = selectedRolls.has(roll.id);
                            const isFixed = roll.min === roll.max;
                            const isFractured = mod.isFractured ?? false;
                            const isDisabled = isFixed || isFractured;
                            const percentile = isFixed
                                ? 100
                                : Math.round(
                                      ((roll.value - roll.min) / (roll.max - roll.min)) * 100,
                                  );

                            segments.push(
                                <span
                                    key={roll.id}
                                    className="inline-flex items-center mx-1 align-middle"
                                >
                                    {!isDisabled && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleRoll(roll)}
                                            className="peer sr-only"
                                            id={roll.id}
                                        />
                                    )}
                                    <label
                                        htmlFor={isDisabled ? undefined : roll.id}
                                        className={`
                      inline-flex items-center px-1.5 py-0.5 rounded-md transition-all duration-200 border
                      ${
                          isDisabled
                              ? 'bg-zinc-800/50 border-zinc-700/50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 cursor-pointer'
                                : 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-500 cursor-pointer'
                      }
                    `}
                                        title={
                                            isFractured
                                                ? 'Fractured modifiers cannot be divined.'
                                                : isFixed
                                                  ? 'Mod has fixed value, cannot be divined.'
                                                  : `Current Roll: ${percentile}%`
                                        }
                                    >
                                        <span className="font-bold">{roll.value}</span>
                                        <span className="text-zinc-500 text-[10px] ml-1 tracking-tighter">
                                            ({roll.min}-{roll.max})
                                        </span>
                                        {!isFixed && (
                                            <span className={`text-[10px] ml-1.5 px-1 rounded-sm ${getPercentileColor(percentile)}`}>
                                                {percentile}%
                                            </span>
                                        )}
                                    </label>
                                </span>,
                            );

                            remainingLine = remainingLine.substring(splitIdx + roll.text.length);
                        }
                    });

                    if (remainingLine) {
                        segments.push(<span key="end">{remainingLine}</span>);
                    }

                    return (
                        <div
                            key={idx}
                            className={`${textColor} text-[15px] leading-snug flex items-center justify-center flex-wrap`}
                        >
                            {segments}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getRarityColor = (r: string) => {
        const l = r.toLowerCase();
        if (l.includes('rare')) return 'text-yellow-400';
        if (l.includes('magic')) return 'text-blue-400';
        if (l.includes('unique')) return 'text-orange-500';
        return 'text-white';
    };

    const rarityColor = getRarityColor(item.rarity);

    return (
        <div className="bg-[#0c0c0c] border-2 border-[#a38d6d] rounded-sm p-1 max-w-125 w-full mx-auto shadow-2xl relative">
            {/* Header */}
            <div className="text-center pb-2 mx-3">
                <h2
                    className={`text-xl font-serif font-bold ${rarityColor} drop-shadow-md tracking-wider mt-2`}
                >
                    {item.name}
                </h2>
                {item.baseType && item.name !== item.baseType && (
                    <h3 className={`text-lg font-serif ${rarityColor} drop-shadow-md`}>
                        {item.baseType}
                    </h3>
                )}
                <div className="border-b-2 border-[#a38d6d] mt-2" />
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 font-serif text-[#a38d6d]">
                {/* Implicit & Enchants */}
                {item.modifiers.filter((m) => m.type === 'implicit' || m.type === 'enchant')
                    .length > 0 && (
                    <>
                        <div>
                            {item.modifiers
                                .filter((m) => m.type === 'implicit' || m.type === 'enchant')
                                .map(renderModifier)}
                        </div>
                        <div className="h-px bg-[#a38d6d]/50 w-full" />
                    </>
                )}

                {/* Unique */}
                {item.modifiers.filter((m) => m.type === 'unique').length > 0 && (
                    <>
                        <div>
                            {item.modifiers.filter((m) => m.type === 'unique').map(renderModifier)}
                        </div>
                        {item.modifiers.some((m) => m.type === 'prefix' || m.type === 'suffix') && (
                            <div className="h-px bg-[#a38d6d]/50 w-full" />
                        )}
                    </>
                )}

                {/* Prefixes */}
                {item.modifiers.filter((m) => m.type === 'prefix').length > 0 && (
                    <>
                        <div>
                            {item.modifiers.filter((m) => m.type === 'prefix').map(renderModifier)}
                        </div>
                        {item.modifiers.some((m) => m.type === 'suffix') && (
                            <div className="h-px bg-[#a38d6d]/50 w-full" />
                        )}
                    </>
                )}

                {/* Suffixes */}
                {item.modifiers.filter((m) => m.type === 'suffix').length > 0 && (
                    <>
                        <div>
                            {item.modifiers.filter((m) => m.type === 'suffix').map(renderModifier)}
                        </div>
                    </>
                )}

                <div className="text-center text-xs text-zinc-600 pt-2 font-sans italic">
                    Select ranges above to include them in the divine calculation.
                </div>
            </div>
        </div>
    );
}
