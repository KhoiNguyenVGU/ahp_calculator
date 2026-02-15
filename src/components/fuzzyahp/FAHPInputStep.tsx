'use client';

import React from 'react';

interface FAHPInputStepProps {
  goal: string;
  setGoal: (goal: string) => void;
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  onNext: () => void;
}

export default function FAHPInputStep({
  goal,
  setGoal,
  criteria,
  setCriteria,
  alternatives,
  setAlternatives,
  onNext,
}: FAHPInputStepProps) {
  const addCriterion = () => {
    setCriteria([...criteria, '']);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const addAlternative = () => {
    setAlternatives([...alternatives, '']);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length > 2) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
    }
  };

  const updateAlternative = (index: number, value: string) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const canProceed =
    String(goal || '').trim() !== '' &&
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2;

  return (
    <div className="card max-w-3xl mx-auto">
      {/* Info Box */}
      <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-3">
          About Fuzzy AHP (FAHP)
        </h3>
        <p className="text-sm text-blue-700 mb-2">
          Fuzzy AHP extends AHP with fuzzy logic to handle uncertainty in human judgments.
        </p>
        <p className="text-sm text-blue-700 mb-2">
          Instead of single values, it uses <strong>Triangular Fuzzy Numbers (l, m, u)</strong>.
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>l</strong> = minimum</li>
          <li><strong>m</strong> = most likely</li>
          <li><strong>u</strong> = maximum</li>
        </ul>
      </div>


      {/* Goal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Decision Goal</label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Satisfaction with School"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Criteria */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Criteria</label>
          <button onClick={addCriterion} className="btn-secondary text-sm">+ Add Criterion</button>
        </div>
        <div className="space-y-2">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={criterion}
                onChange={(e) => updateCriterion(index, e.target.value)}
                placeholder={`Criterion ${index + 1} (e.g., Learning, Friends, etc.)`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

      {/* Alternatives */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Alternatives</label>
          <button onClick={addAlternative} className="btn-secondary text-sm">+ Add Alternative</button>
        </div>
        <div className="space-y-2">
          {alternatives.map((alternative, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={alternative}
                onChange={(e) => updateAlternative(index, e.target.value)}
                placeholder={`Alternative ${index + 1} (e.g., School A, School B, etc.)`}
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

      {/* Fuzzy Scale */}
      <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-3">
          Fuzzy Scale Reference
        </h3>

        <table className="w-full text-sm border border-blue-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 text-left border-r border-blue-200">Importance</th>
              <th className="p-2 text-center border-r border-blue-200">Crisp</th>
              <th className="p-2 text-center">(l, m, u)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-blue-200">Equal</td>
              <td className="p-2 text-center border-r border-blue-200">1</td>
              <td className="p-2 text-center">(1,1,1)</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="p-2 border-r border-blue-200">Moderate</td>
              <td className="p-2 text-center border-r border-blue-200">3</td>
              <td className="p-2 text-center">(2,3,4)</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-blue-200">Strong</td>
              <td className="p-2 text-center border-r border-blue-200">5</td>
              <td className="p-2 text-center">(4,5,6)</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="p-2 border-r border-blue-200">Very Strong</td>
              <td className="p-2 text-center border-r border-blue-200">7</td>
              <td className="p-2 text-center">(6,7,8)</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-blue-200">Extreme</td>
              <td className="p-2 text-center border-r border-blue-200">9</td>
              <td className="p-2 text-center">(9,9,9)</td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* Next Button */}
      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Compare Criteria →
        </button>
      </div>
    </div>
  );


}
