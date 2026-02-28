// Fuzzy TOPSIS Calculation Utilities
import { TFN, defuzzify, formatTFN } from './fahp';

export interface FuzzyTOPSISResult {
  fuzzyMatrix: TFN[][];
  normalizedFuzzyMatrix: TFN[][];
  weightedNormalizedFuzzyMatrix: TFN[][];
  idealBestFuzzy: TFN[];
  idealWorstFuzzy: TFN[];
  distanceFromBestFuzzy: TFN[];
  distanceFromWorstFuzzy: TFN[];
  crispDistanceFromBest: number[];
  crispDistanceFromWorst: number[];
  performanceScores: number[];
  rankings: number[];
}

// TFN arithmetic operations (reused from fahp.ts for clarity)
export function multiplyTFN(a: TFN, b: TFN): TFN {
  return {
    l: a.l * b.l,
    m: a.m * b.m,
    u: a.u * b.u,
  };
}

export function addTFN(a: TFN, b: TFN): TFN {
  return {
    l: a.l + b.l,
    m: a.m + b.m,
    u: a.u + b.u,
  };
}

export function subtractTFN(a: TFN, b: TFN): TFN {
  return {
    l: a.l - b.u,
    m: a.m - b.m,
    u: a.u - b.l,
  };
}

export function invertTFN(tfn: TFN): TFN {
  return {
    l: 1 / tfn.u,
    m: 1 / tfn.m,
    u: 1 / tfn.l,
  };
}

// Calculate distance between two TFNs using vertex distance
// d(A, B) = sqrt(1/3 * ((l1-l2)^2 + (m1-m2)^2 + (u1-u2)^2))
export function distanceBetweenTFN(a: TFN, b: TFN): number {
  const sum = Math.pow(a.l - b.l, 2) + Math.pow(a.m - b.m, 2) + Math.pow(a.u - b.u, 2);
  return Math.sqrt(sum / 3);
}

// Step 1: Convert crisp matrix to fuzzy matrix
// Each value is converted to a TFN (x, x, x) - a crisp value as a triangular fuzzy number
export function convertToFuzzyMatrix(matrix: number[][]): TFN[][] {
  return matrix.map(row =>
    row.map(value => ({
      l: value,
      m: value,
      u: value,
    }))
  );
}

// Step 2: Normalize fuzzy matrix using vector normalization
// Formula: r̃_ij = x̃_ij / sqrt(sum of (x̃_ij)^2 for all i)
export function normalizeFuzzyMatrix(matrix: TFN[][]): TFN[][] {
  const numAlternatives = matrix.length;
  const numCriteria = matrix[0].length;
  const normalized: TFN[][] = [];

  // Calculate the denominator for each criterion (sqrt of sum of squares)
  const denominators: number[] = [];
  for (let j = 0; j < numCriteria; j++) {
    let sumOfSquares = 0;
    for (let i = 0; i < numAlternatives; i++) {
      const tfn = matrix[i][j];
      // Use the middle value for calculation
      sumOfSquares += tfn.m * tfn.m;
    }
    denominators.push(Math.sqrt(sumOfSquares));
  }

  // Normalize each cell
  for (let i = 0; i < numAlternatives; i++) {
    normalized[i] = [];
    for (let j = 0; j < numCriteria; j++) {
      const tfn = matrix[i][j];
      const denom = denominators[j];
      normalized[i][j] = {
        l: tfn.l / denom,
        m: tfn.m / denom,
        u: tfn.u / denom,
      };
    }
  }

  return normalized;
}

// Step 3: Apply fuzzy weights to normalized fuzzy matrix
// Formula: ṽ_ij = w̃_j ⊗ r̃_ij
export function applyFuzzyWeights(normalizedMatrix: TFN[][], weights: TFN[]): TFN[][] {
  const weighted: TFN[][] = [];

  for (let i = 0; i < normalizedMatrix.length; i++) {
    weighted[i] = [];
    for (let j = 0; j < normalizedMatrix[i].length; j++) {
      weighted[i][j] = multiplyTFN(normalizedMatrix[i][j], weights[j]);
    }
  }

  return weighted;
}

