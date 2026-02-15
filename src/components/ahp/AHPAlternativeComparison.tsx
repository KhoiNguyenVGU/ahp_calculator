'use client';

import React, { useState } from 'react';
import { saatyScale } from '@/utils/ahp';

interface AlternativeComparisonProps {
  criteria: string[];
  alternatives: string[];
  alternativeMatrices: string[][][];
  setAlternativeMatrices: (matrices: string[][][]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AlternativeComparison({
  criteria,
  alternatives,
  alternativeMatrices,
  setAlternativeMatrices,
  onNext,
  onBack,
}: AlternativeComparisonProps) {
  const [currentCriterion, setCurrentCriterion] = useState(0);

  const handleCellChange = (
    criterionIndex: number,
    i: number,
    j: number,
    value: string
  ) => {
    const newMatrices = alternativeMatrices.map((matrix) =>
      matrix.map((row) => [...row])
    );
    newMatrices[criterionIndex][i][j] = value;
    setAlternativeMatrices(newMatrices);
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
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Compare Alternatives</h2>
      <p className="text-gray-600 mb-6">
        For each criterion, compare how well each alternative performs.
      </p>

      {/* Criterion Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {criteria.map((criterion, index) => (
          <button
            key={index}
            onClick={() => setCurrentCriterion(index)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentCriterion === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {criterion}
          </button>
        ))}
      </div>

      {/* Current Criterion Matrix */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Comparing alternatives with respect to:{' '}
          <span className="text-blue-600">{criteria[currentCriterion]}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-sm font-medium text-gray-700"></th>
                {alternatives.map((a, i) => (
                  <th key={i} className="p-2 text-sm font-medium text-gray-700 text-center">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((rowAlt, i) => (
                <tr key={i}>
                  <td className="p-2 text-sm font-medium text-gray-700">{rowAlt}</td>
                  {alternatives.map((_, j) => (
                    <td key={j} className="p-1">
                      {i === j ? (
                        <div className="w-20 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-500">
                          1
                        </div>
                      ) : i < j ? (
                        <select
                          value={alternativeMatrices[currentCriterion][i][j]}
                          onChange={(e) =>
                            handleCellChange(currentCriterion, i, j, e.target.value)
                          }
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
                          {getInverseDisplay(alternativeMatrices[currentCriterion][j][i])}
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

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {currentCriterion + 1} of {criteria.length} criteria
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentCriterion + 1) / criteria.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <div className="flex gap-2">
          {currentCriterion > 0 && (
            <button
              onClick={() => setCurrentCriterion(currentCriterion - 1)}
              className="btn-secondary"
            >
              Previous Criterion
            </button>
          )}
          {currentCriterion < criteria.length - 1 ? (
            <button
              onClick={() => setCurrentCriterion(currentCriterion + 1)}
              className="btn-primary"
            >
              Next Criterion →
            </button>
          ) : (
            <button onClick={onNext} className="btn-primary">
              Calculate Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
