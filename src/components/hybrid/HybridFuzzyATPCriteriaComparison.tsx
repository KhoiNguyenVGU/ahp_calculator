'use client';

import React, { useState } from 'react';
import { fahpSaatyScale } from '@/utils/fahp';

interface HybridFuzzyATPCriteriaComparisonProps {
  criteria: string[];
  criteriaMatrix: string[][];
  setCriteriaMatrix: (matrix: string[][]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function HybridFuzzyATPCriteriaComparison({
  criteria,
  criteriaMatrix,
  setCriteriaMatrix,
  onNext,
  onBack,
}: HybridFuzzyATPCriteriaComparisonProps) {
  const n = criteria.length;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    setIsProcessing(true);
    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(() => {
      onNext();
      setIsProcessing(false);
    }, 100);
  };

  const handleValueChange = (i: number, j: number, value: string) => {
    const newMatrix = criteriaMatrix.map(row => [...row]);
    newMatrix[i][j] = value;
    if (i !== j) {
      // Update inverse in lower triangle
      const parts = value.split('/');
      if (parts.length === 2 && parts[0] === '1') {
        newMatrix[j][i] = parts[1];
      } else if (value === '1') {
        newMatrix[j][i] = '1';
      } else {
        newMatrix[j][i] = `1/${value}`;
      }
    }
    setCriteriaMatrix(newMatrix);
  };

  const isComplete = criteriaMatrix.every(row => row.every(val => val !== ''));

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Fuzzy AHP Phase - Compare Criteria Pairwise
      </h2>
      <p className="text-gray-600 mb-6">
        Rate how much more important each criterion is compared to another.
        Fuzzy AHP will convert these to fuzzy weights.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-3 text-left font-medium text-gray-700">
                    Comparison
                  </th>
                  {criteria.map((crit, j) => (
                    <th
                      key={j}
                      className="border px-4 py-3 text-left font-medium text-gray-700 text-sm"
                    >
                      {crit}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((critI, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-4 py-3 font-medium text-gray-800 bg-gray-50">
                      {critI}
                    </td>
                    {criteria.map((critJ, j) => (
                      <td key={j} className="border px-4 py-3">
                        {i === j ? (
                          <div className="bg-gray-100 px-3 py-2 rounded-lg text-center font-semibold text-gray-600">
                            1
                          </div>
                        ) : i < j ? (
                          <select
                            value={criteriaMatrix[i][j] || '1'}
                            onChange={(e) => handleValueChange(i, j, e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {fahpSaatyScale.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.value}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="bg-blue-50 px-3 py-2 rounded-lg text-center text-sm text-blue-700 font-mono">
                            {criteriaMatrix[i][j] || '1'}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scale Legend */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Saaty Scale</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div><strong>1</strong> = Equal</div>
            <div><strong>3</strong> = Moderate</div>
            <div><strong>5</strong> = Strong</div>
            <div><strong>7</strong> = Very strong</div>
            <div><strong>9</strong> = Extreme</div>
            <hr className="my-2" />
            <p>Use 1/n for inverse values (e.g., 1/3 if less important)</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Fuzzy Conversion:</strong> Ratings are converted to
          Triangular Fuzzy Numbers (L, M, U). Example: 5 → (4, 5, 6)
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary" disabled={isProcessing}>
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isComplete || isProcessing}
          className="btn-primary"
        >
          {isProcessing ? 'Processing...' : 'Enter Alternative Data →'}
        </button>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full animate-pulse"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            Processing large dataset, please wait...
          </p>
        </div>
      )}
    </div>
  );

}
