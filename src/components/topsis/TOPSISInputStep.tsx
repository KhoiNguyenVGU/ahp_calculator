'use client';

import React from 'react';

interface TOPSISInputStepProps {
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  criteriaTypes: ('benefit' | 'cost')[];
  setCriteriaTypes: (types: ('benefit' | 'cost')[]) => void;
  dataMatrix: string[][];
  setDataMatrix: (matrix: string[][]) => void;
  onNext: () => void;
}

export default function TOPSISInputStep({
  criteria,
  setCriteria,
  alternatives,
  setAlternatives,
  criteriaTypes,
  setCriteriaTypes,
  dataMatrix,
  setDataMatrix,
  onNext,
}: TOPSISInputStepProps) {
  const addCriterion = () => {
    setCriteria([...criteria, '']);
    setCriteriaTypes([...criteriaTypes, 'benefit']);
    setDataMatrix(dataMatrix.map(row => [...row, '']));
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
      setCriteriaTypes(criteriaTypes.filter((_, i) => i !== index));
      setDataMatrix(dataMatrix.map(row => row.filter((_, i) => i !== index)));
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

  const isValidNumber = (value: string) => {
    const trimmed = String(value || '').trim();
    return trimmed !== '' && !isNaN(parseFloat(trimmed));
  };

  const canProceed =
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2 &&
    dataMatrix.every(row => row.every(cell => isValidNumber(cell)));

  return (
    <div className="card max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">TOPSIS - Define Problem & Enter Data</h2>

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
          {alternatives.map((alternative, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={alternative}
                onChange={(e) => updateAlternative(index, e.target.value)}
                placeholder={`Alternative ${index + 1} (e.g., Mobile 1, Option A)`}
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
          Values
        </label>

        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Instructions</h3>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li><strong>Higher Better:</strong> Higher values are better (e.g., quality, storage, camera)</li>
            <li><strong>Lower Better:</strong> Lower values are better (e.g., price, weight)</li>
            <li>Enter one numeric value for each sentence prompt</li>
            <li>Use the same unit for each criterion (e.g., all prices in USD)</li>
            <li>All cells must contain valid numbers</li>
          </ul>
        </div>

        <div className="space-y-4">
          {criteria.map((criterion, colIndex) => (
            <div key={colIndex} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-800">
                  {criterion || `Criterion ${colIndex + 1}`}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {criteriaTypes[colIndex] === 'benefit'
                    ? 'Benefit criterion: higher value means better performance.'
                    : 'Cost criterion: lower value means better performance.'}
                </p>
              </div>

              <div className="space-y-2">
                {alternatives.map((alternative, rowIndex) => {
                  const value = dataMatrix[rowIndex]?.[colIndex] || '';
                  const valid = isValidNumber(value);

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-gray-700 sm:w-10 sm:flex-none">For</span>
                      <span className="font-semibold text-blue-700 sm:w-52 sm:flex-none sm:truncate">{alternative || `Alternative ${rowIndex + 1}`}</span>
                      <span className="text-gray-700 sm:w-8 sm:flex-none">the</span>
                      <span className="font-semibold text-gray-800 sm:w-44 sm:flex-none sm:truncate">{criterion || `criterion ${colIndex + 1}`}</span>
                      <span className="text-gray-700 sm:w-16 sm:flex-none">value is</span>
                      <input
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => updateDataCell(rowIndex, colIndex, e.target.value)}
                        placeholder="e.g. 75"
                        className={`w-32 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none ${
                          valid ? 'border-gray-300 bg-white' : 'border-red-300 bg-red-50'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Set Weights →
        </button>
      </div>
    </div>
  );
}
