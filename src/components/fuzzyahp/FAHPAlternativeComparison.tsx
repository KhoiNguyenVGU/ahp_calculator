'use client';

import React, { useState, useEffect } from 'react';
import { ConfidenceKey, fahpSaatyScale } from '../../utils/fahp';

interface FAHPAlternativeComparisonProps {
  criteria: string[];
  alternatives: string[];
  alternativeMatrices: string[][][];
  setAlternativeMatrices: (matrices: string[][][]) => void;
  confidenceMatrices: (ConfidenceKey | undefined)[][][];
  setConfidenceMatrices: (matrices: (ConfidenceKey | undefined)[][][]) => void;
  onBack: () => void;
  onCalculate: () => void;
}

export default function FAHPAlternativeComparison({
  criteria,
  alternatives,
  alternativeMatrices,
  setAlternativeMatrices,
  confidenceMatrices,
  setConfidenceMatrices,
  onBack,
  onCalculate,
}: FAHPAlternativeComparisonProps) {
  const [currentCriterion, setCurrentCriterion] = useState(0);
  const [editedCriteria, setEditedCriteria] = useState<boolean[]>(
    Array(criteria.length).fill(false)
  );
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
    newMatrices[criterionIndex][j][i] = value === '1' ? '1' : value.startsWith('1/') ? value.substring(2) : `1/${value}`;
    setAlternativeMatrices(newMatrices);

    // Mark this criterion as edited
    const updatedEdited = [...editedCriteria];
    updatedEdited[criterionIndex] = true;
    setEditedCriteria(updatedEdited);
  };

  const updateConfidenceMatrix = (
    criterionIndex: number,
    i: number,
    j: number,
    confidence: ConfidenceKey
  ) => {
    const newConfidenceMatrices = confidenceMatrices.map(matrix =>
      matrix.map(row => [...row])
    );

    newConfidenceMatrices[criterionIndex][i][j] = confidence;
    newConfidenceMatrices[criterionIndex][j][i] = confidence;
    setConfidenceMatrices(newConfidenceMatrices);
  };

  const getPairs = () => {
    const pairs: { i: number; j: number; first: string; second: string }[] = [];
    for (let i = 0; i < alternatives.length; i++) {
      for (let j = i + 1; j < alternatives.length; j++) {
        pairs.push({ i, j, first: alternatives[i], second: alternatives[j] });
      }
    }
    return pairs;
  };

  const pairs = getPairs();

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

    return pairs.every(
      p =>
        alternativeMatrices[criterionIndex][p.i]?.[p.j] &&
        alternativeMatrices[criterionIndex][p.i][p.j] !== ''
    );
  };

  const currentMatrix = alternativeMatrices[currentCriterion];

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
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Fuzzy AHP Phase - Compare Alternatives Pairwise
      </h2>
      <p className="text-gray-600 mb-6">
        For each criterion, compare alternatives pairwise and choose your confidence level.
      </p>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div><strong className="text-blue-900">1</strong> = Equal importance</div>
          <div><strong className="text-blue-900">3</strong> = Moderate importance</div>
          <div><strong className="text-blue-900">5</strong> = Strong importance</div>
          <div><strong className="text-blue-900">7</strong> = Very strong importance</div>
          <div><strong className="text-blue-900">9</strong> = Extreme importance</div>
          <div><strong className="text-blue-900">1/3–1/9</strong> = Reverse (less important)</div>
        </div>
      </div>

      {/* Criterion Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Comparing alternatives for:{' '}
          <span className="text-blue-600">{criteria[currentCriterion]}</span>
        </h3>

        <div className="space-y-4">
          {pairs.map((pair, idx) => (
            <div key={`${pair.i}-${pair.j}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-3">
                <p className="text-gray-800 font-medium">
                  <span className="text-blue-600 font-semibold">{pair.first}</span> compared to{' '}
                  <span className="text-orange-600 font-semibold">{pair.second}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Question: For <strong>{criteria[currentCriterion]}</strong>, how much better is{' '}
                  <strong>{pair.first}</strong> relative to <strong>{pair.second}</strong>?
                </p>
              </div>

              <select
                value={currentMatrix[pair.i][pair.j] || ''}
                onChange={(e) =>
                  updateMatrix(currentCriterion, pair.i, pair.j, e.target.value)
                }
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select importance --</option>
                {fahpSaatyScale.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">How confident are you?</label>
                <select
                  value={confidenceMatrices[currentCriterion]?.[pair.i]?.[pair.j] || 'medium'}
                  onChange={(e) =>
                    updateConfidenceMatrix(
                      currentCriterion,
                      pair.i,
                      pair.j,
                      e.target.value as ConfidenceKey
                    )
                  }
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
