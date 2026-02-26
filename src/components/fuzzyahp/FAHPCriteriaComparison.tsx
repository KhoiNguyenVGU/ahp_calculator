'use client';

import React from 'react';
import { fahpSaatyScale, fuzzyScale, inverseTFN, formatTFN } from '../../utils/fahp';

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
        const val = criteriaMatrix[i][j];
        // Value must be explicitly set (not undefined, null, or empty)
        if (val === undefined || val === null || val === '') return false;
      }
    }
    return true;
  };

  return (
    <div className="card max-w-6xl mx-auto">
      {/* Intro */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Fuzzy Pairwise Comparison of Criteria
        </h3>
        <p className="text-sm text-blue-700">
          Compare each pair of criteria. Select a value and see its corresponding fuzzy number.
          Inverse values are calculated automatically.
        </p>
      </div>


      {/* Comparison Inputs */}
      <div className="mb-8">
        <h4 className="block text-sm font-medium text-gray-700 mb-3">
          Pairwise Comparisons
        </h4>

        <div className="space-y-2">
          {Array.from({ length: n }).map((_, i) =>
            Array.from({ length: n }).map((_, j) => {
              if (j <= i) return null;
              return (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-700 min-w-[120px]">{criteria[i]}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium text-gray-700 min-w-[120px]">{criteria[j]}</span>

                  <select
                    value={criteriaMatrix[i][j] || '1'}
                    onChange={(e) => updateMatrix(i, j, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm 
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fahpSaatyScale.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-blue-700 min-w-[140px] font-mono">
                    → {getFuzzyDisplay(criteriaMatrix[i][j] || '1')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fuzzy Pairwise Matrix */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Fuzzy Pairwise Comparison Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-blue-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 text-left border-r border-blue-200"></th>
                {criteria.map((c, i) => (
                  <th key={i} className="p-2 text-center border-r border-blue-200 min-w-[140px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((rowCriterion, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="p-2 font-medium border-r border-blue-200 bg-blue-50">
                    {rowCriterion}
                  </td>
                  {criteria.map((_, j) => {
                    let fuzzyValue: string;
                    if (i === j) fuzzyValue = '(1, 1, 1)';
                    else if (i < j)
                      fuzzyValue = getFuzzyDisplay(criteriaMatrix[i][j] || '1');
                    else
                      fuzzyValue = getFuzzyDisplay(
                        getInverseValue(criteriaMatrix[j][i] || '1')
                      );

                    return (
                      <td
                        key={j}
                        className={`p-2 text-center border-r border-blue-200 font-mono text-xs ${
                          i === j ? 'bg-blue-100' : ''
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
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete()}
          className={`btn-primary ${!isComplete() && 'opacity-50 cursor-not-allowed'}`}
        >
          Next: Compare Alternatives →
        </button>
      </div>
    </div>
  );



}
