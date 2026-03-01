// Fuzzy AHP Calculation Utilities

// Triangular Fuzzy Number (TFN)
export interface TFN {
  l: number; // lower
  m: number; // middle
  u: number; // upper
}

export interface FAHPResult {
  fuzzyCriteriaMatrix: TFN[][];
  criteriaGeometricMeans: TFN[];
  fuzzyCriteriaWeights: TFN[];
  crispCriteriaWeights: number[];
  normalizedCriteriaWeights: number[];
  
  fuzzyAlternativeMatrices: TFN[][][];
  alternativeGeometricMeans: TFN[][];
  fuzzyAlternativeWeights: TFN[][];
  crispAlternativeWeights: number[][];
  normalizedAlternativeWeights: number[][];
  
  finalScores: number[];
  rankings: number[];
}

export type ConfidenceKey = 'low' | 'medium' | 'high';

const confidenceSpreadMultiplier: Record<ConfidenceKey, number> = {
  low: 1.25,
  medium: 1,
  high: 0.75,
};

function applyConfidenceToTFN(tfn: TFN, confidence: ConfidenceKey): TFN {
  if (confidence === 'medium') return tfn;

  const multiplier = confidenceSpreadMultiplier[confidence];
  const lowerSpread = tfn.m - tfn.l;
  const upperSpread = tfn.u - tfn.m;

  return {
    l: Math.max(0, tfn.m - lowerSpread * multiplier),
    m: tfn.m,
    u: tfn.m + upperSpread * multiplier,
  };
}

// Fuzzy scale mapping (Saaty scale to TFN)
export const fuzzyScale: { [key: string]: TFN } = {
  '1': { l: 1, m: 1, u: 1 },
  '2': { l: 1, m: 2, u: 3 },
  '3': { l: 2, m: 3, u: 4 },
  '4': { l: 3, m: 4, u: 5 },
  '5': { l: 4, m: 5, u: 6 },
  '6': { l: 5, m: 6, u: 7 },
  '7': { l: 6, m: 7, u: 8 },
  '8': { l: 7, m: 8, u: 9 },
  '9': { l: 9, m: 9, u: 9 },
};

// Get inverse fuzzy number: (l, m, u)^-1 = (1/u, 1/m, 1/l)
export function inverseTFN(tfn: TFN): TFN {
  return {
    l: 1 / tfn.u,
    m: 1 / tfn.m,
    u: 1 / tfn.l,
  };
}

// Multiply two TFNs: (l1, m1, u1) ⊗ (l2, m2, u2) = (l1*l2, m1*m2, u1*u2)
export function multiplyTFN(a: TFN, b: TFN): TFN {
  return {
    l: a.l * b.l,
    m: a.m * b.m,
    u: a.u * b.u,
  };
}

// Add two TFNs: (l1, m1, u1) ⊕ (l2, m2, u2) = (l1+l2, m1+m2, u1+u2)
export function addTFN(a: TFN, b: TFN): TFN {
  return {
    l: a.l + b.l,
    m: a.m + b.m,
    u: a.u + b.u,
  };
}

// Convert crisp Saaty value to TFN
export function crispToFuzzy(value: string, confidence: ConfidenceKey = 'medium'): TFN {
  let baseTFN: TFN;

  // Handle fractions (inverse values)
  if (value.startsWith('1/')) {
    const denom = value.substring(2);
    const positiveTFN = fuzzyScale[denom] || { l: 1, m: 1, u: 1 };
    baseTFN = inverseTFN(positiveTFN);
  } else {
    baseTFN = fuzzyScale[value] || { l: 1, m: 1, u: 1 };
  }

  return applyConfidenceToTFN(baseTFN, confidence);
}

// Calculate fuzzy geometric mean for a row
export function fuzzyGeometricMean(row: TFN[]): TFN {
  const n = row.length;
  
  let productL = 1;
  let productM = 1;
  let productU = 1;
  
  for (const tfn of row) {
    productL *= tfn.l;
    productM *= tfn.m;
    productU *= tfn.u;
  }
  
  return {
    l: Math.pow(productL, 1 / n),
    m: Math.pow(productM, 1 / n),
    u: Math.pow(productU, 1 / n),
  };
}

// Sum all TFNs in an array
export function sumTFNs(tfns: TFN[]): TFN {
  return tfns.reduce(
    (acc, tfn) => addTFN(acc, tfn),
    { l: 0, m: 0, u: 0 }
  );
}

// Calculate fuzzy weights from geometric means
// w̃ᵢ = r̃ᵢ ⊗ (r̃₁ ⊕ r̃₂ ⊕ ... ⊕ r̃ₙ)⁻¹
export function calculateFuzzyWeights(geometricMeans: TFN[]): TFN[] {
  const sum = sumTFNs(geometricMeans);
  const inverseSum: TFN = {
    l: 1 / sum.u,
    m: 1 / sum.m,
    u: 1 / sum.l,
  };
  
  return geometricMeans.map(gm => multiplyTFN(gm, inverseSum));
}

// Defuzzify TFN to crisp value using Center of Area (CoA) method
// w = (l + m + u) / 3
export function defuzzify(tfn: TFN): number {
  return (tfn.l + tfn.m + tfn.u) / 3;
}

// Normalize weights to sum to 1
export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}

// Build fuzzy pairwise comparison matrix from crisp values
export function buildFuzzyMatrix(
  crispMatrix: string[][],
  n: number,
  confidenceMatrix?: (ConfidenceKey | undefined)[][]
): TFN[][] {
  const fuzzyMatrix: TFN[][] = [];
  
  for (let i = 0; i < n; i++) {
    fuzzyMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        fuzzyMatrix[i][j] = { l: 1, m: 1, u: 1 };
      } else if (i < j) {
        const confidence = confidenceMatrix?.[i]?.[j] || 'medium';
        fuzzyMatrix[i][j] = crispToFuzzy(crispMatrix[i][j] || '1', confidence);
      } else {
        // Lower triangle is inverse of upper triangle
        fuzzyMatrix[i][j] = inverseTFN(fuzzyMatrix[j][i]);
      }
    }
  }
  
  return fuzzyMatrix;
}

