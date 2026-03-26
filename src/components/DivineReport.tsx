import type { PoeModifierRoll } from '../lib/poe-parser';
import { calculateDivineStats, type Fraction } from '../lib/divine-calculator';

export function DivineReport({ selectedRolls }: { selectedRolls: PoeModifierRoll[] }) {
    if (selectedRolls.length === 0) {
        return (
            <div className="poe-glass poe-border flex h-full max-h-75 flex-col items-center justify-center gap-2 rounded-xl p-6 text-sm text-zinc-600">
                <p className="max-w-55 text-center text-xs leading-relaxed">
                    Select at least one modifier range in the item viewer to see divine calculations.
                </p>
            </div>
        );
    }

    const result = calculateDivineStats(selectedRolls);
    const avgPercentile = Math.round(result.currentAveragePercentile * 100);
    const chance = result.chanceToImprove.toFixed(2);
    const chanceEqual = result.chanceEqualOrBetter.toFixed(2);
    const chancePerfect = result.chancePerfect.toFixed(2);

    const offPerfect = selectedRolls.reduce((acc, roll) => {
        if (roll.max !== roll.min) {
            acc += Math.abs(roll.max - roll.value);
        }
        return acc;
    }, 0);

    const offPerfectFormatted = parseFloat(offPerfect.toFixed(2));

    const formatChanceColor = (val: number) => {
        if (val < 15)
            return {
                text: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                bar: '#ef4444',
            };
        if (val < 35)
            return {
                text: 'text-orange-400',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/20',
                bar: '#f97316',
            };
        if (val < 50)
            return {
                text: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                bar: '#f59e0b',
            };
        return {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            bar: '#10b981',
        };
    };

    const chanceStyle = formatChanceColor(result.chanceToImprove);
    const chanceEqualStyle = formatChanceColor(result.chanceEqualOrBetter);

    const renderFraction = (fraction: Fraction) => {
        const { numerator, denominator } = fraction;
        const oneIn =
            numerator > 0 ? (denominator / numerator).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '∞';

        return (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium tabular-nums">
                <span className="rounded border border-zinc-700/50 bg-zinc-800/60 px-1.5 py-0.5 text-zinc-300">
                    {numerator}/{denominator}
                </span>
                <span className="text-zinc-600">≈</span>
                <span className="rounded border border-zinc-700/50 bg-zinc-800/60 px-1.5 py-0.5 text-zinc-300">
                    1 in {oneIn}d
                </span>
            </div>
        );
    };

    return (
        <div className="animate-fade-in-up poe-glass poe-border poe-glow-strong relative overflow-hidden rounded-xl">
            <div className="p-5">
                <h3 className="font-cinzel mb-5 flex items-center justify-center gap-3 text-center text-sm font-bold tracking-[0.2em] text-(--accent-gold) uppercase">
                    <span className="block h-px w-10 bg-linear-to-r from-transparent to-(--poe-border-dim)" />
                    Analysis
                    <span className="block h-px w-10 bg-linear-to-l from-transparent to-(--poe-border-dim)" />
                </h3>

                <div className="mx-auto flex w-full max-w-sm flex-col">
                    {/* Current Quality */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 py-3">
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                                Current Quality
                            </p>
                            <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                                Average percentile of selected rolls
                            </p>
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-black text-zinc-100 tabular-nums">{avgPercentile}</span>
                            <span className="ml-0.5 text-xs font-medium text-zinc-500">%</span>
                        </div>
                    </div>

                    {/* Off Perfect */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 py-3">
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Off-Perfect</p>
                            <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                                Numerical distance from perfect rolls
                            </p>
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-black text-zinc-100 tabular-nums">
                                {offPerfectFormatted}
                            </span>
                        </div>
                    </div>

                    {/* Equal or Better */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 py-3">
                        <div>
                            <p className={`text-xs font-semibold tracking-wider uppercase ${chanceEqualStyle.text}`}>
                                Equal or Better
                            </p>
                            <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                                Chance to hit the same or better rolls
                            </p>
                            {renderFraction(result.fractionEqualOrBetter)}
                        </div>
                        <div className="flex items-baseline">
                            <span
                                className={`text-3xl font-black tracking-tight tabular-nums ${chanceEqualStyle.text}`}
                            >
                                {chanceEqual}
                            </span>
                            <span className={`ml-0.5 text-xs font-bold ${chanceEqualStyle.text}`}>%</span>
                        </div>
                    </div>

                    {/* Strictly Better */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 py-3">
                        <div>
                            <p className={`text-xs font-bold tracking-wider uppercase ${chanceStyle.text}`}>Better</p>
                            <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                                Chance to improve at least one of the rolls
                            </p>
                            {renderFraction(result.fractionToImprove)}
                        </div>
                        <div className="flex items-baseline">
                            <span className={`text-3xl font-black tracking-tight tabular-nums ${chanceStyle.text} `}>
                                {chance}
                            </span>
                            <span className={`ml-0.5 text-xs font-bold ${chanceStyle.text}`}>%</span>
                        </div>
                    </div>

                    {/* Perfect */}
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className={`text-xs font-bold tracking-wider uppercase ${chanceStyle.text}`}>Perfect</p>
                            <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
                                Chance to hit perfect rolls
                            </p>
                            {renderFraction(result.fractionPerfect)}
                        </div>
                        <div className="flex items-baseline">
                            <span className={`text-3xl font-black tracking-tight tabular-nums ${chanceStyle.text}`}>
                                {chancePerfect}
                            </span>
                            <span className={`ml-0.5 text-xs font-bold ${chanceStyle.text}`}>%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
