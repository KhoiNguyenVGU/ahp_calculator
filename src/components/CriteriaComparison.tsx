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
  const handleCellChange = (i: number, j: number, value: string) => {
    const newMatrix = criteriaMatrix.map((row) => [...row]);
    newMatrix[i][j] = value;
    setCriteriaMatrix(newMatrix);
  };

  const getInverseDisplay = (value: string): string => {
    if (!value || value === '1') return '1';
    if (value.startsWith('1/')) {
      return value.substring(2);
    }
    return `1/${value}`;
  };

  return (
    <div className="card max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Compare Criteria</h2>
      <p className="text-gray-600 mb-6">
        Compare each pair of criteria. Ask: "How much more important is the row criterion
        compared to the column criterion?"
      </p>

      {/* Saaty Scale Reference */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Saaty Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <span>1 = Equal</span>
          <span>3 = Moderate</span>
          <span>5 = Strong</span>
          <span>7 = Very Strong</span>
          <span>9 = Extreme</span>
          <span>1/3, 1/5, etc. = Inverse</span>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="overflow-x-auto mb-6">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-sm font-medium text-gray-700"></th>
              {criteria.map((c, i) => (
                <th key={i} className="p-2 text-sm font-medium text-gray-700 text-center">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((rowCriterion, i) => (
              <tr key={i}>
                <td className="p-2 text-sm font-medium text-gray-700">{rowCriterion}</td>
                {criteria.map((_, j) => (
                  <td key={j} className="p-1">
                    {i === j ? (
                      <div className="w-20 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-500">
                        1
                      </div>
                    ) : i < j ? (
                      <select
                        value={criteriaMatrix[i][j]}
                        onChange={(e) => handleCellChange(i, j, e.target.value)}
                        className="matrix-cell"
                      >
                        {saatyScale.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-20 h-10 flex items-center justify-center bg-gray-50 rounded text-gray-500 text-sm">
                        {getInverseDisplay(criteriaMatrix[j][i])}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">How to fill the matrix</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Only fill the upper triangle (above the diagonal)</li>
          <li>The diagonal is always 1 (element compared to itself)</li>
          <li>Lower triangle is automatically calculated as reciprocal</li>
          <li>If row is more important than column, use 1-9</li>
          <li>If column is more important than row, use 1/2 - 1/9</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next: Compare Alternatives →
        </button>
      </div>
    </div>
  );
}
