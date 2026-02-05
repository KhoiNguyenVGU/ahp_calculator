'use client';

import React, { useState, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import InputStep from '@/components/InputStep';
import CriteriaComparison from '@/components/CriteriaComparison';
import AlternativeComparison from '@/components/AlternativeComparison';
import ResultsDisplay from '@/components/ResultsDisplay';
import { calculateAHP, AHPResult } from '@/utils/ahp';

const STEPS = ['Define Problem', 'Compare Criteria', 'Compare Alternatives', 'Results'];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalName, setGoalName] = useState('');
  const [criteria, setCriteria] = useState<string[]>(['', '']);
  const [alternatives, setAlternatives] = useState<string[]>(['', '']);
  const [criteriaMatrix, setCriteriaMatrix] = useState<string[][]>([]);
  const [alternativeMatrices, setAlternativeMatrices] = useState<string[][][]>([]);
  const [results, setResults] = useState<AHPResult | null>(null);

  // Initialize criteria matrix when criteria change
  useEffect(() => {
    const n = criteria.length;
    const newMatrix: string[][] = Array(n)
      .fill(null)
      .map((_, i) =>
        Array(n)
          .fill(null)
          .map((_, j) => (i === j ? '1' : '1'))
      );
    
    // Preserve existing values
    for (let i = 0; i < Math.min(criteriaMatrix.length, n); i++) {
      for (let j = 0; j < Math.min(criteriaMatrix[i].length, n); j++) {
        if (criteriaMatrix[i][j]) {
          newMatrix[i][j] = criteriaMatrix[i][j];
        }
      }
    }
    
    setCriteriaMatrix(newMatrix);
  }, [criteria.length]);

  // Initialize alternative matrices when criteria or alternatives change
  useEffect(() => {
    const numCriteria = criteria.length;
    const numAlternatives = alternatives.length;
    
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
    
    // Preserve existing values
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
  }, [criteria.length, alternatives.length]);

  const handleCalculate = () => {
    const result = calculateAHP(
      criteriaMatrix,
      alternativeMatrices,
      criteria.length,
      alternatives.length
    );
    setResults(result);
    setCurrentStep(3);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setGoalName('');
    setCriteria(['', '']);
    setAlternatives(['', '']);
    setCriteriaMatrix([]);
    setAlternativeMatrices([]);
    setResults(null);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AHP Decision Calculator
          </h1>
          <p className="text-gray-600">
            Analytic Hierarchy Process for Multi-Criteria Decision Making
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        {/* Step Content */}
        {currentStep === 0 && (
          <InputStep
            criteria={criteria}
            setCriteria={setCriteria}
            alternatives={alternatives}
            setAlternatives={setAlternatives}
            goalName={goalName}
            setGoalName={setGoalName}
            onNext={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 1 && (
          <CriteriaComparison
            criteria={criteria}
            criteriaMatrix={criteriaMatrix}
            setCriteriaMatrix={setCriteriaMatrix}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <AlternativeComparison
            criteria={criteria}
            alternatives={alternatives}
            alternativeMatrices={alternativeMatrices}
            setAlternativeMatrices={setAlternativeMatrices}
            onNext={handleCalculate}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && results && (
          <ResultsDisplay
            goalName={goalName}
            criteria={criteria}
            alternatives={alternatives}
            results={results}
            onRestart={handleRestart}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Based on the Analytic Hierarchy Process (AHP) developed by Thomas L. Saaty
          </p>
        </div>
      </div>
    </main>
  );
}