// Step 4: Find fuzzy ideal best (F+) and fuzzy ideal worst (F-) values
// For benefit criteria: F+ = max(ṽ_ij), F- = min(ṽ_ij)
// For cost criteria: F+ = min(ṽ_ij), F- = max(ṽ_ij)
export function findFuzzyIdealValues(
  weightedMatrix: TFN[][],
  criteriaTypes: ('benefit' | 'cost')[]
): { idealBestFuzzy: TFN[]; idealWorstFuzzy: TFN[] } {
  const numCriteria = weightedMatrix[0].length;
  const idealBestFuzzy: TFN[] = [];
  const idealWorstFuzzy: TFN[] = [];

  for (let j = 0; j < numCriteria; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);

    // Find max and min based on defuzzified values (middle value)
    const defuzzifiedValues = columnValues.map(tfn => tfn.m);
    const maxIndex = defuzzifiedValues.indexOf(Math.max(...defuzzifiedValues));
    const minIndex = defuzzifiedValues.indexOf(Math.min(...defuzzifiedValues));

    if (criteriaTypes[j] === 'benefit') {
      idealBestFuzzy.push(columnValues[maxIndex]);
      idealWorstFuzzy.push(columnValues[minIndex]);
    } else {
      // Cost criterion - lower is better
      idealBestFuzzy.push(columnValues[minIndex]);
      idealWorstFuzzy.push(columnValues[maxIndex]);
    }
  }

  return { idealBestFuzzy, idealWorstFuzzy };
}

// Step 5: Calculate fuzzy separation measures using distance
// d⁺_i = sum of d(ṽ_ij, F⁺_j)
// d⁻_i = sum of d(ṽ_ij, F⁻_j)
export function calculateFuzzyDistances(
  weightedMatrix: TFN[][],
  idealBestFuzzy: TFN[],
  idealWorstFuzzy: TFN[]
): { distanceFromBestFuzzy: TFN[]; distanceFromWorstFuzzy: TFN[]; crispDistanceFromBest: number[]; crispDistanceFromWorst: number[] } {
  const distanceFromBestFuzzy: TFN[] = [];
  const distanceFromWorstFuzzy: TFN[] = [];
  const crispDistanceFromBest: number[] = [];
  const crispDistanceFromWorst: number[] = [];

  for (let i = 0; i < weightedMatrix.length; i++) {
    let sumDistanceBest = 0;
    let sumDistanceWorst = 0;

    for (let j = 0; j < weightedMatrix[i].length; j++) {
      sumDistanceBest += distanceBetweenTFN(weightedMatrix[i][j], idealBestFuzzy[j]);
      sumDistanceWorst += distanceBetweenTFN(weightedMatrix[i][j], idealWorstFuzzy[j]);
    }

    // Store as TFN (crisp-like) for completeness
    distanceFromBestFuzzy.push({
      l: sumDistanceBest,
      m: sumDistanceBest,
      u: sumDistanceBest,
    });
    distanceFromWorstFuzzy.push({
      l: sumDistanceWorst,
      m: sumDistanceWorst,
      u: sumDistanceWorst,
    });

    crispDistanceFromBest.push(sumDistanceBest);
    crispDistanceFromWorst.push(sumDistanceWorst);
  }

  return {
    distanceFromBestFuzzy,
    distanceFromWorstFuzzy,
    crispDistanceFromBest,
    crispDistanceFromWorst,
  };
}

// Step 6: Calculate performance scores (closeness coefficient)
// CC_i = d⁻_i / (d⁺_i + d⁻_i)
export function calculateFuzzyPerformanceScores(
  crispDistanceFromBest: number[],
  crispDistanceFromWorst: number[]
): number[] {
  const scores: number[] = [];

  for (let i = 0; i < crispDistanceFromBest.length; i++) {
    const sum = crispDistanceFromBest[i] + crispDistanceFromWorst[i];
    scores.push(sum === 0 ? 0 : crispDistanceFromWorst[i] / sum);
  }

  return scores;
}

