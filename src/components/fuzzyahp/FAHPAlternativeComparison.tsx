'use client';

import React, { useState, useEffect } from 'react';
import { fahpSaatyScale, fuzzyScale, inverseTFN, formatTFN } from '../../utils/fahp';

interface FAHPAlternativeComparisonProps {
  criteria: string[];
  alternatives: string[];
  alternativeMatrices: string[][][];
  setAlternativeMatrices: (matrices: string[][][]) => void;
  onBack: () => void;
  onCalculate: () => void;
}

export default function FAHPAlternativeComparison({
  criteria,
  alternatives,
  alternativeMatrices,
  setAlternativeMatrices,
  onBack,
  onCalculate,
}: FAHPAlternativeComparisonProps) {
  const [currentCriterion, setCurrentCriterion] = useState(0);
  const numAlternatives = alternatives.length;

  const updateMatrix = (
    criterionIndex: number,
    i: number,
    j: number,
    value: string
  ) => {
    const newMatrices = alternativeMatrices.map(matrix =>
      matrix.map(row => [...row])
    );

    newMatrices[criterionIndex][i][j] = value;
    setAlternativeMatrices(newMatrices);

    // Mark this criterion as edited
    const updatedEdited = [...editedCriteria];
    updatedEdited[criterionIndex] = true;
    setEditedCriteria(updatedEdited);
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

  // Check if current criterion's matrix is complete (only counts non-empty, non-default values)
  const isCurrentComplete = () => {
    const matrix = alternativeMatrices[currentCriterion];
    for (let i = 0; i < numAlternatives; i++) {
      for (let j = i + 1; j < numAlternatives; j++) {
        const val = matrix[i][j];
        if (!val || val === '') return false;
      }
    }
    return true;
  };

  // Check if all matrices are complete
  const isAllComplete = () => {
    for (let c = 0; c < criteria.length; c++) {
      const matrix = alternativeMatrices[c];
      for (let i = 0; i < numAlternatives; i++) {
        for (let j = i + 1; j < numAlternatives; j++) {
          const val = matrix[i][j];
          if (!val || val === '') return false;
        }
      }
    }
    return true;
  };

  // Check if a specific criterion tab is complete
  const isCriterionComplete = (criterionIndex: number) => {
    if (!editedCriteria[criterionIndex]) return false;

    const matrix = alternativeMatrices[criterionIndex];

    for (let i = 0; i < numAlternatives; i++) {
      for (let j = i + 1; j < numAlternatives; j++) {
        const val = matrix[i][j];
        if (!val || val === '') return false;
      }
    }

    return true;
  };


  const currentMatrix = alternativeMatrices[currentCriterion];

  const [editedCriteria, setEditedCriteria] = useState<boolean[]>(
    Array(criteria.length).fill(false)
  );

  // Mark current criterion as visited whenever it changes (covers Next/Previous navigation)
  useEffect(() => {
    setEditedCriteria(prev => {
      if (prev[currentCriterion]) return prev;
      const copy = [...prev];
      copy[currentCriterion] = true;
      return copy;
    });
  }, [currentCriterion]);

  // Mark the first criterion as visited on mount (and reset when criteria length changes)
  useEffect(() => {
    const arr = Array(criteria.length).fill(false);
    if (criteria.length > 0) arr[0] = true;
    setEditedCriteria(arr);
  }, [criteria.length]);


  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">
          Fuzzy Pairwise Comparison of Alternatives
        </h3>
        <p className="text-sm text-blue-700">
          For each criterion, compare the alternatives pairwise using fuzzy numbers.
        </p>
      </div>

      {/* Criterion Tabs */}
      <div className="flex flex-wrap gap-2">
        {criteria.map((criterion, index) => {
          const complete = isCriterionComplete(index);
          const visited = editedCriteria[index];

          return (
            <button
              key={index}
              onClick={() => {
                setCurrentCriterion(index);
                const updated = [...editedCriteria];
                updated[index] = true;
                setEditedCriteria(updated);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentCriterion === index
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : complete
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : visited
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {criterion}
              {complete && currentCriterion !== index && ' ✓'}
            </button>
          );
        })}
      </div>

      {/* Comparison Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="font-semibold text-gray-800 mb-4">
          Comparing alternatives for:{' '}
          <span className="text-blue-600">{criteria[currentCriterion]}</span>
        </h4>

        <div className="space-y-4">
          {Array.from({ length: numAlternatives }).map((_, i) =>
            Array.from({ length: numAlternatives }).map((_, j) => {
              if (j <= i) return null;
              return (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700 min-w-[120px]">
                    {alternatives[i]}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium text-gray-700 min-w-[120px]">
                    {alternatives[j]}
                  </span>

                  <select
                    value={currentMatrix[i][j] || '1'}
                    onChange={(e) =>
                      updateMatrix(currentCriterion, i, j, e.target.value)
                    }
                    className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fahpSaatyScale.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <span className="text-sm text-blue-600 min-w-[120px] font-mono">
                    → {getFuzzyDisplay(currentMatrix[i][j] || '1')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fuzzy Matrix Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="font-semibold text-gray-800 mb-4">
          Fuzzy Matrix for: {criteria[currentCriterion]}
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-3 text-left border-r border-blue-200"></th>
                {alternatives.map((a, i) => (
                  <th
                    key={i}
                    className="p-3 text-center border-r border-blue-200 min-w-[140px]"
                  >
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((rowAlt, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="p-3 font-medium border-r border-blue-200 bg-blue-50">
                    {rowAlt}
                  </td>
                  {alternatives.map((_, j) => {
                    let fuzzyValue: string;
                    if (i === j) fuzzyValue = '(1, 1, 1)';
                    else if (i < j)
                      fuzzyValue = getFuzzyDisplay(currentMatrix[i][j] || '1');
                    else
                      fuzzyValue = getFuzzyDisplay(
                        getInverseValue(currentMatrix[j][i] || '1')
                      );

                    return (
                      <td
                        key={j}
                        className={`p-3 text-center border-r border-blue-200 font-mono text-xs ${
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
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {currentCriterion > 0 && (
            <button
              onClick={() => setCurrentCriterion(currentCriterion - 1)}
              className="btn-secondary"
            >
              ← Previous Criterion
            </button>
          )}

          {currentCriterion < criteria.length - 1 && (
            <button
              onClick={() => setCurrentCriterion(currentCriterion + 1)}
              disabled={!isCurrentComplete()}
              className={`btn-primary ${!isCurrentComplete() && 'opacity-50 cursor-not-allowed'}`}
            >
              Next Criterion →
            </button>
          )}

          {currentCriterion === criteria.length - 1 && (
            <button
              onClick={onCalculate}
              disabled={!isAllComplete()}
              className={`btn-primary ${!isAllComplete() && 'opacity-50 cursor-not-allowed'}`}
            >
              Calculate Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );


}
