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
    setCriteria([...criteria, `Criterion ${criteria.length + 1}`]);
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
    setAlternatives([...alternatives, `Alternative ${alternatives.length + 1}`]);
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

  const canProceed = goal.trim() !== '' && 
    criteria.every(c => c.trim() !== '') && 
    alternatives.every(a => a.trim() !== '');

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">About Fuzzy AHP (FAHP)</h3>
        <p className="text-sm text-purple-700 mb-2">
          Fuzzy AHP extends the traditional AHP by using <strong>Triangular Fuzzy Numbers (TFN)</strong> to handle 
          uncertainty and vagueness in human judgments.
        </p>
        <p className="text-sm text-purple-700">
          Each crisp comparison value is converted to a fuzzy number (l, m, u) representing lower, middle, and upper bounds.
          The method uses fuzzy arithmetic to calculate weights, then defuzzifies to get final crisp weights.
        </p>
      </div>

      {/* Goal Input */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Decision Goal</h3>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter your decision goal (e.g., Select best smartphone)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Criteria Input */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Criteria</h3>
          <button
            onClick={addCriterion}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Criterion
          </button>
        </div>
        <div className="space-y-3">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-8 text-center text-gray-500 font-medium">{index + 1}.</span>
              <input
                type="text"
                value={criterion}
                onChange={(e) => updateCriterion(index, e.target.value)}
                placeholder={`Criterion ${index + 1}`}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {criteria.length > 2 && (
                <button
                  onClick={() => removeCriterion(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives Input */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Alternatives</h3>
          <button
            onClick={addAlternative}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Alternative
          </button>
        </div>
        <div className="space-y-3">
          {alternatives.map((alternative, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-8 text-center text-gray-500 font-medium">{index + 1}.</span>
              <input
                type="text"
                value={alternative}
                onChange={(e) => updateAlternative(index, e.target.value)}
                placeholder={`Alternative ${index + 1}`}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {alternatives.length > 2 && (
                <button
                  onClick={() => removeAlternative(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fuzzy Scale Reference */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Fuzzy Scale Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-2 text-left">Importance</th>
                <th className="p-2 text-center">Crisp Value</th>
                <th className="p-2 text-center">Fuzzy Number (l, m, u)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-2">Equal</td><td className="p-2 text-center">1</td><td className="p-2 text-center">(1, 1, 1)</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Weak</td><td className="p-2 text-center">2</td><td className="p-2 text-center">(1, 2, 3)</td></tr>
              <tr className="border-b"><td className="p-2">Moderate</td><td className="p-2 text-center">3</td><td className="p-2 text-center">(2, 3, 4)</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Moderate Plus</td><td className="p-2 text-center">4</td><td className="p-2 text-center">(3, 4, 5)</td></tr>
              <tr className="border-b"><td className="p-2">Strong</td><td className="p-2 text-center">5</td><td className="p-2 text-center">(4, 5, 6)</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Strong Plus</td><td className="p-2 text-center">6</td><td className="p-2 text-center">(5, 6, 7)</td></tr>
              <tr className="border-b"><td className="p-2">Very Strong</td><td className="p-2 text-center">7</td><td className="p-2 text-center">(6, 7, 8)</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Very Very Strong</td><td className="p-2 text-center">8</td><td className="p-2 text-center">(7, 8, 9)</td></tr>
              <tr><td className="p-2">Extreme</td><td className="p-2 text-center">9</td><td className="p-2 text-center">(9, 9, 9)</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Note: Inverse values use the formula: (l, m, u)⁻¹ = (1/u, 1/m, 1/l)
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            canProceed
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next: Compare Criteria →
        </button>
      </div>
    </div>
  );
}
