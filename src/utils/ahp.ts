// AHP Calculation Utilities

export interface AHPResult {
  criteriaWeights: number[];
  alternativeScores: number[][];
  finalScores: number[];
  consistencyRatios: {
    criteria: number;
    alternatives: number[];
  };
}

// Random Index values for consistency check (up to 15 criteria)
const RI: { [key: number]: number } = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59,
};

// Convert fraction string to number
export function parseFraction(value: string): number {
  if (value.includes('/')) {
    const [num, denom] = value.split('/').map(Number);
    return num / denom;
  }
  return parseFloat(value) || 1;
}

// Calculate priority vector (weights) using geometric mean method
export function calculateWeights(matrix: number[][]): number[] {
  const n = matrix.length;
  const geometricMeans: number[] = [];

  // Calculate geometric mean for each row
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    geometricMeans.push(Math.pow(product, 1 / n));
  }

  // Normalize to get weights
  const sum = geometricMeans.reduce((a, b) => a + b, 0);
  return geometricMeans.map((gm) => gm / sum);
}

// Calculate consistency ratio
export function calculateConsistencyRatio(matrix: number[][], weights: number[]): number {
  const n = matrix.length;
  if (n <= 2) return 0;

  // Calculate Aw (matrix * weights)
  const aw: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * weights[j];
    }
    aw.push(sum);
  }

  // Calculate lambda max
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += aw[i] / weights[i];
  }
  lambdaMax /= n;

  // Calculate Consistency Index
  const CI = (lambdaMax - n) / (n - 1);

  // Calculate Consistency Ratio
  const CR = CI / (RI[n] || 1.59);

  return CR;
}

// Convert upper triangular input to full matrix
export function buildFullMatrix(values: string[][], n: number): number[][] {
  const matrix: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(1));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const val = parseFraction(values[i][j] || '1');
        matrix[i][j] = val;
        matrix[j][i] = 1 / val;
      }
    }
  }

  return matrix;
}

// Calculate final AHP scores
export function calculateAHP(
  criteriaMatrix: string[][],
  alternativeMatrices: string[][][],
  numCriteria: number,
  numAlternatives: number
): AHPResult {
  // Build and calculate criteria weights
  const fullCriteriaMatrix = buildFullMatrix(criteriaMatrix, numCriteria);
  const criteriaWeights = calculateWeights(fullCriteriaMatrix);
  const criteriaCR = calculateConsistencyRatio(fullCriteriaMatrix, criteriaWeights);

  // Calculate alternative scores for each criterion
  const alternativeScores: number[][] = [];
  const alternativeCRs: number[] = [];

  for (let c = 0; c < numCriteria; c++) {
    const fullAltMatrix = buildFullMatrix(alternativeMatrices[c], numAlternatives);
    const scores = calculateWeights(fullAltMatrix);
    alternativeScores.push(scores);
    alternativeCRs.push(calculateConsistencyRatio(fullAltMatrix, scores));
  }

  // Calculate final scores (weighted sum)
  const finalScores: number[] = Array(numAlternatives).fill(0);
  for (let a = 0; a < numAlternatives; a++) {
    for (let c = 0; c < numCriteria; c++) {
      finalScores[a] += criteriaWeights[c] * alternativeScores[c][a];
    }
  }

  return {
    criteriaWeights,
    alternativeScores,
    finalScores,
    consistencyRatios: {
      criteria: criteriaCR,
      alternatives: alternativeCRs,
    },
  };
}

// Saaty scale descriptions
export const saatyScale = [
  { value: '1', label: '1 - Equal importance' },
  { value: '2', label: '2 - Weak' },
  { value: '3', label: '3 - Moderate importance' },
  { value: '4', label: '4 - Moderate plus' },
  { value: '5', label: '5 - Strong importance' },
  { value: '6', label: '6 - Strong plus' },
  { value: '7', label: '7 - Very strong importance' },
  { value: '8', label: '8 - Very very strong' },
  { value: '9', label: '9 - Extreme importance' },
  { value: '1/2', label: '1/2 - Weak (inverse)' },
  { value: '1/3', label: '1/3 - Moderate (inverse)' },
  { value: '1/4', label: '1/4 - Moderate plus (inverse)' },
  { value: '1/5', label: '1/5 - Strong (inverse)' },
  { value: '1/6', label: '1/6 - Strong plus (inverse)' },
  { value: '1/7', label: '1/7 - Very strong (inverse)' },
  { value: '1/8', label: '1/8 - Very very strong (inverse)' },
  { value: '1/9', label: '1/9 - Extreme (inverse)' },
];
