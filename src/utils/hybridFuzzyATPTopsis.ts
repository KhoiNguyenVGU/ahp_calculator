// Hybrid Fuzzy AHP + TOPSIS Calculation Utilities
import { TFN, ConfidenceKey, calculateWeightsFromFuzzyMatrix, buildFuzzyMatrix } from './fahp';
import { calculateTOPSIS, TOPSISResult } from './topsis';

export interface HybridFuzzyATPTopsisResult {
  // From Fuzzy AHP phase
  fuzzyCriteriaMatrix: TFN[][];
  fuzzyAHPWeights: TFN[];
  crispAHPWeights: number[];
  normalizedAHPWeights: number[];
  
  // From TOPSIS phase
  topsisResult: TOPSISResult;
  
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
 * Calculate Hybrid Fuzzy AHP + TOPSIS
 * Step 1: Use Fuzzy AHP to determine criterion weights
 * Step 2: Use crisp normalized AHP weights in TOPSIS to rank alternatives
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
  
  // === PHASE 2: TOPSIS - Rank Alternatives ===
  // Use normalized crisp weights derived from Fuzzy AHP.
  const topsisResult = calculateTOPSIS(
    alternativeDataMatrix,
    ahpWeights.normalizedWeights,
    criteriaTypes
  );
  
  // Prepare detailed results
  const alternativeDetails = Array(numAlternatives)
    .fill(null)
    .map((_, index) => ({
      name: `Alternative ${index + 1}`,
      rank: topsisResult.rankings[index],
      score: topsisResult.performanceScores[index],
      distanceToBest: topsisResult.distanceFromBest[index],
      distanceToWorst: topsisResult.distanceFromWorst[index],
    }))
    .sort((a, b) => a.rank - b.rank);
  
  return {
    // Fuzzy AHP outputs
    fuzzyCriteriaMatrix,
    fuzzyAHPWeights: ahpWeights.fuzzyWeights,
    crispAHPWeights: ahpWeights.crispWeights,
    normalizedAHPWeights: ahpWeights.normalizedWeights,
    
    // TOPSIS outputs
    topsisResult,
    
    // Combined results
    finalRankings: topsisResult.rankings,
    finalScores: topsisResult.performanceScores,
    alternativeDetails,
  };
}

// Format weight for display
export function formatWeight(tfn: TFN, decimals: number = 3): string {
  return `(${tfn.l.toFixed(decimals)}, ${tfn.m.toFixed(decimals)}, ${tfn.u.toFixed(decimals)})`;
}
