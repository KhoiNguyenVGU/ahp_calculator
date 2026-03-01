// Hybrid Fuzzy AHP-TOPSIS Calculation Utilities
import { TFN, ConfidenceKey, calculateWeightsFromFuzzyMatrix, buildFuzzyMatrix, defuzzify } from './fahp';
import { calculateFuzzyTOPSIS, FuzzyTOPSISResult } from './fuzzyTopsis';

export interface HybridFuzzyATPTopsisResult {
  // From Fuzzy AHP phase
  fuzzyCriteriaMatrix: TFN[][];
  fuzzyAHPWeights: TFN[];
  crispAHPWeights: number[];
  normalizedAHPWeights: number[];
  
  // From Fuzzy TOPSIS phase
  fuzzyTOPSISResult: FuzzyTOPSISResult;
  
  // Combined ranking
  finalRankings: number[];
  finalScores: number[];
  alternativeDetails: Array<{
    name: string;
    rank: number;
    score: number;
    distanceToBest: number;
    distanceToWorst: number;
  }>;
}

/**
 * Calculate Hybrid Fuzzy AHP-TOPSIS
 * Step 1: Use Fuzzy AHP to determine criterion weights
 * Step 2: Use those weights in Fuzzy TOPSIS to rank alternatives
 */
export function calculateHybridFuzzyATPTopsis(
  criteriaMatrix: string[][],
  alternativeDataMatrix: number[][],
  numCriteria: number,
  numAlternatives: number,
  criteriaTypes: ('benefit' | 'cost')[],
  criteriaConfidenceMatrix?: (ConfidenceKey | undefined)[][]
): HybridFuzzyATPTopsisResult {
  // === PHASE 1: Fuzzy AHP - Calculate Criterion Weights ===
  
  // Build fuzzy pairwise comparison matrix for criteria
  const fuzzyCriteriaMatrix = buildFuzzyMatrix(criteriaMatrix, numCriteria, criteriaConfidenceMatrix);
  
  // Calculate weights from the fuzzy matrix
  const ahpWeights = calculateWeightsFromFuzzyMatrix(fuzzyCriteriaMatrix);
  
  // === PHASE 2: Fuzzy TOPSIS - Rank Alternatives ===
  
  // Use the fuzzy weights from Fuzzy AHP in Fuzzy TOPSIS
  const fuzzyTOPSISResult = calculateFuzzyTOPSIS(
    alternativeDataMatrix,
    ahpWeights.fuzzyWeights, // Use fuzzy weights from AHP
    criteriaTypes
  );
  
  // Prepare detailed results
  const alternativeDetails = Array(numAlternatives)
    .fill(null)
    .map((_, index) => ({
      name: `Alternative ${index + 1}`,
      rank: fuzzyTOPSISResult.rankings[index],
      score: fuzzyTOPSISResult.performanceScores[index],
      distanceToBest: fuzzyTOPSISResult.crispDistanceFromBest[index],
      distanceToWorst: fuzzyTOPSISResult.crispDistanceFromWorst[index],
    }))
    .sort((a, b) => a.rank - b.rank);
  
  return {
    // Fuzzy AHP outputs
    fuzzyCriteriaMatrix,
    fuzzyAHPWeights: ahpWeights.fuzzyWeights,
    crispAHPWeights: ahpWeights.crispWeights,
    normalizedAHPWeights: ahpWeights.normalizedWeights,
    
    // Fuzzy TOPSIS outputs
    fuzzyTOPSISResult,
    
    // Combined results
    finalRankings: fuzzyTOPSISResult.rankings,
    finalScores: fuzzyTOPSISResult.performanceScores,
    alternativeDetails,
  };
}

// Format weight for display
export function formatWeight(tfn: TFN, decimals: number = 3): string {
  return `(${tfn.l.toFixed(decimals)}, ${tfn.m.toFixed(decimals)}, ${tfn.u.toFixed(decimals)})`;
}
