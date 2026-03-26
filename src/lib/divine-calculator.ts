import type { PoeModifierRoll } from './poe-parser';

export interface Fraction {
    numerator: number;
    denominator: number;
}

export interface DivineCalculationResult {
    currentAveragePercentile: number;
    chanceToImprove: number;
    chanceEqualOrBetter: number;
    chancePerfect: number;
    fractionToImprove: Fraction;
    fractionEqualOrBetter: Fraction;
    fractionPerfect: Fraction;
    selectedRollsCount: number;
}

/**
 * Calculate divine orb probabilities using exact per-roll math.
 *
 * "Equal or Better" = every selected roll is >= its current value.
 * "Better" = every selected roll is >= its current value AND at least one is strictly >.
 * "Perfect" = every roll is exactly its max value.
 *
 * Since divine orb rolls are independent, we can multiply per-roll probabilities
 * directly — no simulation or enumeration needed.
 */
export function calculateDivineStats(selectedRolls: PoeModifierRoll[]): DivineCalculationResult {
    if (selectedRolls.length === 0) {
        return {
            currentAveragePercentile: 0,
            chanceToImprove: 0,
            chanceEqualOrBetter: 0,
            chancePerfect: 0,
            fractionToImprove: { numerator: 0, denominator: 1 },
            fractionEqualOrBetter: { numerator: 0, denominator: 1 },
            fractionPerfect: { numerator: 0, denominator: 1 },
            selectedRollsCount: 0,
        };
    }

    // Calculate current average percentile (for display purposes)
    let currentTotalPercentile = 0;
    selectedRolls.forEach((roll) => {
        if (roll.max === roll.min) {
            currentTotalPercentile += 1;
        } else {
            currentTotalPercentile += (roll.value - roll.min) / (roll.max - roll.min);
        }
    });
    const currentAveragePercentile = currentTotalPercentile / selectedRolls.length;

    let numAllEqualOrBetter = 1;
    let numAllExactlyEqual = 1;
    let denominator = 1;

    for (const roll of selectedRolls) {
        if (roll.max === roll.min) {
            numAllEqualOrBetter *= 1;
            numAllExactlyEqual *= 1;
            denominator *= 1;
            continue;
        }

        const isDecimal = roll.min % 1 !== 0 || roll.max % 1 !== 0 || roll.value % 1 !== 0;
        let step = 1;
        if (isDecimal) {
            const match = roll.text.match(/\.(\d+)/);
            if (match) {
                step = Math.pow(10, -match[1].length);
            } else {
                step = 0.01;
            }
        }

        const minInt = Math.round(roll.min / step);
        const maxInt = Math.round(roll.max / step);
        const currentInt = Math.round(roll.value / step);

        const totalValues = maxInt - minInt + 1;
        const valuesGteqCurrent = maxInt - currentInt + 1; // values >= current

        numAllEqualOrBetter *= valuesGteqCurrent;
        numAllExactlyEqual *= 1;
        denominator *= totalValues;
    }

    const numToImprove = Math.max(0, numAllEqualOrBetter - numAllExactlyEqual);
    const numPerfect = 1;

    const chanceEqualOrBetter = (numAllEqualOrBetter / denominator) * 100;
    const chanceToImprove = (numToImprove / denominator) * 100;
    const chancePerfect = (numPerfect / denominator) * 100;

    return {
        currentAveragePercentile,
        chanceToImprove,
        chanceEqualOrBetter,
        chancePerfect,
        fractionToImprove: { numerator: numToImprove, denominator },
        fractionEqualOrBetter: { numerator: numAllEqualOrBetter, denominator },
        fractionPerfect: { numerator: numPerfect, denominator },
        selectedRollsCount: selectedRolls.length,
    };
}
