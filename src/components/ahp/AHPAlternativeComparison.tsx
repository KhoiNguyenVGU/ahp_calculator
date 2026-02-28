'use client';

import React, { useEffect, useState } from 'react';
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
  const [editedCriteria, setEditedCriteria] = useState<boolean[]>(
    Array(criteria.length).fill(false)
  );

  const handlePairChange = (
    criterionIndex: number,
    i: number,
    j: number,
    value: string
  ) => {
    const newMatrices = alternativeMatrices.map((matrix) =>
      matrix.map((row) => [...row])
    );
    newMatrices[criterionIndex][i][j] = value;
    // Set reciprocal in the lower triangle
    newMatrices[criterionIndex][j][i] = value === '1' ? '1' : value.startsWith('1/') ? value.substring(2) : `1/${value}`;
    setAlternativeMatrices(newMatrices);

    const updatedEdited = [...editedCriteria];
    updatedEdited[criterionIndex] = true;
    setEditedCriteria(updatedEdited);
  };

  // Generate unique pairs for current criterion
  const getPairs = () => {
    const pairs = [];
    for (let i = 0; i < alternatives.length; i++) {
      for (let j = i + 1; j < alternatives.length; j++) {
        pairs.push({ i, j, first: alternatives[i], second: alternatives[j] });
      }
    }
    return pairs;
  };

  const pairs = getPairs();

  const isCriterionComplete = (criterionIndex: number) => {
    if (!editedCriteria[criterionIndex]) return false;
    return pairs.every(
      p => alternativeMatrices[criterionIndex][p.i][p.j] &&
           alternativeMatrices[criterionIndex][p.i][p.j] !== ''
    );
  };

  const canProceed = pairs.every(
    p => alternativeMatrices[currentCriterion][p.i][p.j] && 
         alternativeMatrices[currentCriterion][p.i][p.j] !== ''
  );

  useEffect(() => {
    setEditedCriteria(prev => {
      if (prev[currentCriterion]) return prev;
      const copy = [...prev];
      copy[currentCriterion] = true;
      return copy;
    });
  }, [currentCriterion]);

  useEffect(() => {
    const arr = Array(criteria.length).fill(false);
    if (criteria.length > 0) arr[0] = true;
    setEditedCriteria(arr);
  }, [criteria.length]);

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Compare Alternatives</h2>
      <p className="text-gray-600 mb-6">
        For each criterion, compare how well each alternative performs.
      </p>

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
              className={`px-4 py-2 rounded-lg transition-colors ${
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

      {/* Current Criterion Comparisons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Comparing alternatives for:{' '}
          <span className="text-blue-600">{criteria[currentCriterion]}</span>
        </h3>

        <div className="space-y-3">
          {pairs.map((pair, idx) => (
            <div key={`${pair.i}-${pair.j}`} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-2">
                <p className="text-gray-800 font-medium">
                  <span className="text-blue-600 font-semibold">{pair.first}</span> compared to{' '}
                  <span className="text-orange-600 font-semibold">{pair.second}</span>
                </p>
              </div>
              <select
                value={alternativeMatrices[currentCriterion][pair.i][pair.j] || ''}
                onChange={(e) =>
                  handlePairChange(currentCriterion, pair.i, pair.j, e.target.value)
                }
                className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Select --</option>
                {saatyScale.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
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

      {/* Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 How to Compare</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Use the scale 1–9 to rate which alternative is better for this criterion</li>
          <li><strong>1</strong> = Both equally good</li>
          <li><strong>3–5</strong> = First is moderately to strongly better</li>
          <li><strong>7–9</strong> = First is very to extremely better</li>
          <li>Use <strong>1/3–1/9</strong> if the second is better than the first</li>
        </ul>
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
              ← Previous Criterion
            </button>
          )}
          {currentCriterion < criteria.length - 1 ? (
            <button
              onClick={() => setCurrentCriterion(currentCriterion + 1)}
              disabled={!canProceed}
              className="btn-primary"
            >
              Next Criterion →
            </button>
          ) : (
            <button onClick={onNext} disabled={!canProceed} className="btn-primary">
              Calculate Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
