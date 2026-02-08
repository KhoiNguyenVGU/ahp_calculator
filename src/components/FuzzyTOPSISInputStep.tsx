'use client';

import React from 'react';
import { TFN } from '@/utils/fahp';
import { fuzzyTopsisWeightScale } from '@/utils/fuzzyTopsis';

interface FuzzyTOPSISInputStepProps {
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  criteriaTypes: ('benefit' | 'cost')[];
  setCriteriaTypes: (types: ('benefit' | 'cost')[]) => void;
  dataMatrix: string[][];
  setDataMatrix: (matrix: string[][]) => void;
  fuzzyWeights: TFN[];
  setFuzzyWeights: (weights: TFN[]) => void;
  onNext: () => void;
}

export default function FuzzyTOPSISInputStep({
  criteria,
  setCriteria,
  alternatives,
  setAlternatives,
  criteriaTypes,
  setCriteriaTypes,
  dataMatrix,
  setDataMatrix,
  fuzzyWeights,
  setFuzzyWeights,
  onNext,
}: FuzzyTOPSISInputStepProps) {
  const addCriterion = () => {
    setCriteria([...criteria, '']);
    setCriteriaTypes([...criteriaTypes, 'benefit']);
    setDataMatrix(dataMatrix.map(row => [...row, '']));
    setFuzzyWeights([
      ...fuzzyWeights,
      { l: 0.3, m: 0.5, u: 0.7 }, // Default medium weight
    ]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
      setCriteriaTypes(criteriaTypes.filter((_, i) => i !== index));
      setDataMatrix(dataMatrix.map(row => row.filter((_, i) => i !== index)));
      setFuzzyWeights(fuzzyWeights.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const updateCriteriaType = (index: number, type: 'benefit' | 'cost') => {
    const newTypes = [...criteriaTypes];
    newTypes[index] = type;
    setCriteriaTypes(newTypes);
  };

  const updateFuzzyWeight = (index: number, key: 'l' | 'm' | 'u', value: string) => {
    const newWeights = [...fuzzyWeights];
    newWeights[index] = {
      ...newWeights[index],
      [key]: parseFloat(value) || 0,
    };
    setFuzzyWeights(newWeights);
  };

  const setWeightPreset = (index: number, preset: string) => {
    const newWeights = [...fuzzyWeights];
    newWeights[index] = fuzzyTopsisWeightScale[preset] || newWeights[index];
    setFuzzyWeights(newWeights);
  };

  const addAlternative = () => {
    setAlternatives([...alternatives, '']);
    setDataMatrix([...dataMatrix, new Array(criteria.length).fill('')]);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length > 2) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
      setDataMatrix(dataMatrix.filter((_, i) => i !== index));
    }
  };

  const updateAlternative = (index: number, value: string) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const updateDataCell = (rowIndex: number, colIndex: number, value: string) => {
    const newMatrix = dataMatrix.map(row => [...row]);
    newMatrix[rowIndex][colIndex] = value;
    setDataMatrix(newMatrix);
  };

  const canProceed =
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2 &&
    dataMatrix.every(row => row.every(cell => String(cell || '').trim() !== '' && !isNaN(parseFloat(String(cell || '0'))))) &&
    fuzzyWeights.every(w => w.l <= w.m && w.m <= w.u);

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Fuzzy TOPSIS - Define Problem & Enter Data
      </h2>

      {/* Criteria Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Criteria (min 2) with Fuzzy Weights
          </label>
          <button onClick={addCriterion} className="btn-secondary text-sm">
            + Add Criterion
          </button>
        </div>

        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <input
                  type="text"
                  value={criterion}
                  onChange={(e) => updateCriterion(index, e.target.value)}
                  placeholder={`Criterion ${index + 1}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={criteriaTypes[index]}
                  onChange={(e) =>
                    updateCriteriaType(index, e.target.value as 'benefit' | 'cost')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="benefit">📈 Benefit (higher is better)</option>
                  <option value="cost">📉 Cost (lower is better)</option>
                </select>

                {criteria.length > 2 && (
                  <button
                    onClick={() => removeCriterion(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg self-start"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Fuzzy Weight Input */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Fuzzy Weight (Lower, Middle, Upper):
                </p>

                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fuzzyWeights[index]?.l.toFixed(2)}
                    onChange={(e) => updateFuzzyWeight(index, 'l', e.target.value)}
                    placeholder="L"
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fuzzyWeights[index]?.m.toFixed(2)}
                    onChange={(e) => updateFuzzyWeight(index, 'm', e.target.value)}
                    placeholder="M"
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fuzzyWeights[index]?.u.toFixed(2)}
                    onChange={(e) => updateFuzzyWeight(index, 'u', e.target.value)}
                    placeholder="U"
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-600 flex items-center">
                    ({fuzzyWeights[index]?.l.toFixed(2)}, {fuzzyWeights[index]?.m.toFixed(2)}, {fuzzyWeights[index]?.u.toFixed(2)})
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.keys(fuzzyTopsisWeightScale).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWeightPreset(index, preset)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                    >
                      {preset.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Alternatives</label>
          <button onClick={addAlternative} className="btn-secondary text-sm">
            + Add Alternative
          </button>
        </div>

        <div className="space-y-2">
          {alternatives.map((alt, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={alt}
                onChange={(e) => updateAlternative(index, e.target.value)}
                placeholder={`Alternative ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {alternatives.length > 2 && (
                <button
                  onClick={() => removeAlternative(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Matrix */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Decision Matrix (values)
        </label>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Alternative</th>
                {criteria.map((crit, index) => (
                  <th key={index} className="border px-4 py-2 text-left">{crit}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-2 font-semibold">{alt}</td>
                  {criteria.map((_, j) => (
                    <td key={j} className="border px-4 py-2">
                      <input
                        type="number"
                        value={dataMatrix[i][j]}
                        onChange={(e) => updateDataCell(i, j, e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Calculate Results →
        </button>
      </div>
    </div>
  );


}
