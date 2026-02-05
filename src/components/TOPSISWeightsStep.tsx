'use client';

import React from 'react';

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
  const updateWeight = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
  };

  const setEqualWeights = () => {
    const equalWeight = (1 / criteria.length).toFixed(4);
    setWeights(criteria.map(() => equalWeight));
  };

  const totalWeight = weights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
  const isValidTotal = Math.abs(totalWeight - 1) < 0.01;
  const allWeightsValid = weights.every(w => w.trim() !== '' && !isNaN(parseFloat(w)) && parseFloat(w) >= 0);

  const canProceed = allWeightsValid && isValidTotal;

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">TOPSIS - Set Criteria Weights</h2>
      <p className="text-gray-600 mb-6">
        Assign importance weights to each criterion. Weights must sum to 1.0 (100%).
      </p>

      {/* Quick Actions */}
      <div className="mb-6">
        <button onClick={setEqualWeights} className="btn-secondary">
          Set Equal Weights ({(100 / criteria.length).toFixed(1)}% each)
        </button>
      </div>

      {/* Weights Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left border border-gray-300">Criterion</th>
              <th className="p-3 text-center border border-gray-300 w-32">Weight</th>
              <th className="p-3 text-center border border-gray-300 w-32">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, index) => (
              <tr key={index}>
                <td className="p-3 border border-gray-300 font-medium">{criterion}</td>
                <td className="p-2 border border-gray-300">
                  <input
                    type="text"
                    value={weights[index]}
                    onChange={(e) => updateWeight(index, e.target.value)}
                    placeholder="0.25"
                    className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="p-3 border border-gray-300 text-center text-gray-600">
                  {weights[index] ? `${(parseFloat(weights[index]) * 100).toFixed(1)}%` : '-'}
                </td>
              </tr>
            ))}
            <tr className={`font-bold ${isValidTotal ? 'bg-green-50' : 'bg-red-50'}`}>
              <td className="p-3 border border-gray-300">Total</td>
              <td className="p-3 border border-gray-300 text-center">{totalWeight.toFixed(4)}</td>
              <td className="p-3 border border-gray-300 text-center">
                {(totalWeight * 100).toFixed(1)}%
                {isValidTotal ? ' ✓' : ' ⚠'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Validation message */}
      {!isValidTotal && allWeightsValid && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠ Weights must sum to 1.0. Current total: {totalWeight.toFixed(4)}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Weights represent the relative importance of each criterion</li>
          <li>Higher weight = more important criterion</li>
          <li>Use decimal values (e.g., 0.25 for 25%)</li>
          <li>All weights must sum to exactly 1.0</li>
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
