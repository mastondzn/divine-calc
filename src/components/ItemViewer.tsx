import type { PoeItem, PoeModifierRoll, PoeModifier } from '../lib/poe-parser';

const PoeSeparator = () => (
    <div className="my-1 h-px w-full bg-linear-to-r from-transparent via-(--poe-border-dim) to-transparent" />
);

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
            <div className="poe-border relative flex h-125 w-full flex-col items-center justify-center gap-3 rounded-lg bg-[rgba(12,12,12,0.5)] text-zinc-600">
                <span className="font-cinzel text-sm tracking-wide italic">Awaiting item data…</span>
            </div>
        );
    }

    const getRarityScheme = (r: string) => {
        const l = r.toLowerCase();
        if (l.includes('unique'))
            return {
                text: 'text-[#af6025]',
                gradient: 'bg-gradient-to-b from-[#af6025]/20 via-[#af6025]/5 to-transparent',
                border: 'border-[#af6025]/60',
                glow: 'shadow-[0_0_30px_rgba(175,96,37,0.1)]',
            };
        if (l.includes('rare'))
            return {
                text: 'text-[#ffd700]',
                gradient: 'bg-gradient-to-b from-[#ffd700]/15 via-[#ffd700]/3 to-transparent',
                border: 'border-[#ffd700]/50',
                glow: 'shadow-[0_0_30px_rgba(255,215,0,0.06)]',
            };
        if (l.includes('magic'))
            return {
                text: 'text-[#8888ff]',
                gradient: 'bg-gradient-to-b from-[#8888ff]/15 via-[#8888ff]/3 to-transparent',
                border: 'border-[#8888ff]/50',
                glow: 'shadow-[0_0_30px_rgba(136,136,255,0.08)]',
            };
        return {
            text: 'text-zinc-200',
            gradient: 'bg-gradient-to-b from-zinc-700/15 via-zinc-700/3 to-transparent',
            border: 'border-zinc-600/50',
            glow: '',
        };
    };

    const renderModifier = (mod: PoeModifier) => {
        let textColor = 'text-[#8888FF]';
        if (mod.isCrafted) textColor = 'text-[#b8daf2]';
        if (mod.isFractured) textColor = 'text-[#A38D6D]';

        const getPercentileColor = (pct: number) => {
            if (pct < 30) return { text: 'text-red-400/80', bg: 'bg-red-500/10', bar: '#ef4444' };
            if (pct < 70) return { text: 'text-orange-400/80', bg: 'bg-orange-500/10', bar: '#f97316' };
            if (pct < 95) return { text: 'text-green-400/80', bg: 'bg-green-500/10', bar: '#22c55e' };
            return { text: 'text-cyan-300/90', bg: 'bg-cyan-500/10', bar: '#06b6d4' };
        };

        return (
            <div key={mod.id} className="group relative my-3 text-center">
                <div className="mb-0.5 text-[10px] tracking-wider text-zinc-600 uppercase">
                    {mod.isFractured ? 'Fractured ' : mod.isCrafted ? 'Crafted ' : ''}
                    {mod.type.charAt(0).toUpperCase() + mod.type.slice(1)} Modifier
                    {mod.name ? ` "${mod.name}"` : ''}
                    {mod.tier ? ` (T${mod.tier})` : ''}
                </div>

                {mod.lines.map((line, idx) => {
                    const rollsInLine = mod.rolls.filter((r) => line.includes(r.text));

                    if (rollsInLine.length === 0) {
                        return (
                            <div key={idx} className={`${textColor} text-[15px] leading-snug`}>
                                {line}
                            </div>
                        );
                    }

                    let remainingLine = line;
                    const segments: React.ReactNode[] = [];

                    rollsInLine.forEach((roll, rIdx) => {
                        const splitIdx = remainingLine.indexOf(roll.text);
                        if (splitIdx !== -1) {
                            const before = remainingLine.substring(0, splitIdx);
                            if (before) segments.push(<span key={`text-${rIdx}-before`}>{before}</span>);

                            const isSelected = selectedRolls.has(roll.id);
                            const isFixed = roll.min === roll.max;
                            const isFractured = mod.isFractured ?? false;
                            const isImplicit = mod.type === 'implicit';
                            const isDisabled = isFixed || isFractured || isImplicit;
                            const percentile = isFixed
                                ? 100
                                : Math.round(((roll.value - roll.min) / (roll.max - roll.min)) * 100);
                            const pctStyle = getPercentileColor(percentile);

                            segments.push(
                                <span key={roll.id} className="mx-1 inline-flex flex-col items-center align-middle">
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
                                        className={`inline-flex flex-col justify-center overflow-hidden rounded-md border pt-1 transition-all duration-200 ${isFixed ? 'pb-1' : ''} ${
                                            isDisabled
                                                ? 'cursor-not-allowed border-zinc-800/50 bg-zinc-900/50 opacity-50'
                                                : isSelected
                                                  ? 'animate-border-shimmer cursor-pointer border-amber-500/40 bg-amber-500/10 text-amber-200'
                                                  : 'cursor-pointer border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/40'
                                        }`}
                                        title={
                                            isFractured
                                                ? 'Fractured modifiers cannot be divined.'
                                                : isFixed
                                                  ? 'Mod has fixed value, cannot be divined.'
                                                  : isImplicit
                                                    ? 'Implicit modifiers cannot be divined.'
                                                    : `Current Roll: ${percentile}%`
                                        }
                                    >
                                        <div className="flex w-full items-center justify-center px-2">
                                            <span className="text-sm font-bold">{roll.value}</span>
                                            <span className="ml-1 font-mono text-[11px] tracking-tighter text-zinc-500">
                                                ({roll.min}–{roll.max})
                                            </span>
                                            {!isFixed && (
                                                <span
                                                    className={`py ml-1.5 rounded-sm px-1 text-[9px] font-semibold ${pctStyle.text} ${pctStyle.bg} `}
                                                >
                                                    {percentile}%
                                                </span>
                                            )}
                                        </div>
                                        {!isFixed && (
                                            <div className="h-1 w-full overflow-hidden bg-white/10">
                                                <div
                                                    className="h-full"
                                                    style={{
                                                        width: `${percentile}%`,
                                                        backgroundColor: pctStyle.bar,
                                                        opacity: isSelected ? 0.8 : 0.4,
                                                        transition: 'width 0.4s ease-out',
                                                    }}
                                                />
                                            </div>
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
                        <div key={idx} className={`${textColor} text-center text-[15px] leading-relaxed`}>
                            {segments}
                        </div>
                    );
                })}
            </div>
        );
    };

    const rarity = getRarityScheme(item.rarity);

    return (
        <div
            className={`poe-border relative mx-auto w-full rounded-xl bg-[#0a0a0a] ${rarity.glow} overflow-hidden transition-shadow duration-500`}
        >
            <div className={`${rarity.gradient} rounded-t-[1px]`}>
                <div className="px-4 py-3 text-center">
                    <h2 className={`font-cinzel text-xl font-bold ${rarity.text} tracking-wider drop-shadow-md`}>
                        {item.name}
                    </h2>
                    {item.baseType && item.name !== item.baseType && (
                        <h3 className={`font-cinzel text-base ${rarity.text} mt-0.5 opacity-80 drop-shadow-sm`}>
                            {item.baseType}
                        </h3>
                    )}
                </div>
                <div className={`h-px ${rarity.border} mx-2 bg-(--poe-border) opacity-30`} />
            </div>

            <div className="space-y-3 text-[#a38d6d]">
                {item.modifiers.filter((m) => m.type === 'implicit' || m.type === 'enchant').length > 0 && (
                    <>
                        <div>
                            {item.modifiers
                                .filter((m) => m.type === 'implicit' || m.type === 'enchant')
                                .map(renderModifier)}
                        </div>
                        <PoeSeparator />
                    </>
                )}

                {item.modifiers.filter((m) => m.type === 'unique').length > 0 && (
                    <>
                        <div>{item.modifiers.filter((m) => m.type === 'unique').map(renderModifier)}</div>
                        {item.modifiers.some((m) => m.type === 'prefix' || m.type === 'suffix') && <PoeSeparator />}
                    </>
                )}

                {item.modifiers.filter((m) => m.type === 'prefix').length > 0 && (
                    <>
                        <div>{item.modifiers.filter((m) => m.type === 'prefix').map(renderModifier)}</div>
                        {item.modifiers.some((m) => m.type === 'suffix') && <PoeSeparator />}
                    </>
                )}

                {item.modifiers.filter((m) => m.type === 'suffix').length > 0 && (
                    <div>{item.modifiers.filter((m) => m.type === 'suffix').map(renderModifier)}</div>
                )}

                <PoeSeparator />
                <div className="my-3 text-center font-sans text-[12px] tracking-wide text-zinc-600 italic">
                    Select ranges above to include them in the divine calculation.
                </div>
            </div>
        </div>
    );
}
