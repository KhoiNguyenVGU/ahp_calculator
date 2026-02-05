'use client';

import React, { useState, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import InputStep from '@/components/InputStep';
import CriteriaComparison from '@/components/CriteriaComparison';
import AlternativeComparison from '@/components/AlternativeComparison';
import ResultsDisplay from '@/components/ResultsDisplay';
import TOPSISInputStep from '@/components/TOPSISInputStep';
import TOPSISWeightsStep from '@/components/TOPSISWeightsStep';
import TOPSISResultsDisplay from '@/components/TOPSISResultsDisplay';
import { calculateAHP, AHPResult } from '@/utils/ahp';
import { calculateTOPSIS, TOPSISResult } from '@/utils/topsis';

const AHP_STEPS = ['Define Problem', 'Compare Criteria', 'Compare Alternatives', 'Results'];
const TOPSIS_STEPS = ['Enter Data', 'Set Weights', 'Results'];

export default function Home() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'ahp' | 'topsis'>('ahp');

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
              onClick={() => setActiveTab('topsis')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'topsis'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              TOPSIS Method
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

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            AHP: Analytic Hierarchy Process by Thomas L. Saaty
          </p>
          <p>
            TOPSIS: Technique for Order of Preference by Similarity to Ideal Solution
          </p>
        </div>
      </div>
    </main>
  );
}
