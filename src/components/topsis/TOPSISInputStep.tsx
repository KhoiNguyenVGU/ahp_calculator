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

  const canProceed =
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2 &&
    dataMatrix.every(row => row.every(cell => String(cell || '').trim() !== '' && !isNaN(parseFloat(String(cell || '0')))));

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

      {/* Data Matrix Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decision Matrix (Enter raw values)
        </label>
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-sm font-medium text-gray-700 bg-orange-100 border border-gray-300">
                  Alternative
                </th>
                {criteria.map((c, i) => (
                  <th key={i} className="p-2 text-sm font-medium text-gray-700 bg-blue-100 border border-gray-300 min-w-24">
                    <div>{c || `C${i + 1}`}</div>
                    <div className="text-xs text-gray-500">
                      ({criteriaTypes[i] === 'benefit' ? 'Higher Better' : 'Lower Better'})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-2 text-sm font-medium text-gray-700 bg-orange-50 border border-gray-300">
                    {alt || `A${rowIndex + 1}`}
                  </td>
                  {criteria.map((_, colIndex) => (
                    <td key={colIndex} className="p-1 border border-gray-300">
                      <input
                        type="text"
                        value={dataMatrix[rowIndex]?.[colIndex] || ''}
                        onChange={(e) => updateDataCell(rowIndex, colIndex, e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-center border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Instructions</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li><strong>Higher Better:</strong> Higher values are better (e.g., quality, storage, camera)</li>
          <li><strong>Lower Better:</strong> Lower values are better (e.g., price, weight)</li>
          <li>Enter raw numerical values in the decision matrix</li>
          <li>All cells must contain valid numbers</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Set Weights →
        </button>
      </div>
    </div>
  );
}
