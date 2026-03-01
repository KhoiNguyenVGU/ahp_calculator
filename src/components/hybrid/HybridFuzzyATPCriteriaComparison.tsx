'use client';

import React from 'react';
import { ConfidenceKey, fahpSaatyScale } from '@/utils/fahp';

interface HybridFuzzyATPCriteriaComparisonProps {
  criteria: string[];
  criteriaMatrix: string[][];
  setCriteriaMatrix: (matrix: string[][]) => void;
  confidenceMatrix: (ConfidenceKey | undefined)[][];
  setConfidenceMatrix: (matrix: (ConfidenceKey | undefined)[][]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function HybridFuzzyATPCriteriaComparison({
  criteria,
  criteriaMatrix,
  setCriteriaMatrix,
  confidenceMatrix,
  setConfidenceMatrix,
  onNext,
  onBack,
}: HybridFuzzyATPCriteriaComparisonProps) {
  const handlePairChange = (i: number, j: number, value: string) => {
    const newMatrix = criteriaMatrix.map((row) => [...row]);
    newMatrix[i][j] = value;
    newMatrix[j][i] = value === '1' ? '1' : value.startsWith('1/') ? value.substring(2) : `1/${value}`;
    setCriteriaMatrix(newMatrix);
  };

  const handleConfidenceChange = (i: number, j: number, confidence: ConfidenceKey) => {
    const newMatrix = confidenceMatrix.map((row) => [...row]);
    newMatrix[i][j] = confidence;
    newMatrix[j][i] = confidence;
    setConfidenceMatrix(newMatrix);
  };

  const getPairs = () => {
    const pairs: { i: number; j: number; first: string; second: string }[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        pairs.push({ i, j, first: criteria[i], second: criteria[j] });
      }
    }
    return pairs;
  };

  const pairs = getPairs();
  const canProceed = pairs.every((pair) => criteriaMatrix[pair.i]?.[pair.j] && criteriaMatrix[pair.i][pair.j] !== '');

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Fuzzy AHP Phase - Compare Criteria Pairwise
      </h2>
      <p className="text-gray-600 mb-6">
        Rate how much more important each criterion is compared to another.
        Fuzzy AHP will convert these to fuzzy weights.
      </p>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <strong className="text-blue-900">1</strong> = Equal importance
          </div>
          <div>
            <strong className="text-blue-900">3</strong> = Moderate importance
          </div>
          <div>
            <strong className="text-blue-900">5</strong> = Strong importance
          </div>
          <div>
            <strong className="text-blue-900">7</strong> = Very strong importance
          </div>
          <div>
            <strong className="text-blue-900">9</strong> = Extreme importance
          </div>
          <div>
            <strong className="text-blue-900">1/3–1/9</strong> = Reverse (less important)
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {pairs.map((pair, idx) => (
          <div key={`${pair.i}-${pair.j}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="mb-3">
              <p className="text-gray-800 font-medium">
                <span className="text-blue-600 font-semibold">{pair.first}</span> compared to{' '}
                <span className="text-orange-600 font-semibold">{pair.second}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Question: How important is <strong>{pair.first}</strong> relative to{' '}
                <strong>{pair.second}</strong>?
              </p>
            </div>
            <select
              value={criteriaMatrix[pair.i][pair.j] || ''}
              onChange={(e) => handlePairChange(pair.i, pair.j, e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select importance --</option>
              {fahpSaatyScale.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
            <div className="mt-3">
              <label className="block text-xs text-gray-600 mb-1">How confident are you?</label>
              <select
                value={confidenceMatrix[pair.i]?.[pair.j] || 'medium'}
                onChange={(e) => handleConfidenceChange(pair.i, pair.j, e.target.value as ConfidenceKey)}
                className="w-full md:w-[28rem] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low confidence — Use a wider range</option>
                <option value="medium">Medium confidence — Use a moderate range</option>
                <option value="high">High confidence — Use a tight range</option>
              </select>
            </div>
            {idx < pairs.length - 1 && <div className="mt-3 border-t border-gray-300" />}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Enter Alternative Data →
        </button>
      </div>
    </div>
  );

}
