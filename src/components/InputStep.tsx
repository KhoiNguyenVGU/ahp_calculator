'use client';

import React from 'react';

interface InputStepProps {
  criteria: string[];
  setCriteria: (criteria: string[]) => void;
  alternatives: string[];
  setAlternatives: (alternatives: string[]) => void;
  goalName: string;
  setGoalName: (name: string) => void;
  onNext: () => void;
}

export default function InputStep({
  criteria,
  setCriteria,
  alternatives,
  setAlternatives,
  goalName,
  setGoalName,
  onNext,
}: InputStepProps) {
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
    goalName.trim() !== '' &&
    criteria.every((c) => c.trim() !== '') &&
    alternatives.every((a) => a.trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2;

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Define Your Decision Problem</h2>

      {/* Goal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decision Goal
        </label>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="e.g., Satisfaction with School"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Criteria */}
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

      {/* Hierarchy Preview */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Hierarchy Preview</h3>
        <div className="relative" style={{ height: '300px' }}>
          {/* Goal Level */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="px-6 py-3 bg-blue-100 text-blue-800 rounded-lg text-center font-medium border-2 border-blue-200">
              Goal: {goalName || '(Enter goal)'}
            </div>
          </div>

          {/* Criteria Level */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-8">
              {criteria.map((c, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center text-sm font-medium border border-green-200 min-w-16"
                >
                  {c || `${String.fromCharCode(97 + i)}`}
                </div>
              ))}
            </div>
          </div>

          {/* Alternatives Level */}
          <div className="absolute top-52 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-6">
              {alternatives.map((a, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-center text-sm font-medium border border-orange-200 min-w-12"
                >
                  {a || `${i + 1}`}
                </div>
              ))}
            </div>
          </div>

          {/* SVG for arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#dc2626"
                  stroke="#dc2626"
                  strokeWidth="1"
                />
              </marker>
            </defs>

            {/* Arrows from Goal to each Criterion */}
            {criteria.map((_, i) => {
              const goalX = 50; // Goal center percentage
              const goalY = 15; // Goal bottom percentage
              const criterionX = 50 - (criteria.length - 1) * 6 + i * 12; // Distribute criteria evenly
              const criterionY = 30; // Criteria top percentage

              return (
                <line
                  key={`goal-criterion-${i}`}
                  x1={`${goalX}%`}
                  y1={`${goalY}%`}
                  x2={`${criterionX}%`}
                  y2={`${criterionY}%`}
                  stroke="#dc2626"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Arrows from each Criterion to each Alternative */}
            {criteria.map((_, criterionIndex) =>
              alternatives.map((_, altIndex) => {
                const criterionX = 50 - (criteria.length - 1) * 6 + criterionIndex * 12;
                const criterionY = 40; // Criteria bottom percentage
                const altX = 50 - (alternatives.length - 1) * 5 + altIndex * 10; // Distribute alternatives evenly
                const altY = 70; // Alternatives top percentage

                return (
                  <line
                    key={`criterion-${criterionIndex}-alt-${altIndex}`}
                    x1={`${criterionX}%`}
                    y1={`${criterionY}%`}
                    x2={`${altX}%`}
                    y2={`${altY}%`}
                    stroke="#dc2626"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
          </svg>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Next: Compare Criteria →
        </button>
      </div>
    </div>
  );
}
