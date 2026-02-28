'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface TOPSISWeightsStepProps {
  criteria: string[];
  weights: string[];
  setWeights: (weights: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TOPSISWeightsStep({
  criteria,
  weights,
  setWeights,
  onNext,
  onBack,
}: TOPSISWeightsStepProps) {
  const formatPercent = (value: number) => {
    const fixed = value.toFixed(2);
    return fixed.replace(/\.00$/, '').replace(/(\.\d*[1-9])0$/, '$1');
  };

  const [percentInputs, setPercentInputs] = useState<string[]>([]);

  useEffect(() => {
    const mapped = criteria.map((_, index) => {
      const weight = parseFloat(String(weights[index] || ''));
      if (isNaN(weight)) return '';
      return formatPercent(weight * 100);
    });
    setPercentInputs(mapped);
  }, [criteria, weights]);

  const parsePercent = (value: string): number | null => {
    const trimmed = String(value || '').trim();
    if (trimmed === '') return null;
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed < 0) return null;
    return parsed;
  };

  const syncDecimalWeights = (percents: string[]) => {
    const decimalWeights = percents.map((percent) => {
      const parsed = parsePercent(percent);
      if (parsed === null) return '';
      return (parsed / 100).toString();
    });
    setWeights(decimalWeights);
  };

  const updateWeightPercent = (index: number, value: string) => {
    const next = [...percentInputs];
    next[index] = value;
    setPercentInputs(next);
    syncDecimalWeights(next);
  };

  const setEqualWeights = () => {
    const eachPercent = 100 / criteria.length;
    const next = criteria.map(() => formatPercent(eachPercent));
    setPercentInputs(next);
    syncDecimalWeights(next);
  };

  const normalizeTo100 = () => {
    const parsed = percentInputs.map((value) => parsePercent(value) || 0);
    const total = parsed.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return;

    const normalized = parsed.map((value) => (value / total) * 100);
    const rounded = normalized.map((value) => Number(value.toFixed(2)));
    const sumExceptLast = rounded.slice(0, -1).reduce((sum, value) => sum + value, 0);
    if (rounded.length > 0) {
      rounded[rounded.length - 1] = Number((100 - sumExceptLast).toFixed(2));
    }

    const next = rounded.map((value) => formatPercent(value));
    setPercentInputs(next);
    syncDecimalWeights(next);
  };

  const parsedPercents = useMemo(
    () => percentInputs.map((value) => parsePercent(value)),
    [percentInputs]
  );

  const totalPercent = parsedPercents.reduce(
    (sum: number, value) => sum + (value ?? 0),
    0
  );

  const remainingPercent = 100 - totalPercent;
  const isValidTotal = Math.abs(remainingPercent) < 0.01;
  const allWeightsValid = parsedPercents.every((value) => value !== null);
  const hasAnyValue = parsedPercents.some((value) => value !== null && value > 0);

  const canProceed = allWeightsValid && isValidTotal;

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">TOPSIS - Set Criteria Weights</h2>
      <p className="text-gray-600 mb-6">
        Set each criterion importance using percentages. The total must be exactly 100%.
      </p>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={setEqualWeights} className="btn-secondary">
          Set Equal Weights ({(100 / criteria.length).toFixed(1)}% each)
        </button>
        <button
          onClick={normalizeTo100}
          disabled={!hasAnyValue}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Normalize to 100%
        </button>
      </div>

      {/* Remaining */}
      <div className="mb-6">
        <div className={`p-3 rounded-lg border ${isValidTotal ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-sm font-medium ${isValidTotal ? 'text-green-700' : 'text-orange-700'}`}>
            Total: {totalPercent.toFixed(2)}% · Remaining: {remainingPercent.toFixed(2)}% {isValidTotal ? '✓' : ''}
          </p>
        </div>
      </div>

      {/* Sentence Inputs */}
      <div className="mb-6 space-y-3">
        {criteria.map((criterion, index) => {
          const isRowValid = parsedPercents[index] !== null;

          return (
            <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
                <span className="text-gray-700 sm:w-24 sm:flex-none">Importance of</span>
                <span className="font-semibold text-blue-700 sm:flex-1 sm:min-w-0 sm:truncate">{criterion}</span>
                <span className="text-gray-700 sm:w-6 sm:flex-none">is</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={percentInputs[index] ?? ''}
                  onChange={(e) => updateWeightPercent(index, e.target.value)}
                  placeholder="e.g. 25"
                  className={`w-28 px-2 py-1 rounded border text-center focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none ${
                    isRowValid ? 'border-gray-300 bg-white' : 'border-red-300 bg-red-50'
                  }`}
                />
                <span className="text-gray-700 sm:w-4 sm:flex-none">%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation message */}
      {!isValidTotal && allWeightsValid && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠ Total must be exactly 100%. Adjust values or click Normalize to 100%.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Weights represent the relative importance of each criterion</li>
          <li>Higher weight = more important criterion</li>
          <li>Use percentages (e.g., 25 means 25%)</li>
          <li>All weights must sum to exactly 100%</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Calculate Results →
        </button>
      </div>
    </div>
  );
}