// Step 7: Calculate rankings
export function calculateFuzzyRankings(performanceScores: number[]): number[] {
  const indexed = performanceScores.map((score, index) => ({ score, index }));
  indexed.sort((a, b) => b.score - a.score);

  const rankings: number[] = new Array(performanceScores.length);
  indexed.forEach((item, rank) => {
    rankings[item.index] = rank + 1;
  });

  return rankings;
}

// Main Fuzzy TOPSIS calculation function
function isTFNCell(value: unknown): value is TFN {
  return (
    typeof value === 'object' &&
    value !== null &&
    'l' in value &&
    'm' in value &&
    'u' in value
  );
}

function toFuzzyMatrix(matrix: number[][] | TFN[][]): TFN[][] {
  const firstCell = matrix?.[0]?.[0];
  if (isTFNCell(firstCell)) {
    return matrix as TFN[][];
  }
  return convertToFuzzyMatrix(matrix as number[][]);
}

export function calculateFuzzyTOPSIS(
  rawMatrix: number[][] | TFN[][],
  fuzzyWeights: TFN[],
  criteriaTypes: ('benefit' | 'cost')[]
): FuzzyTOPSISResult {
  // Step 1: Use provided fuzzy matrix directly, or convert crisp matrix to fuzzy
  const fuzzyMatrix = toFuzzyMatrix(rawMatrix);

  // Step 2: Normalize fuzzy matrix
  const normalizedFuzzyMatrix = normalizeFuzzyMatrix(fuzzyMatrix);

  // Step 3: Apply fuzzy weights
  const weightedNormalizedFuzzyMatrix = applyFuzzyWeights(
    normalizedFuzzyMatrix,
    fuzzyWeights
  );

  // Step 4: Find fuzzy ideal values
  const { idealBestFuzzy, idealWorstFuzzy } = findFuzzyIdealValues(
    weightedNormalizedFuzzyMatrix,
    criteriaTypes
  );

  // Step 5: Calculate distances
  const {
    distanceFromBestFuzzy,
    distanceFromWorstFuzzy,
    crispDistanceFromBest,
    crispDistanceFromWorst,
  } = calculateFuzzyDistances(
    weightedNormalizedFuzzyMatrix,
    idealBestFuzzy,
    idealWorstFuzzy
  );

  // Step 6: Calculate performance scores
  const performanceScores = calculateFuzzyPerformanceScores(
    crispDistanceFromBest,
    crispDistanceFromWorst
  );

  // Step 7: Calculate rankings
  const rankings = calculateFuzzyRankings(performanceScores);

  return {
    fuzzyMatrix,
    normalizedFuzzyMatrix,
    weightedNormalizedFuzzyMatrix,
    idealBestFuzzy,
    idealWorstFuzzy,
    distanceFromBestFuzzy,
    distanceFromWorstFuzzy,
    crispDistanceFromBest,
    crispDistanceFromWorst,
    performanceScores,
    rankings,
  };
}

// Fuzzy scale for weights (reuse FAHP scale if needed)
export const fuzzyTopsisWeightScale: { [key: string]: TFN } = {
  'very_low': { l: 0, m: 0.1, u: 0.3 },
  'low': { l: 0.1, m: 0.3, u: 0.5 },
  'medium': { l: 0.3, m: 0.5, u: 0.7 },
  'high': { l: 0.5, m: 0.7, u: 0.9 },
  'very_high': { l: 0.7, m: 0.9, u: 1.0 },
};

// Format TFN for display
export function formatFuzzyTFN(tfn: TFN, decimals: number = 3): string {
  return `(${tfn.l.toFixed(decimals)}, ${tfn.m.toFixed(decimals)}, ${tfn.u.toFixed(decimals)})`;
}
