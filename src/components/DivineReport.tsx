import type { PoeModifierRoll } from '../lib/poe-parser';
import { calculateDivineStats } from '../lib/divine-calculator';

export function DivineReport({ selectedRolls }: { selectedRolls: PoeModifierRoll[] }) {
    if (selectedRolls.length === 0) {
        return (
            <div className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-sm h-full max-h-75">
                Select at least one modifier range in the item viewer to see divine calculations.
            </div>
        );
    }

    const result = calculateDivineStats(selectedRolls, 100000);
    const avgPercentile = Math.round(result.currentAveragePercentile * 100);
    const chance = result.chanceToImprove.toFixed(2);
    const chanceEqual = result.chanceEqualOrBetter.toFixed(2);

    let offPerfect = 0;
    selectedRolls.forEach((roll) => {
        if (roll.max !== roll.min) {
            offPerfect += Math.abs(roll.max - roll.value);
        }
    });

    // Format with up to 2 decimals to avoid floating point weirdness but keep integers clean
    const offPerfectFormatted = parseFloat(offPerfect.toFixed(2));

    const formatChanceColor = (val: number) => {
        if (val < 15) return { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
        if (val < 35)
            return { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
        if (val < 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    };

    const chanceStyle = formatChanceColor(result.chanceToImprove);
    const chanceEqualStyle = formatChanceColor(result.chanceEqualOrBetter);

    return (
        <div className="w-full p-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-2xl relative flex flex-col justify-center">
            <h3 className="text-lg font-bold text-amber-400/90 mb-5 text-center uppercase tracking-widest flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-linear-to-r from-transparent to-amber-500/50"></span>
                Analysis
                <span className="h-px w-12 bg-linear-to-l from-transparent to-amber-500/50"></span>
            </h3>

            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700/80">
                    <div>
                        <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-1">
                            Current Quality
                        </p>
                        <p className="text-zinc-500 text-[10px] leading-tight max-w-35">
                            Average percentile of selected modifiers
                        </p>
                    </div>
                    <div className="flex items-baseline px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                        <span className="text-2xl font-black text-zinc-100">{avgPercentile}</span>
                        <span className="text-sm text-zinc-500 ml-1 font-medium">%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 transition-colors hover:border-zinc-700/80">
                    <div>
                        <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-1">
                            Off Perfect
                        </p>
                        <p className="text-zinc-500 text-[10px] leading-tight max-w-35">
                            Total numeric distance from perfect rolls
                        </p>
                    </div>
                    <div className="flex items-baseline px-3 py-1.5 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                        <span className="text-2xl font-black text-zinc-100">
                            {offPerfectFormatted}
                        </span>
                    </div>
                </div>

                <div
                    className={`flex items-center justify-between bg-zinc-950/60 border rounded-xl p-4 transition-colors ${chanceEqualStyle.bg}`}
                >
                    <div>
                        <p
                            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${chanceEqualStyle.text}`}
                        >
                            Equal or Better
                        </p>
                        <p className="text-zinc-500 text-[10px] leading-tight max-w-35">
                            Probability of hitting same or better rolls
                        </p>
                    </div>
                    <div className="flex items-baseline">
                        <span className={`text-3xl font-black ${chanceEqualStyle.text}`}>
                            {chanceEqual}
                        </span>
                        <span className={`text-sm ml-1 font-bold ${chanceEqualStyle.text} `}>
                            %
                        </span>
                    </div>
                </div>

                <div
                    className={`flex items-center justify-between bg-zinc-950/60 border rounded-xl p-4 transition-colors shadow-lg ${chanceStyle.bg}`}
                >
                    <div>
                        <p
                            className={`text-xs font-bold uppercase tracking-wider mb-1 ${chanceStyle.text}`}
                        >
                            Strictly Better
                        </p>
                        <p className="text-zinc-400 text-[10px] leading-tight max-w-35">
                            Probability of a strictly better roll
                        </p>
                    </div>
                    <div className="flex items-baseline">
                        <span className={`text-4xl font-black ${chanceStyle.text}`}>{chance}</span>
                        <span className={`text-sm ml-1 font-bold ${chanceStyle.text} `}>%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
