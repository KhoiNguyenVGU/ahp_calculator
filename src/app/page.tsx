'use client';

import React, { useState, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import InputStep from '@/components/ahp/AHPInputStep';
import CriteriaComparison from '@/components/ahp/AHPCriteriaComparison';
import AlternativeComparison from '@/components/ahp/AHPAlternativeComparison';
import ResultsDisplay from '@/components/ahp/AHPResultsDisplay';
import TOPSISInputStep from '@/components/topsis/TOPSISInputStep';
import TOPSISWeightsStep from '@/components/topsis/TOPSISWeightsStep';
import TOPSISResultsDisplay from '@/components/topsis/TOPSISResultsDisplay';
import FAHPInputStep from '@/components/fuzzyahp/FAHPInputStep';
import FAHPCriteriaComparison from '@/components/fuzzyahp/FAHPCriteriaComparison';
import FAHPAlternativeComparison from '@/components/fuzzyahp/FAHPAlternativeComparison';
import FAHPResultsDisplay from '@/components/fuzzyahp/FAHPResultsDisplay';
import FuzzyTOPSISInputStep from '@/components/fuzzytopsis/FuzzyTOPSISInputStep';
import FuzzyTOPSISWeightsStep from '@/components/fuzzytopsis/FuzzyTOPSISWeightsStep';
import FuzzyTOPSISResultsDisplay from '@/components/fuzzytopsis/FuzzyTOPSISResultsDisplay';
import HybridFuzzyATPInputStep from '@/components/hybrid/HybridFuzzyATPInputStep';
import HybridFuzzyATPCriteriaComparison from '@/components/hybrid/HybridFuzzyATPCriteriaComparison';
import HybridFuzzyATPAlternativeData from '@/components/hybrid/HybridFuzzyATPAlternativeData';
import HybridFuzzyATPResultsDisplay from '@/components/hybrid/HybridFuzzyATPResultsDisplay';
import { calculateAHP, AHPResult } from '@/utils/ahp';
import { calculateTOPSIS, TOPSISResult } from '@/utils/topsis';
import { calculateFAHP, FAHPResult } from '@/utils/fahp';
import { calculateFuzzyTOPSIS, FuzzyTOPSISResult } from '@/utils/fuzzyTopsis';
import { calculateHybridFuzzyATPTopsis, HybridFuzzyATPTopsisResult } from '@/utils/hybridFuzzyATPTopsis';
import { TFN } from '@/utils/fahp';

const AHP_STEPS = ['Define Problem', 'Compare Criteria', 'Compare Alternatives', 'Results'];
const TOPSIS_STEPS = ['Enter Data', 'Set Weights', 'Results'];
const FAHP_STEPS = ['Define Problem', 'Compare Criteria', 'Compare Alternatives', 'Results'];
const FUZZY_TOPSIS_STEPS = ['Enter Data', 'Set Fuzzy Weights', 'Results'];
const HYBRID_FUZZY_ATP_STEPS = ['Define Problem', 'Compare Criteria (Fuzzy AHP)', 'Enter Alternative Data (Fuzzy TOPSIS)', 'Results'];

export default function Home() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'ahp' | 'topsis' | 'fahp' | 'fuzzy-topsis' | 'hybrid-fuzzy-atp'>('ahp');

  // AHP State
  const [ahpStep, setAhpStep] = useState(0);
  const [goalName, setGoalName] = useState('');
  const [ahpCriteria, setAhpCriteria] = useState<string[]>(['', '']);
  const [ahpAlternatives, setAhpAlternatives] = useState<string[]>(['', '']);
  const [criteriaMatrix, setCriteriaMatrix] = useState<string[][]>([]);
  const [alternativeMatrices, setAlternativeMatrices] = useState<string[][][]>([]);
  const [ahpResults, setAhpResults] = useState<AHPResult | null>(null);

  // TOPSIS State
  const [topsisStep, setTopsisStep] = useState(0);
  const [topsisCriteria, setTopsisCriteria] = useState<string[]>(['', '']);
  const [topsisAlternatives, setTopsisAlternatives] = useState<string[]>(['', '']);
  const [criteriaTypes, setCriteriaTypes] = useState<('benefit' | 'cost')[]>(['benefit', 'benefit']);
  const [dataMatrix, setDataMatrix] = useState<string[][]>([['', ''], ['', '']]);
  const [topsisWeights, setTopsisWeights] = useState<string[]>(['0.5', '0.5']);
  const [topsisResults, setTopsisResults] = useState<TOPSISResult | null>(null);

  // FAHP State
  const [fahpStep, setFahpStep] = useState(0);
  const [fahpGoal, setFahpGoal] = useState('');
  const [fahpCriteria, setFahpCriteria] = useState<string[]>(['', '']);
  const [fahpAlternatives, setFahpAlternatives] = useState<string[]>(['', '']);
  const [fahpCriteriaMatrix, setFahpCriteriaMatrix] = useState<string[][]>([]);
  const [fahpAlternativeMatrices, setFahpAlternativeMatrices] = useState<string[][][]>([]);
  const [fahpResults, setFahpResults] = useState<FAHPResult | null>(null);

  // Fuzzy TOPSIS State
  const [fuzzyTopsisStep, setFuzzyTopsisStep] = useState(0);
  const [fuzzyTopsisCriteria, setFuzzyTopsisCriteria] = useState<string[]>(['', '']);
  const [fuzzyTopsisAlternatives, setFuzzyTopsisAlternatives] = useState<string[]>(['', '']);
  const [fuzzyTopsisCriteriaTypes, setFuzzyTopsisCriteriaTypes] = useState<('benefit' | 'cost')[]>(['benefit', 'benefit']);
  const emptyFuzzyValue = (): TFN => ({ l: Number.NaN, m: Number.NaN, u: Number.NaN });
  const [fuzzyTopsisDataMatrix, setFuzzyTopsisDataMatrix] = useState<TFN[][]>([
    [emptyFuzzyValue(), emptyFuzzyValue()],
    [emptyFuzzyValue(), emptyFuzzyValue()],
  ]);
  const [fuzzyTopsisWeights, setFuzzyTopsisWeights] = useState<TFN[]>([
    { l: 0.3, m: 0.5, u: 0.7 },
    { l: 0.3, m: 0.5, u: 0.7 },
  ]);
  const [fuzzyTopsisResults, setFuzzyTopsisResults] = useState<FuzzyTOPSISResult | null>(null);

  // Hybrid Fuzzy AHP-TOPSIS State
  const [hybridStep, setHybridStep] = useState(0);
  const [hybridGoal, setHybridGoal] = useState('');
  const [hybridCriteria, setHybridCriteria] = useState<string[]>(['', '']);
  const [hybridAlternatives, setHybridAlternatives] = useState<string[]>(['', '']);
  const [hybridCriteriaTypes, setHybridCriteriaTypes] = useState<('benefit' | 'cost')[]>(['benefit', 'benefit']);
  const [hybridCriteriaMatrix, setHybridCriteriaMatrix] = useState<string[][]>([]);
  const [hybridAlternativeDataMatrix, setHybridAlternativeDataMatrix] = useState<string[][]>([]);
  const [hybridDataMatrix, setHybridDataMatrix] = useState<number[][]>([]);
  const [hybridResults, setHybridResults] = useState<HybridFuzzyATPTopsisResult | null>(null);

  // Initialize AHP criteria matrix when criteria change
  useEffect(() => {
    const n = ahpCriteria.length;
    const newMatrix: string[][] = Array(n)
      .fill(null)
      .map((_, i) =>
        Array(n)
          .fill(null)
          .map((_, j) => (i === j ? '1' : '1'))
      );
    
    for (let i = 0; i < Math.min(criteriaMatrix.length, n); i++) {
      for (let j = 0; j < Math.min(criteriaMatrix[i].length, n); j++) {
        if (criteriaMatrix[i][j]) {
          newMatrix[i][j] = criteriaMatrix[i][j];
        }
      }
    }
    
    setCriteriaMatrix(newMatrix);
  }, [ahpCriteria.length]);

  // Initialize AHP alternative matrices
  useEffect(() => {
    const numCriteria = ahpCriteria.length;
    const numAlternatives = ahpAlternatives.length;
    
    const newMatrices: string[][][] = Array(numCriteria)
      .fill(null)
      .map((_, c) =>
        Array(numAlternatives)
          .fill(null)
          .map((_, i) =>
            Array(numAlternatives)
              .fill(null)
              .map((_, j) => (i === j ? '1' : '1'))
          )
      );
    
    for (let c = 0; c < Math.min(alternativeMatrices.length, numCriteria); c++) {
      for (let i = 0; i < Math.min(alternativeMatrices[c]?.length || 0, numAlternatives); i++) {
        for (let j = 0; j < Math.min(alternativeMatrices[c]?.[i]?.length || 0, numAlternatives); j++) {
          if (alternativeMatrices[c]?.[i]?.[j]) {
            newMatrices[c][i][j] = alternativeMatrices[c][i][j];
          }
        }
      }
    }
    
    setAlternativeMatrices(newMatrices);
  }, [ahpCriteria.length, ahpAlternatives.length]);

  // Initialize TOPSIS weights when criteria change
  useEffect(() => {
    const n = topsisCriteria.length;
    const equalWeight = (1 / n).toFixed(4);
    setTopsisWeights(Array(n).fill(equalWeight));
  }, [topsisCriteria.length]);

  // Initialize FAHP criteria matrix when criteria change
  useEffect(() => {
    const n = fahpCriteria.length;
    const newMatrix: string[][] = Array(n)
      .fill(null)
      .map((_, i) =>
        Array(n)
          .fill(null)
          .map((_, j) => (i === j ? '1' : '1'))
      );
    
    for (let i = 0; i < Math.min(fahpCriteriaMatrix.length, n); i++) {
      for (let j = 0; j < Math.min(fahpCriteriaMatrix[i].length, n); j++) {
        if (fahpCriteriaMatrix[i][j]) {
          newMatrix[i][j] = fahpCriteriaMatrix[i][j];
        }
      }
    }
    
    setFahpCriteriaMatrix(newMatrix);
  }, [fahpCriteria.length]);

  // Initialize FAHP alternative matrices
  useEffect(() => {
    const numCriteria = fahpCriteria.length;
    const numAlternatives = fahpAlternatives.length;
    
    const newMatrices: string[][][] = Array(numCriteria)
      .fill(null)
      .map((_, c) =>
        Array(numAlternatives)
          .fill(null)
          .map((_, i) =>
            Array(numAlternatives)
              .fill(null)
              .map((_, j) => (i === j ? '1' : '1'))
          )
      );
    
    for (let c = 0; c < Math.min(fahpAlternativeMatrices.length, numCriteria); c++) {
      for (let i = 0; i < Math.min(fahpAlternativeMatrices[c]?.length || 0, numAlternatives); i++) {
        for (let j = 0; j < Math.min(fahpAlternativeMatrices[c]?.[i]?.length || 0, numAlternatives); j++) {
          if (fahpAlternativeMatrices[c]?.[i]?.[j]) {
            newMatrices[c][i][j] = fahpAlternativeMatrices[c][i][j];
          }
        }
      }
    }
    
    setFahpAlternativeMatrices(newMatrices);
  }, [fahpCriteria.length, fahpAlternatives.length]);

  // Initialize Fuzzy TOPSIS data matrix when criteria/alternatives change
  useEffect(() => {
    const numAlternatives = fuzzyTopsisAlternatives.length;
    const numCriteria = fuzzyTopsisCriteria.length;
    const newMatrix: TFN[][] = Array(numAlternatives)
      .fill(null)
      .map(() => Array.from({ length: numCriteria }, () => emptyFuzzyValue()));

    for (let i = 0; i < Math.min(fuzzyTopsisDataMatrix.length, numAlternatives); i++) {
      for (let j = 0; j < Math.min(fuzzyTopsisDataMatrix[i].length, numCriteria); j++) {
        const cell = fuzzyTopsisDataMatrix[i][j];
        if (cell) {
          newMatrix[i][j] = { ...cell };
        }
      }
    }

    setFuzzyTopsisDataMatrix(newMatrix);
  }, [fuzzyTopsisCriteria.length, fuzzyTopsisAlternatives.length]);

  // Initialize Fuzzy TOPSIS weights when criteria change
  useEffect(() => {
    const n = fuzzyTopsisCriteria.length;
    const defaultWeight: TFN = { l: 0.3, m: 0.5, u: 0.7 };
    if (fuzzyTopsisWeights.length !== n) {
      setFuzzyTopsisWeights(Array(n).fill(defaultWeight).map(() => ({ ...defaultWeight })));
    }
  }, [fuzzyTopsisCriteria.length]);

  // Initialize Hybrid criteria matrix when criteria change
  useEffect(() => {
    const n = hybridCriteria.length;
    const newMatrix: string[][] = Array(n)
      .fill(null)
      .map((_, i) =>
        Array(n)
          .fill(null)
          .map((_, j) => (i === j ? '1' : '1'))
      );

    for (let i = 0; i < Math.min(hybridCriteriaMatrix.length, n); i++) {
      for (let j = 0; j < Math.min(hybridCriteriaMatrix[i].length, n); j++) {
        if (hybridCriteriaMatrix[i][j]) {
          newMatrix[i][j] = hybridCriteriaMatrix[i][j];
        }
      }
    }

    setHybridCriteriaMatrix(newMatrix);
  }, [hybridCriteria.length]);

  // Initialize Hybrid alternative data matrix when alternatives/criteria change
  useEffect(() => {
    const numAlternatives = hybridAlternatives.length;
    const numCriteria = hybridCriteria.length;
    const newMatrix: string[][] = Array(numAlternatives)
      .fill(null)
      .map(() => Array(numCriteria).fill(''));

    for (let i = 0; i < Math.min(hybridAlternativeDataMatrix.length, numAlternatives); i++) {
      for (let j = 0; j < Math.min(hybridAlternativeDataMatrix[i].length, numCriteria); j++) {
        if (hybridAlternativeDataMatrix[i][j]) {
          newMatrix[i][j] = hybridAlternativeDataMatrix[i][j];
        }
      }
    }

    setHybridAlternativeDataMatrix(newMatrix);
  }, [hybridCriteria.length, hybridAlternatives.length]);

  // AHP calculate
  const handleAHPCalculate = () => {
    const result = calculateAHP(
      criteriaMatrix,
      alternativeMatrices,
      ahpCriteria.length,
      ahpAlternatives.length
    );
    setAhpResults(result);
    setAhpStep(3);
  };

  // TOPSIS calculate
  const handleTOPSISCalculate = () => {
    const rawMatrix = dataMatrix.map(row => row.map(cell => parseFloat(cell)));
    const weights = topsisWeights.map(w => parseFloat(w));
    
    const result = calculateTOPSIS(rawMatrix, weights, criteriaTypes);
    setTopsisResults(result);
    setTopsisStep(2);
  };

  // Reset functions
  const handleAHPRestart = () => {
    setAhpStep(0);
    setGoalName('');
    setAhpCriteria(['', '']);
    setAhpAlternatives(['', '']);
    setCriteriaMatrix([]);
    setAlternativeMatrices([]);
    setAhpResults(null);
  };

  const handleTOPSISRestart = () => {
    setTopsisStep(0);
    setTopsisCriteria(['', '']);
    setTopsisAlternatives(['', '']);
    setCriteriaTypes(['benefit', 'benefit']);
    setDataMatrix([['', ''], ['', '']]);
    setTopsisWeights(['0.5', '0.5']);
    setTopsisResults(null);
  };

  // FAHP calculate
  const handleFAHPCalculate = () => {
    const result = calculateFAHP(
      fahpCriteriaMatrix,
      fahpAlternativeMatrices,
      fahpCriteria.length,
      fahpAlternatives.length
    );
    setFahpResults(result);
    setFahpStep(3);
  };

  const handleFAHPRestart = () => {
    setFahpStep(0);
    setFahpGoal('');
    setFahpCriteria(['', '']);
    setFahpAlternatives(['', '']);
    setFahpCriteriaMatrix([]);
    setFahpAlternativeMatrices([]);
    setFahpResults(null);
  };

  // Fuzzy TOPSIS calculate
  const handleFuzzyTOPSISCalculate = () => {
    const result = calculateFuzzyTOPSIS(fuzzyTopsisDataMatrix, fuzzyTopsisWeights, fuzzyTopsisCriteriaTypes);
    setFuzzyTopsisResults(result);
    setFuzzyTopsisStep(2);
  };

  const handleFuzzyTOPSISRestart = () => {
    setFuzzyTopsisStep(0);
    setFuzzyTopsisCriteria(['', '']);
    setFuzzyTopsisAlternatives(['', '']);
    setFuzzyTopsisCriteriaTypes(['benefit', 'benefit']);
    setFuzzyTopsisDataMatrix([
      [emptyFuzzyValue(), emptyFuzzyValue()],
      [emptyFuzzyValue(), emptyFuzzyValue()],
    ]);
    setFuzzyTopsisWeights([
      { l: 0.3, m: 0.5, u: 0.7 },
      { l: 0.3, m: 0.5, u: 0.7 },
    ]);
    setFuzzyTopsisResults(null);
  };

  // Hybrid Fuzzy AHP-TOPSIS calculate
  const handleHybridCalculate = () => {
    const rawAlternativeMatrix = hybridAlternativeDataMatrix.map(row =>
      row.map(cell => parseFloat(cell))
    );

    const result = calculateHybridFuzzyATPTopsis(
      hybridCriteriaMatrix,
      rawAlternativeMatrix,
      hybridCriteria.length,
      hybridAlternatives.length,
      hybridCriteriaTypes
    );
    setHybridResults(result);
    setHybridStep(3);
  };

  const handleHybridRestart = () => {
    setHybridStep(0);
    setHybridGoal('');
    setHybridCriteria(['', '']);
    setHybridAlternatives(['', '']);
    setHybridCriteriaTypes(['benefit', 'benefit']);
    setHybridCriteriaMatrix([]);
    setHybridAlternativeDataMatrix([]);
    setHybridDataMatrix([]);
    setHybridResults(null);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Decision Making Calculator
          </h1>
          <p className="text-gray-600">
            Multi-Criteria Decision Analysis Tools
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ahp')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'ahp'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              AHP Method
            </button>

            <button
              onClick={() => setActiveTab('fahp')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'fahp'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Fuzzy AHP
            </button>

            <button
              onClick={() => setActiveTab('topsis')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'topsis'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              TOPSIS Method
            </button>

            <button
              onClick={() => setActiveTab('fuzzy-topsis')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'fuzzy-topsis'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Fuzzy TOPSIS
            </button>

            <button
              onClick={() => setActiveTab('hybrid-fuzzy-atp')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'hybrid-fuzzy-atp'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Hybrid Fuzzy AHP-TOPSIS
            </button>
          </div>
        </div>


        {/* AHP Tab Content */}
        {activeTab === 'ahp' && (
          <>
            <StepIndicator currentStep={ahpStep} steps={AHP_STEPS} />

            {ahpStep === 0 && (
              <InputStep
                criteria={ahpCriteria}
                setCriteria={setAhpCriteria}
                alternatives={ahpAlternatives}
                setAlternatives={setAhpAlternatives}
                goalName={goalName}
                setGoalName={setGoalName}
                onNext={() => setAhpStep(1)}
              />
            )}

            {ahpStep === 1 && (
              <CriteriaComparison
                criteria={ahpCriteria}
                criteriaMatrix={criteriaMatrix}
                setCriteriaMatrix={setCriteriaMatrix}
                onNext={() => setAhpStep(2)}
                onBack={() => setAhpStep(0)}
              />
            )}

            {ahpStep === 2 && (
              <AlternativeComparison
                criteria={ahpCriteria}
                alternatives={ahpAlternatives}
                alternativeMatrices={alternativeMatrices}
                setAlternativeMatrices={setAlternativeMatrices}
                onNext={handleAHPCalculate}
                onBack={() => setAhpStep(1)}
              />
            )}

            {ahpStep === 3 && ahpResults && (
              <ResultsDisplay
                goalName={goalName}
                criteria={ahpCriteria}
                alternatives={ahpAlternatives}
                results={ahpResults}
                onRestart={handleAHPRestart}
              />
            )}
          </>
        )}

        {/* TOPSIS Tab Content */}
        {activeTab === 'topsis' && (
          <>
            <StepIndicator currentStep={topsisStep} steps={TOPSIS_STEPS} />

            {topsisStep === 0 && (
              <TOPSISInputStep
                criteria={topsisCriteria}
                setCriteria={setTopsisCriteria}
                alternatives={topsisAlternatives}
                setAlternatives={setTopsisAlternatives}
                criteriaTypes={criteriaTypes}
                setCriteriaTypes={setCriteriaTypes}
                dataMatrix={dataMatrix}
                setDataMatrix={setDataMatrix}
                onNext={() => setTopsisStep(1)}
              />
            )}

            {topsisStep === 1 && (
              <TOPSISWeightsStep
                criteria={topsisCriteria}
                weights={topsisWeights}
                setWeights={setTopsisWeights}
                onNext={handleTOPSISCalculate}
                onBack={() => setTopsisStep(0)}
              />
            )}

            {topsisStep === 2 && topsisResults && (
              <TOPSISResultsDisplay
                criteria={topsisCriteria}
                alternatives={topsisAlternatives}
                criteriaTypes={criteriaTypes}
                weights={topsisWeights.map(w => parseFloat(w))}
                results={topsisResults}
                onRestart={handleTOPSISRestart}
              />
            )}
          </>
        )}

        {/* FAHP Tab Content */}
        {activeTab === 'fahp' && (
          <>
            <StepIndicator currentStep={fahpStep} steps={FAHP_STEPS} />

            {fahpStep === 0 && (
              <FAHPInputStep
                goal={fahpGoal}
                setGoal={setFahpGoal}
                criteria={fahpCriteria}
                setCriteria={setFahpCriteria}
                alternatives={fahpAlternatives}
                setAlternatives={setFahpAlternatives}
                onNext={() => setFahpStep(1)}
              />
            )}

            {fahpStep === 1 && (
              <FAHPCriteriaComparison
                criteria={fahpCriteria}
                criteriaMatrix={fahpCriteriaMatrix}
                setCriteriaMatrix={setFahpCriteriaMatrix}
                onBack={() => setFahpStep(0)}
                onNext={() => setFahpStep(2)}
              />
            )}

            {fahpStep === 2 && (
              <FAHPAlternativeComparison
                criteria={fahpCriteria}
                alternatives={fahpAlternatives}
                alternativeMatrices={fahpAlternativeMatrices}
                setAlternativeMatrices={setFahpAlternativeMatrices}
                onBack={() => setFahpStep(1)}
                onCalculate={handleFAHPCalculate}
              />
            )}

            {fahpStep === 3 && fahpResults && (
              <FAHPResultsDisplay
                result={fahpResults}
                criteria={fahpCriteria}
                alternatives={fahpAlternatives}
                goal={fahpGoal}
                onReset={handleFAHPRestart}
              />
            )}
          </>
        )}

        {/* Fuzzy TOPSIS Tab Content */}
        {activeTab === 'fuzzy-topsis' && (
          <>
            <StepIndicator currentStep={fuzzyTopsisStep} steps={FUZZY_TOPSIS_STEPS} />

            {fuzzyTopsisStep === 0 && (
              <FuzzyTOPSISInputStep
                criteria={fuzzyTopsisCriteria}
                setCriteria={setFuzzyTopsisCriteria}
                alternatives={fuzzyTopsisAlternatives}
                setAlternatives={setFuzzyTopsisAlternatives}
                criteriaTypes={fuzzyTopsisCriteriaTypes}
                setCriteriaTypes={setFuzzyTopsisCriteriaTypes}
                dataMatrix={fuzzyTopsisDataMatrix}
                setDataMatrix={setFuzzyTopsisDataMatrix}
                onNext={() => setFuzzyTopsisStep(1)}
              />
            )}

            {fuzzyTopsisStep === 1 && (
              <FuzzyTOPSISWeightsStep
                criteria={fuzzyTopsisCriteria}
                fuzzyWeights={fuzzyTopsisWeights}
                setFuzzyWeights={setFuzzyTopsisWeights}
                onBack={() => setFuzzyTopsisStep(0)}
                onNext={handleFuzzyTOPSISCalculate}
              />
            )}

            {fuzzyTopsisStep === 2 && fuzzyTopsisResults && (
              <FuzzyTOPSISResultsDisplay
                result={fuzzyTopsisResults}
                criteria={fuzzyTopsisCriteria}
                alternatives={fuzzyTopsisAlternatives}
                criteriaTypes={fuzzyTopsisCriteriaTypes}
                fuzzyWeights={fuzzyTopsisWeights}
                onReset={handleFuzzyTOPSISRestart}
              />
            )}
          </>
        )}

        {/* Hybrid Fuzzy AHP-TOPSIS Tab Content */}
        {activeTab === 'hybrid-fuzzy-atp' && (
          <>
            <StepIndicator currentStep={hybridStep} steps={HYBRID_FUZZY_ATP_STEPS} />

            {hybridStep === 0 && (
              <HybridFuzzyATPInputStep
                goal={hybridGoal}
                setGoal={setHybridGoal}
                criteria={hybridCriteria}
                setCriteria={setHybridCriteria}
                alternatives={hybridAlternatives}
                setAlternatives={setHybridAlternatives}
                criteriaTypes={hybridCriteriaTypes}
                setCriteriaTypes={setHybridCriteriaTypes}
                dataMatrix={hybridDataMatrix}
                setDataMatrix={setHybridDataMatrix}
                onNext={() => setHybridStep(1)}
              />
            )}

            {hybridStep === 1 && (
              <HybridFuzzyATPCriteriaComparison
                criteria={hybridCriteria}
                criteriaMatrix={hybridCriteriaMatrix}
                setCriteriaMatrix={setHybridCriteriaMatrix}
                onNext={() => setHybridStep(2)}
                onBack={() => setHybridStep(0)}
              />
            )}

            {hybridStep === 2 && (
              <HybridFuzzyATPAlternativeData
                criteria={hybridCriteria}
                alternatives={hybridAlternatives}
                dataMatrix={hybridAlternativeDataMatrix}
                setDataMatrix={setHybridAlternativeDataMatrix}
                prefilledDataMatrix={hybridDataMatrix}
                onNext={handleHybridCalculate}
                onBack={() => setHybridStep(1)}
              />
            )}

            {hybridStep === 3 && hybridResults && (
              <HybridFuzzyATPResultsDisplay
                result={hybridResults}
                goal={hybridGoal}
                criteria={hybridCriteria}
                alternatives={hybridAlternatives}
                criteriaTypes={hybridCriteriaTypes}
                onReset={handleHybridRestart}
              />
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            AHP: Analytic Hierarchy Process by Thomas L. Saaty
          </p>
          <p>
            Fuzzy AHP: Extension using Triangular Fuzzy Numbers for uncertainty handling
          </p>
          <p>
            TOPSIS: Technique for Order of Preference by Similarity to Ideal Solution
          </p>
          <p>
            Fuzzy TOPSIS: Combines Fuzzy Logic with TOPSIS for uncertain decision making
          </p>
          <p>
            Hybrid Fuzzy AHP-TOPSIS: Integrated approach combining Fuzzy AHP weights with Fuzzy TOPSIS ranking
          </p>
        </div>
      </div>
    </main>
  );
}