// Calculate weights from a fuzzy matrix
export function calculateWeightsFromFuzzyMatrix(fuzzyMatrix: TFN[][]): {
  geometricMeans: TFN[];
  fuzzyWeights: TFN[];
  crispWeights: number[];
  normalizedWeights: number[];
} {
  const n = fuzzyMatrix.length;
  
  // Step 1: Calculate fuzzy geometric mean for each row
  const geometricMeans: TFN[] = fuzzyMatrix.map(row => fuzzyGeometricMean(row));
  
  // Step 2: Calculate fuzzy weights
  const fuzzyWeights = calculateFuzzyWeights(geometricMeans);
  
  // Step 3: Defuzzify to get crisp weights
  const crispWeights = fuzzyWeights.map(fw => defuzzify(fw));
  
  // Step 4: Normalize weights
  const normalizedWeights = normalizeWeights(crispWeights);
  
  return {
    geometricMeans,
    fuzzyWeights,
    crispWeights,
    normalizedWeights,
  };
}

// Main FAHP calculation function
export function calculateFAHP(
  criteriaMatrix: string[][],
  alternativeMatrices: string[][][],
  numCriteria: number,
  numAlternatives: number,
  criteriaConfidenceMatrix?: (ConfidenceKey | undefined)[][],
  alternativeConfidenceMatrices?: (ConfidenceKey | undefined)[][][]
): FAHPResult {
  // Build and process criteria matrix
  const fuzzyCriteriaMatrix = buildFuzzyMatrix(criteriaMatrix, numCriteria, criteriaConfidenceMatrix);
  const criteriaResult = calculateWeightsFromFuzzyMatrix(fuzzyCriteriaMatrix);
  
  // Build and process alternative matrices for each criterion
  const fuzzyAlternativeMatrices: TFN[][][] = [];
  const alternativeGeometricMeans: TFN[][] = [];
  const fuzzyAlternativeWeights: TFN[][] = [];
  const crispAlternativeWeights: number[][] = [];
  const normalizedAlternativeWeights: number[][] = [];
  
  for (let c = 0; c < numCriteria; c++) {
    const fuzzyAltMatrix = buildFuzzyMatrix(
      alternativeMatrices[c],
      numAlternatives,
      alternativeConfidenceMatrices?.[c]
    );
    fuzzyAlternativeMatrices.push(fuzzyAltMatrix);
    
    const altResult = calculateWeightsFromFuzzyMatrix(fuzzyAltMatrix);
    alternativeGeometricMeans.push(altResult.geometricMeans);
    fuzzyAlternativeWeights.push(altResult.fuzzyWeights);
    crispAlternativeWeights.push(altResult.crispWeights);
    normalizedAlternativeWeights.push(altResult.normalizedWeights);
  }
  
  // Calculate final scores: weighted sum of alternative weights
  const finalScores: number[] = Array(numAlternatives).fill(0);
  for (let a = 0; a < numAlternatives; a++) {
    for (let c = 0; c < numCriteria; c++) {
      finalScores[a] += criteriaResult.normalizedWeights[c] * normalizedAlternativeWeights[c][a];
    }
  }
  
  // Calculate rankings
  const indexed = finalScores.map((score, index) => ({ score, index }));
  indexed.sort((a, b) => b.score - a.score);
  const rankings: number[] = Array(numAlternatives).fill(0);
  indexed.forEach((item, rank) => {
    rankings[item.index] = rank + 1;
  });
  
  return {
    fuzzyCriteriaMatrix,
    criteriaGeometricMeans: criteriaResult.geometricMeans,
    fuzzyCriteriaWeights: criteriaResult.fuzzyWeights,
    crispCriteriaWeights: criteriaResult.crispWeights,
    normalizedCriteriaWeights: criteriaResult.normalizedWeights,
    
    fuzzyAlternativeMatrices,
    alternativeGeometricMeans,
    fuzzyAlternativeWeights,
    crispAlternativeWeights,
    normalizedAlternativeWeights,
    
    finalScores,
    rankings,
  };
}

// Format TFN for display
export function formatTFN(tfn: TFN, decimals: number = 2): string {
  return `(${tfn.l.toFixed(decimals)}, ${tfn.m.toFixed(decimals)}, ${tfn.u.toFixed(decimals)})`;
}

// Saaty scale for FAHP (same as AHP)
export const fahpSaatyScale = [
  { value: '1', label: '1 - Equal' },
  { value: '2', label: '2 - Weak' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Moderate plus' },
  { value: '5', label: '5 - Strong' },
  { value: '6', label: '6 - Strong plus' },
  { value: '7', label: '7 - Very strong' },
  { value: '8', label: '8 - Very very strong' },
  { value: '9', label: '9 - Extreme' },
  { value: '1/2', label: '1/2 - Weak (inverse)' },
  { value: '1/3', label: '1/3 - Moderate (inverse)' },
  { value: '1/4', label: '1/4 - Moderate plus (inverse)' },
  { value: '1/5', label: '1/5 - Strong (inverse)' },
  { value: '1/6', label: '1/6 - Strong plus (inverse)' },
  { value: '1/7', label: '1/7 - Very strong (inverse)' },
  { value: '1/8', label: '1/8 - Very very strong (inverse)' },
  { value: '1/9', label: '1/9 - Extreme (inverse)' },
];
