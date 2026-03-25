import type { PoeModifierRoll } from './poe-parser';

export interface DivineCalculationResult {
  currentAveragePercentile: number;
  chanceToImprove: number;
  chanceEqualOrBetter: number;
  simulatedRolls: number;
  selectedRollsCount: number;
}

export function calculateDivineStats(
  selectedRolls: PoeModifierRoll[],
  simulations: number = 100000
): DivineCalculationResult {
  if (selectedRolls.length === 0) {
    return {
      currentAveragePercentile: 0,
      chanceToImprove: 0,
      chanceEqualOrBetter: 0,
      simulatedRolls: 0,
      selectedRollsCount: 0
    };
  }

  // Calculate current percentile for each roll
  let currentTotalPercentile = 0;
  selectedRolls.forEach(roll => {
    // If min == max, then its percentile is always 100% or doesn't matter, we can consider it 1
    if (roll.max === roll.min) {
        currentTotalPercentile += 1;
    } else {
        const percent = (roll.value - roll.min) / (roll.max - roll.min);
        currentTotalPercentile += percent;
    }
  });

  const currentAveragePercentile = currentTotalPercentile / selectedRolls.length;

  const variableRolls = selectedRolls.filter(r => r.max > r.min);
  const fixedRollsCount = selectedRolls.length - variableRolls.length;

  // Build percentile arrays for each variable roll
  const modifiersPercentiles: number[][] = [];
  let totalCombinations = 1;

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
      
      const percentiles: number[] = [];
      const minInt = Math.round(roll.min / step);
      const maxInt = Math.round(roll.max / step);
      const range = roll.max - roll.min;

      for (let v = minInt; v <= maxInt; v++) {
          const val = v * step;
          percentiles.push((val - roll.min) / range);
      }
      modifiersPercentiles.push(percentiles);
      totalCombinations *= percentiles.length;
  }

  let improvements = 0;
  let equalOrBetter = 0;

  // If combinations are too massive (e.g. Ventor's Gamble which has 106 Billion),
  // fallback to Monte Carlo to prevent freezing the browser.
  const MAX_EXACT_COMBINATIONS = 5000000;

  if (totalCombinations > MAX_EXACT_COMBINATIONS) {
      // Fallback to Monte Carlo simulation
      for (let i = 0; i < simulations; i++) {
          let simTotalPercentile = fixedRollsCount;
          for (const percentiles of modifiersPercentiles) {
              const randomIndex = Math.floor(Math.random() * percentiles.length);
              simTotalPercentile += percentiles[randomIndex];
          }
          const simAveragePercentile = simTotalPercentile / selectedRolls.length;
          if (simAveragePercentile > currentAveragePercentile + 1e-9) {
              improvements++;
          }
          if (simAveragePercentile >= currentAveragePercentile - 1e-9) {
              equalOrBetter++;
          }
      }
      return {
          currentAveragePercentile,
          chanceToImprove: (improvements / simulations) * 100,
          chanceEqualOrBetter: (equalOrBetter / simulations) * 100,
          simulatedRolls: simulations,
          selectedRollsCount: selectedRolls.length
      };
  }

  // Exact Enumeration
  function enumerate(modIndex: number, currentSum: number) {
      if (modIndex === modifiersPercentiles.length) {
          const simAveragePercentile = currentSum / selectedRolls.length;
          if (simAveragePercentile > currentAveragePercentile + 1e-9) { // 1e-9 to prevent floating point drift failing strict >
              improvements++;
          }
          if (simAveragePercentile >= currentAveragePercentile - 1e-9) {
              equalOrBetter++;
          }
          return;
      }
      
      const percentiles = modifiersPercentiles[modIndex];
      for (let i = 0; i < percentiles.length; i++) {
          enumerate(modIndex + 1, currentSum + percentiles[i]);
      }
  }

  if (modifiersPercentiles.length > 0) {
      enumerate(0, fixedRollsCount);
  } else {
      improvements = 0;
      equalOrBetter = 1; // Since there are no variable rolls, the identical outcome guarantees "Equal to"
  }

  return {
    currentAveragePercentile,
    chanceToImprove: (improvements / totalCombinations) * 100,
    chanceEqualOrBetter: (equalOrBetter / totalCombinations) * 100,
    simulatedRolls: totalCombinations,
    selectedRollsCount: selectedRolls.length
  };
}
