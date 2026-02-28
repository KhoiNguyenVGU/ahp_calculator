'use client';

import React, { useEffect, useState } from 'react';
import { TFN } from '@/utils/fahp';

type ConfidenceKey = 'low' | 'medium' | 'high';

const confidenceOptions: { key: ConfidenceKey; label: string; description: string }[] = [
  { key: 'low', label: 'Low confidence', description: 'Use a wider range' },
  { key: 'medium', label: 'Medium confidence', description: 'Use a moderate range' },
  { key: 'high', label: 'High confidence', description: 'Use a tight range' },
];

const confidenceSpreadRatio: Record<ConfidenceKey, number> = {
  low: 0.2,
  medium: 0.12,
  high: 0.06,
};

const emptyTFN = (): TFN => ({
  l: Number.NaN,
  m: Number.NaN,
  u: Number.NaN,
});

const isValidTFN = (value: TFN) => {
  return (
    Number.isFinite(value.l) &&
    Number.isFinite(value.m) &&
    Number.isFinite(value.u) &&
    value.l <= value.m &&
    value.m <= value.u
  );
};

const toInputValue = (value: number) => (Number.isFinite(value) ? String(value) : '');

const buildTFNFromMidpoint = (midpoint: number, confidence: ConfidenceKey): TFN => {
  if (!Number.isFinite(midpoint)) return emptyTFN();

  const ratio = confidenceSpreadRatio[confidence];
  const spread = Math.abs(midpoint) * ratio;

  return {
    l: midpoint - spread,
    m: midpoint,
    u: midpoint + spread,
  };
};

const inferConfidenceFromTFN = (value: TFN): ConfidenceKey => {
  if (!isValidTFN(value) || !Number.isFinite(value.m) || value.m === 0) {
    return 'medium';
  }

  const ratio = Math.abs((value.u - value.l) / 2) / Math.abs(value.m);
  const keys: ConfidenceKey[] = ['low', 'medium', 'high'];

  let best: ConfidenceKey = 'medium';
  let diff = Number.POSITIVE_INFINITY;

  keys.forEach((key) => {
    const currentDiff = Math.abs(ratio - confidenceSpreadRatio[key]);
    if (currentDiff < diff) {
      diff = currentDiff;
      best = key;
    }
  });

  return best;
};

