'use client';

import React from 'react';

interface HybridFuzzyATPInputStepProps {
  goal: string;
  setGoal: (goal: string) => void;
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  criteriaTypes: ('benefit' | 'cost')[];
  setCriteriaTypes: (types: ('benefit' | 'cost')[]) => void;
  onNext: () => void;
}

export default function HybridFuzzyATPInputStep({
  goal,
  setGoal,
  criteria,
  setCriteria,
  alternatives,
  setAlternatives,
  criteriaTypes,
  setCriteriaTypes,
  onNext,
}: HybridFuzzyATPInputStepProps) {
  const addCriterion = () => {
    setCriteria([...criteria, `Criterion ${criteria.length + 1}`]);
    setCriteriaTypes([...criteriaTypes, 'benefit']);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
      setCriteriaTypes(criteriaTypes.filter((_, i) => i !== index));
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

  const canProceed =
    goal.trim() !== '' &&
    criteria.every((c) => c.trim() !== '') &&
    alternatives.every((a) => a.trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2;

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Hybrid Fuzzy AHP-TOPSIS
      </h2>
      <p className="text-gray-600 mb-6">
        Define your decision problem. Criteria weights will be determined through Fuzzy AHP, 
        then used to rank alternatives with Fuzzy TOPSIS.
      </p>

      {/* Goal Section */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Decision Goal/Problem
        </label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Select the best smartphone"
          className="input w-full"
        />
      </div>

      {/* Criteria Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">
            Criteria (min 2) - will be compared pairwise in Fuzzy AHP
          </label>
          <button onClick={addCriterion} className="btn-secondary text-sm">
            + Add Criterion
          </button>
        </div>
        <div className="space-y-3">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={criterion}
                onChange={(e) => updateCriterion(index, e.target.value)}
                placeholder={`Criterion ${index + 1}`}
                className="input flex-1"
              />
              <select
                value={criteriaTypes[index]}
                onChange={(e) => updateCriteriaType(index, e.target.value as 'benefit' | 'cost')}
                className="input w-40"
              >
                <option value="benefit">Benefit ↑</option>
                <option value="cost">Cost ↓</option>
              </select>
              {criteria.length > 2 && (
                <button
                  onClick={() => removeCriterion(index)}
                  className="btn-danger"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">
            Alternatives (min 2) - will be ranked by Fuzzy TOPSIS
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
                className="input flex-1"
              />
              {alternatives.length > 2 && (
                <button
                  onClick={() => removeAlternative(index)}
                  className="btn-danger"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <strong>Next Steps:</strong> You'll compare criteria pairwise using Fuzzy AHP, 
          then enter performance data for each alternative.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`btn-primary ${!canProceed && 'opacity-50 cursor-not-allowed'}`}
        >
          Define Criteria Preferences →
        </button>
      </div>
    </div>
  );
}
