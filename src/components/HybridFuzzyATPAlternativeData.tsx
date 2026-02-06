'use client';

import React from 'react';
import QuickScoringInput from '@/components/QuickScoringInput';

interface HybridFuzzyATPAlternativeDataProps {
  criteria: string[];
  alternatives: string[];
  dataMatrix: string[][];
  setDataMatrix: (matrix: string[][]) => void;
  prefilledDataMatrix?: number[][]; // From dataset loader
  onNext: () => void;
  onBack: () => void;
}

export default function HybridFuzzyATPAlternativeData({
  criteria,
  alternatives,
  dataMatrix,
  setDataMatrix,
  prefilledDataMatrix,
  onNext,
  onBack,
}: HybridFuzzyATPAlternativeDataProps) {
  const isComplete = dataMatrix.every(row =>
    row.every(cell => String(cell || '').trim() !== '' && !isNaN(parseFloat(String(cell || '0'))))
  );

  // Function to load prefilled data from dataset
  const loadPrefilledData = () => {
    if (prefilledDataMatrix && prefilledDataMatrix.length > 0) {
      const stringMatrix = prefilledDataMatrix.map(row =>
        row.map(value => value.toString())
      );
      setDataMatrix(stringMatrix);
    }
  };

  // Check if prefilled data is available
  const hasPrefilledData = prefilledDataMatrix && prefilledDataMatrix.length > 0;
  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Fuzzy TOPSIS Phase - Enter Candidate Performance Data
      </h2>
      <p className="text-gray-600 mb-6">
        Score each candidate on each evaluation criterion. 
        The Fuzzy AHP weights (from the previous step) will be automatically applied.
      </p>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> You already determined criteria importance in the Fuzzy AHP phase. 
          Now just rate each candidate fairly and consistently on each criterion.
        </p>
      </div>

      {/* Dataset Notification */}
      {hasPrefilledData && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            📊 Dataset Available
          </h3>
          <p className="text-sm text-purple-800 mb-3">
            We found performance data from your imported dataset that matches your criteria and candidates.
            You can load this data automatically or continue with manual scoring.
          </p>
          <div className="flex gap-3">
            <button
              onClick={loadPrefilledData}
              className="btn-primary bg-purple-600 hover:bg-purple-700 text-white"
            >
              📁 Load Dataset Values
            </button>
            <div className="text-xs text-purple-600 self-center">
              {prefilledDataMatrix?.length} candidates × {criteria.length} criteria
            </div>
          </div>
        </div>
      )}

      <QuickScoringInput
        alternatives={alternatives}
        criteria={criteria}
        dataMatrix={dataMatrix}
        setDataMatrix={setDataMatrix}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          ← Back: Review Criteria
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`btn-primary ${!isComplete && 'opacity-50 cursor-not-allowed'}`}
        >
          Calculate Results →
        </button>
      </div>
    </div>
  );
}