interface FuzzyTOPSISInputStepProps {
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  criteriaTypes: ('benefit' | 'cost')[];
  setCriteriaTypes: (types: ('benefit' | 'cost')[]) => void;
  dataMatrix: TFN[][];
  setDataMatrix: (matrix: TFN[][]) => void;
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
  onNext,
}: FuzzyTOPSISInputStepProps) {
  const [confidenceMatrix, setConfidenceMatrix] = useState<ConfidenceKey[][]>([]);

  useEffect(() => {
    const next = alternatives.map((_, rowIndex) =>
      criteria.map((_, colIndex) =>
        inferConfidenceFromTFN(dataMatrix[rowIndex]?.[colIndex] || emptyTFN())
      )
    );
    setConfidenceMatrix(next);
  }, [alternatives.length, criteria.length]);

  const addCriterion = () => {
    setCriteria([...criteria, '']);
    setCriteriaTypes([...criteriaTypes, 'benefit']);
    setDataMatrix(dataMatrix.map(row => [...row, emptyTFN()]));
    setConfidenceMatrix(confidenceMatrix.map(row => [...row, 'medium']));
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
      setCriteriaTypes(criteriaTypes.filter((_, i) => i !== index));
      setDataMatrix(dataMatrix.map(row => row.filter((_, i) => i !== index)));
      setConfidenceMatrix(confidenceMatrix.map(row => row.filter((_, i) => i !== index)));
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

  const addAlternative = () => {
    setAlternatives([...alternatives, '']);
    setDataMatrix([...dataMatrix, Array.from({ length: criteria.length }, () => emptyTFN())]);
    setConfidenceMatrix([...confidenceMatrix, Array.from({ length: criteria.length }, () => 'medium')]);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length > 2) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
      setDataMatrix(dataMatrix.filter((_, i) => i !== index));
      setConfidenceMatrix(confidenceMatrix.filter((_, i) => i !== index));
    }
  };

  const updateAlternative = (index: number, value: string) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const updateDataCell = (rowIndex: number, colIndex: number, value: string) => {
    const midpoint = String(value || '').trim() === '' ? Number.NaN : parseFloat(value);
    const confidence = confidenceMatrix[rowIndex]?.[colIndex] || 'medium';
    const tfn = buildTFNFromMidpoint(midpoint, confidence);

    const newMatrix = dataMatrix.map(row => [...row]);
    newMatrix[rowIndex][colIndex] = tfn;
    setDataMatrix(newMatrix);
  };

  const updateConfidence = (rowIndex: number, colIndex: number, confidence: ConfidenceKey) => {
    const nextConfidence = confidenceMatrix.map(row => [...row]);
    if (!nextConfidence[rowIndex]) nextConfidence[rowIndex] = [];
    nextConfidence[rowIndex][colIndex] = confidence;
    setConfidenceMatrix(nextConfidence);

    const currentCell = dataMatrix[rowIndex]?.[colIndex] || emptyTFN();
    const midpoint = currentCell.m;
    const updatedTFN = buildTFNFromMidpoint(midpoint, confidence);

    const newMatrix = dataMatrix.map(row => [...row]);
    newMatrix[rowIndex][colIndex] = updatedTFN;
    setDataMatrix(newMatrix);
  };

  const canProceed =
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2 &&
    dataMatrix.every(row => row.every(cell => isValidTFN(cell)));

  return (
    <div className="card max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fuzzy TOPSIS - Define Problem & Enter Data</h2>

      {/* Criteria Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Criteria (min 2)
          </label>
          <button onClick={addCriterion} className="btn-secondary text-sm">
            + Add Criterion
          </button>
        </div>

        <div className="space-y-2">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={criterion}
                onChange={(e) => updateCriterion(index, e.target.value)}
                placeholder={`Criterion ${index + 1} (e.g., Price, Quality)`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={criteriaTypes[index]}
                onChange={(e) => updateCriteriaType(index, e.target.value as 'benefit' | 'cost')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="benefit">📈 Benefit (higher is better)</option>
                <option value="cost">📉 Cost (lower is better)</option>
              </select>
              {criteria.length > 2 && (
                <button
                  onClick={() => removeCriterion(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Alternatives (min 2)
          </label>
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

      {/* Sentence-style Data Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fuzzy Values
        </label>

        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">How to fill this section</h3>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li><strong>Higher Better:</strong> Higher values are better (e.g., quality, storage, camera)</li>
            <li><strong>Lower Better:</strong> Lower values are better (e.g., price, weight)</li>
            <li>Enter your best estimate value</li>
            <li>Then tell us how confident you are</li>
            <li>Use the same unit for each criterion (e.g., all prices in USD)</li>
            <li>We will automatically create a fuzzy range and show it as (L, M, U)</li>
          </ul>
        </div>

        <div className="space-y-5">
          {criteria.map((criterion, colIndex) => (
            <div key={colIndex} className="p-5 rounded-lg border border-gray-200 bg-gray-50">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  {criterion || `Criterion ${colIndex + 1}`}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {criteriaTypes[colIndex] === 'benefit'
                    ? 'Benefit criterion: higher value means better performance.'
                    : 'Cost criterion: lower value means better performance.'}
                </p>
              </div>

              <div className="space-y-3">
                {alternatives.map((alternative, rowIndex) => {
                  const value = dataMatrix[rowIndex]?.[colIndex] || emptyTFN();
                  const valid = isValidTFN(value);
                  const confidence = confidenceMatrix[rowIndex]?.[colIndex] || 'medium';

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-gray-700 sm:w-10 sm:flex-none">For</span>
                        <span className="font-semibold text-blue-700 sm:w-52 sm:flex-none sm:truncate">{alternative || `Alternative ${rowIndex + 1}`}</span>
                        <span className="text-gray-700 sm:w-8 sm:flex-none">the</span>
                        <span className="font-semibold text-gray-800 sm:w-44 sm:flex-none sm:truncate">{criterion || `criterion ${colIndex + 1}`}</span>
                        <span className="text-gray-700 sm:w-20 sm:flex-none">estimate:</span>
                        <input
                          type="number"
                          step="any"
                          value={toInputValue(value.m)}
                          onChange={(e) => updateDataCell(rowIndex, colIndex, e.target.value)}
                          placeholder="e.g. 75"
                          className={`w-32 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none ${
                            valid ? 'border-gray-300 bg-white' : 'border-red-300 bg-red-50'
                          }`}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">How confident are you?</label>
                          <select
                            value={confidence}
                            onChange={(e) => updateConfidence(rowIndex, colIndex, e.target.value as ConfidenceKey)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {confidenceOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label} — {option.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Interpreted fuzzy value</label>
                          <div className="text-xs text-blue-700 font-mono bg-blue-50 border border-blue-200 rounded px-3 py-2 leading-relaxed min-h-[42px] flex items-center">
                            (L, M, U): (
                            {Number.isFinite(value.l) ? value.l.toFixed(2) : '--'},
                            {' '}
                            {Number.isFinite(value.m) ? value.m.toFixed(2) : '--'},
                            {' '}
                            {Number.isFinite(value.u) ? value.u.toFixed(2) : '--'})
                          </div>
                        </div>
                      </div>

                      {!valid && (
                        <p className="mt-3 text-xs text-red-600">Enter a valid number to generate fuzzy values.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Set Fuzzy Weights →
        </button>
      </div>
    </div>
  );


}
