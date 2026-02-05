// TOPSIS Calculation Utilities

export interface TOPSISResult {
  rawMatrix: number[][];
  normalizedMatrix: number[][];
  weightedNormalizedMatrix: number[][];
  idealBest: number[];
  idealWorst: number[];
  distanceFromBest: number[];
  distanceFromWorst: number[];
  performanceScores: number[];
  rankings: number[];
}

// Step 1: Normalize the decision matrix using vector normalization
// Formula: r_ij = x_ij / sqrt(sum of x_ij^2 for all i)
export function normalizeMatrix(matrix: number[][]): number[][] {
  const numAlternatives = matrix.length;
  const numCriteria = matrix[0].length;
  const normalized: number[][] = [];

  // Calculate the denominator (sqrt of sum of squares) for each criterion
  const denominators: number[] = [];
  for (let j = 0; j < numCriteria; j++) {
    let sumOfSquares = 0;
    for (let i = 0; i < numAlternatives; i++) {
      sumOfSquares += matrix[i][j] ** 2;
    }
    denominators.push(Math.sqrt(sumOfSquares));
  }

  // Normalize each cell
  for (let i = 0; i < numAlternatives; i++) {
    normalized[i] = [];
    for (let j = 0; j < numCriteria; j++) {
      normalized[i][j] = matrix[i][j] / denominators[j];
    }
  }

  return normalized;
}

// Step 2: Apply weights to normalized matrix
// Formula: v_ij = w_j * r_ij
export function applyWeights(normalizedMatrix: number[][], weights: number[]): number[][] {
  const weighted: number[][] = [];
  
  for (let i = 0; i < normalizedMatrix.length; i++) {
    weighted[i] = [];
    for (let j = 0; j < normalizedMatrix[i].length; j++) {
      weighted[i][j] = normalizedMatrix[i][j] * weights[j];
    }
  }

  return weighted;
}

// Step 3: Find ideal best (V+) and ideal worst (V-) values
// For benefit criteria: V+ = max, V- = min
// For cost criteria: V+ = min, V- = max
export function findIdealValues(
  weightedMatrix: number[][],
  criteriaTypes: ('benefit' | 'cost')[]
): { idealBest: number[]; idealWorst: number[] } {
  const numCriteria = weightedMatrix[0].length;
  const idealBest: number[] = [];
  const idealWorst: number[] = [];

  for (let j = 0; j < numCriteria; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);
    
    if (criteriaTypes[j] === 'benefit') {
      idealBest.push(Math.max(...columnValues));
      idealWorst.push(Math.min(...columnValues));
    } else {
      // Cost criterion - lower is better
      idealBest.push(Math.min(...columnValues));
      idealWorst.push(Math.max(...columnValues));
    }
  }

  return { idealBest, idealWorst };
}

// Step 4: Calculate separation measures (distances)
// S+ = sqrt(sum of (v_ij - V+_j)^2)
// S- = sqrt(sum of (v_ij - V-_j)^2)
export function calculateDistances(
  weightedMatrix: number[][],
  idealBest: number[],
  idealWorst: number[]
): { distanceFromBest: number[]; distanceFromWorst: number[] } {
  const distanceFromBest: number[] = [];
  const distanceFromWorst: number[] = [];

  for (let i = 0; i < weightedMatrix.length; i++) {
    let sumBest = 0;
    let sumWorst = 0;

    for (let j = 0; j < weightedMatrix[i].length; j++) {
      sumBest += (weightedMatrix[i][j] - idealBest[j]) ** 2;
      sumWorst += (weightedMatrix[i][j] - idealWorst[j]) ** 2;
    }

    distanceFromBest.push(Math.sqrt(sumBest));
    distanceFromWorst.push(Math.sqrt(sumWorst));
  }

  return { distanceFromBest, distanceFromWorst };
}

// Step 5: Calculate performance scores
// P_i = S-_i / (S+_i + S-_i)
export function calculatePerformanceScores(
  distanceFromBest: number[],
  distanceFromWorst: number[]
): number[] {
  const scores: number[] = [];

  for (let i = 0; i < distanceFromBest.length; i++) {
    const sum = distanceFromBest[i] + distanceFromWorst[i];
    scores.push(sum === 0 ? 0 : distanceFromWorst[i] / sum);
  }

  return scores;
}

// Step 6: Calculate rankings (1 = best)
export function calculateRankings(performanceScores: number[]): number[] {
  const indexed = performanceScores.map((score, index) => ({ score, index }));
  indexed.sort((a, b) => b.score - a.score); // Higher score is better
  
  const rankings: number[] = new Array(performanceScores.length);
  indexed.forEach((item, rank) => {
    rankings[item.index] = rank + 1;
  });

  return rankings;
}

// Main TOPSIS calculation function
export function calculateTOPSIS(
  rawMatrix: number[][],
  weights: number[],
  criteriaTypes: ('benefit' | 'cost')[]
): TOPSISResult {
  // Step 1: Normalize
  const normalizedMatrix = normalizeMatrix(rawMatrix);

  // Step 2: Apply weights
  const weightedNormalizedMatrix = applyWeights(normalizedMatrix, weights);

  // Step 3: Find ideal values
  const { idealBest, idealWorst } = findIdealValues(weightedNormalizedMatrix, criteriaTypes);

  // Step 4: Calculate distances
  const { distanceFromBest, distanceFromWorst } = calculateDistances(
    weightedNormalizedMatrix,
    idealBest,
    idealWorst
  );

  // Step 5: Calculate performance scores
  const performanceScores = calculatePerformanceScores(distanceFromBest, distanceFromWorst);

  // Step 6: Calculate rankings
  const rankings = calculateRankings(performanceScores);

  return {
    rawMatrix,
    normalizedMatrix,
    weightedNormalizedMatrix,
    idealBest,
    idealWorst,
    distanceFromBest,
    distanceFromWorst,
    performanceScores,
    rankings,
  };
}
