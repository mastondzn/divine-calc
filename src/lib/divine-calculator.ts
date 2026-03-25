import type { PoeModifierRoll } from './poe-parser';

export interface DivineCalculationResult {
    currentAveragePercentile: number;
    chanceToImprove: number;
    chanceEqualOrBetter: number;
    chancePerfect: number;
    selectedRollsCount: number;
}

/**
 * Calculate divine orb probabilities using exact per-roll math.
 *
 * "Equal or Better" = every selected roll is >= its current value.
 * "Strictly Better"  = every roll is >= current AND at least one is strictly >.
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

    const variableRolls = selectedRolls.filter((r) => r.max > r.min);

    if (variableRolls.length === 0) {
        // All rolls are fixed — you always hit the same outcome
        return {
            currentAveragePercentile,
            chanceToImprove: 0,
            chanceEqualOrBetter: 100,
            chancePerfect: 100,
            selectedRollsCount: selectedRolls.length,
        };
    }

    // For each variable roll, compute:
    //   P(new >= current) and P(new == current)
    // Then:
    //   P(equal or better) = product of P(new >= current) for all rolls
    //   P(strictly better) = P(equal or better) - product of P(new == current) for all rolls
    let probAllEqualOrBetter = 1;
    let probAllExactlyEqual = 1;

    for (const roll of variableRolls) {
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

        probAllEqualOrBetter *= valuesGteqCurrent / totalValues;
        probAllExactlyEqual *= 1 / totalValues;
    }

    const chancePerfect = selectedRolls.reduce((acc, roll) => {
        if (roll.max === roll.min) {
            return acc * 1;
        } else {
            return (acc * 1) / (roll.max - roll.min + 1);
        }
    }, 1);

    return {
        currentAveragePercentile,
        chanceToImprove: Math.max(0, (probAllEqualOrBetter - probAllExactlyEqual) * 100),
        chanceEqualOrBetter: probAllEqualOrBetter * 100,
        chancePerfect: chancePerfect * 100,
        selectedRollsCount: selectedRolls.length,
    };
}
