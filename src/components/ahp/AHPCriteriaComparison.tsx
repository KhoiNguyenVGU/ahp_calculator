'use client';

import React from 'react';
import { saatyScale } from '@/utils/ahp';

interface CriteriaComparisonProps {
  criteria: string[];
  criteriaMatrix: string[][];
  setCriteriaMatrix: (matrix: string[][]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CriteriaComparison({
  criteria,
  criteriaMatrix,
  setCriteriaMatrix,
  onNext,
  onBack,
}: CriteriaComparisonProps) {
  const handlePairChange = (i: number, j: number, value: string) => {
    const newMatrix = criteriaMatrix.map((row) => [...row]);
    newMatrix[i][j] = value;
    // Set reciprocal in the lower triangle
    newMatrix[j][i] = value === '1' ? '1' : value.startsWith('1/') ? value.substring(2) : `1/${value}`;
    setCriteriaMatrix(newMatrix);
  };

  // Generate unique pairs (only upper triangle)
  const getPairs = () => {
    const pairs = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        pairs.push({ i, j, first: criteria[i], second: criteria[j] });
      }
    }
    return pairs;
  };

  const pairs = getPairs();
  const canProceed = pairs.every(p => criteriaMatrix[p.i][p.j] && criteriaMatrix[p.i][p.j] !== '');

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Compare Criteria</h2>
      <p className="text-gray-600 mb-6">
        Compare each pair of criteria by selecting how important one is compared to the other.
      </p>

      {/* Saaty Scale Reference */}
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

      {/* Pairwise Comparisons */}
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
              {saatyScale.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
            {idx < pairs.length - 1 && <div className="mt-3 border-t border-gray-300" />}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 Tips</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Think about which criterion is more important for your decision</li>
          <li>Use the scale: 1 (equal) → 3, 5, 7, 9 (increasingly important) → 1/3–1/9 (less important)</li>
          <li>If the first is less important, select values like 1/3, 1/5, etc.</li>
          <li>Take your time — there are no right or wrong answers, just your preferences</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Compare Alternatives →
        </button>
      </div>
    </div>
  );
}
