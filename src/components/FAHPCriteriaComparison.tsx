'use client';

import React from 'react';
import { fahpSaatyScale, fuzzyScale, inverseTFN, formatTFN } from '../utils/fahp';

interface FAHPCriteriaComparisonProps {
  criteria: string[];
  criteriaMatrix: string[][];
  setCriteriaMatrix: (matrix: string[][]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function FAHPCriteriaComparison({
  criteria,
  criteriaMatrix,
  setCriteriaMatrix,
  onBack,
  onNext,
}: FAHPCriteriaComparisonProps) {
  const n = criteria.length;

  const updateMatrix = (i: number, j: number, value: string) => {
    const newMatrix = criteriaMatrix.map(row => [...row]);
    newMatrix[i][j] = value;
    setCriteriaMatrix(newMatrix);
  };

  const getInverseValue = (value: string): string => {
    if (value === '1') return '1';
    if (value.startsWith('1/')) return value.substring(2);
    return `1/${value}`;
  };

  const getFuzzyDisplay = (value: string): string => {
    if (value.startsWith('1/')) {
      const denom = value.substring(2);
      const baseTFN = fuzzyScale[denom] || { l: 1, m: 1, u: 1 };
      return formatTFN(inverseTFN(baseTFN));
    }
    const tfn = fuzzyScale[value] || { l: 1, m: 1, u: 1 };
    return formatTFN(tfn);
  };

  // Check if all comparisons are filled
  const isComplete = () => {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (!criteriaMatrix[i][j]) return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-2">Fuzzy Pairwise Comparison of Criteria</h3>
        <p className="text-sm text-purple-700">
          Compare each pair of criteria. Select a crisp value and see its corresponding fuzzy number.
          The inverse values are calculated automatically.
        </p>
      </div>

      {/* Comparison Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h4 className="font-semibold text-gray-800 mb-4">Pairwise Comparisons</h4>
        {Array.from({ length: n }).map((_, i) =>
          Array.from({ length: n }).map((_, j) => {
            if (j <= i) return null;
            return (
              <div key={`${i}-${j}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 min-w-[120px]">{criteria[i]}</span>
                <span className="text-gray-400">vs</span>
                <span className="font-medium text-gray-700 min-w-[120px]">{criteria[j]}</span>
                <select
                  value={criteriaMatrix[i][j] || '1'}
                  onChange={(e) => updateMatrix(i, j, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {fahpSaatyScale.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-purple-600 min-w-[120px] font-mono">
                  → {getFuzzyDisplay(criteriaMatrix[i][j] || '1')}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Fuzzy Pairwise Matrix Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="font-semibold text-gray-800 mb-4">Fuzzy Pairwise Comparison Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-3 text-left border-r border-purple-200"></th>
                {criteria.map((c, i) => (
                  <th key={i} className="p-3 text-center border-r border-purple-200 min-w-[140px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((rowCriterion, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-medium border-r border-gray-200 bg-purple-50">
                    {rowCriterion}
                  </td>
                  {criteria.map((_, j) => {
                    let fuzzyValue: string;
                    if (i === j) {
                      fuzzyValue = '(1, 1, 1)';
                    } else if (i < j) {
                      fuzzyValue = getFuzzyDisplay(criteriaMatrix[i][j] || '1');
                    } else {
                      fuzzyValue = getFuzzyDisplay(getInverseValue(criteriaMatrix[j][i] || '1'));
                    }
                    return (
                      <td
                        key={j}
                        className={`p-3 text-center border-r border-gray-200 font-mono text-xs ${
                          i === j ? 'bg-purple-100' : ''
                        }`}
                      >
                        {fuzzyValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete()}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            isComplete()
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next: Compare Alternatives →
        </button>
      </div>
    </div>
  );
}
