'use client';

import React from 'react';

interface HybridFuzzyATPAlternativeDataProps {
  criteria: string[];
  alternatives: string[];
  dataMatrix: string[][];
  setDataMatrix: (matrix: string[][]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function HybridFuzzyATPAlternativeData({
  criteria,
  alternatives,
  dataMatrix,
  setDataMatrix,
  onNext,
  onBack,
}: HybridFuzzyATPAlternativeDataProps) {
  const updateDataCell = (rowIndex: number, colIndex: number, value: string) => {
    const newMatrix = dataMatrix.map(row => [...row]);
    newMatrix[rowIndex][colIndex] = value;
    setDataMatrix(newMatrix);
  };

  const isComplete = dataMatrix.every(row =>
    row.every(cell => cell.trim() !== '' && !isNaN(parseFloat(cell)))
  );

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Fuzzy TOPSIS Phase - Enter Alternative Performance Data
      </h2>
      <p className="text-gray-600 mb-6">
        Enter how each alternative performs on each criterion. 
        The Fuzzy AHP weights (from the previous step) will be automatically applied.
      </p>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-cyan-100 to-cyan-50">
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">
                Alternative
              </th>
              {criteria.map((crit, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700"
                >
                  {crit}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alternatives.map((alt, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 bg-cyan-50">
                  {alt}
                </td>
                {criteria.map((_, j) => (
                  <td key={j} className="border border-gray-300 px-4 py-3">
                    <input
                      type="number"
                      value={dataMatrix[i][j]}
                      onChange={(e) => updateDataCell(i, j, e.target.value)}
                      placeholder="0.00"
                      className="input w-full py-2"
                      step="0.01"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-green-900">
          <strong>Next:</strong> After entering data, Fuzzy AHP weights will be automatically 
          combined with this performance data using Fuzzy TOPSIS to rank your alternatives.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`btn-primary ${!isComplete && 'opacity-50 cursor-not-allowed'}`}
        >
          Calculate Results →
        </button>
      </div>
    </div>
  );
}
