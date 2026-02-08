'use client';

import React, { useState } from 'react';
import DatasetLoader from './DatasetLoader';

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
  dataMatrix?: number[][];  
  setDataMatrix?: (matrix: number[][]) => void;
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
  dataMatrix,
  setDataMatrix,
}: HybridFuzzyATPInputStepProps) {
  const [showExample, setShowExample] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'example' | 'dataset'>('manual');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  // Example data for interviews
  const loadExampleData = () => {
    setGoal('Select the best candidate for Senior Software Engineer position');
    setCriteria(['Technical Skills', 'Communication', 'Problem-Solving', 'Leadership', 'Experience']);
    setCriteriaTypes(['benefit', 'benefit', 'benefit', 'benefit', 'benefit']);
    setAlternatives(['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D']);
    setInputMode('example');
  };

  // Handle dataset loading
  const handleDataLoaded = (data: any[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
  };

  const handleMappingComplete = (mappedData: { criteria: string[], alternatives: string[], dataMatrix: number[][] }) => {
    setGoal('Interview Evaluation from Dataset');
    setCriteria(mappedData.criteria);
    setAlternatives(mappedData.alternatives);
    setCriteriaTypes(Array(mappedData.criteria.length).fill('benefit'));
    
    // Set data matrix if available
    if (setDataMatrix) {
      setDataMatrix(mappedData.dataMatrix);
    }
    
    setInputMode('dataset');
  };

  const resetToManual = () => {
    setInputMode('manual');
    setGoal('');
    setCriteria(['Criterion 1', 'Criterion 2']);
    setAlternatives(['Alternative 1', 'Alternative 2']);
    setCriteriaTypes(['benefit', 'benefit']);
  };

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
    String(goal || '').trim() !== '' &&
    criteria.every((c) => String(c || '').trim() !== '') &&
    alternatives.every((a) => String(a || '').trim() !== '') &&
    criteria.length >= 2 &&
    alternatives.length >= 2;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Step 1: Define Your Decision Problem
      </h2>
      <p className="text-gray-600 mb-6">
        Set up your evaluation criteria and candidates. Weights will be calculated through Fuzzy AHP, then used to rank candidates with Fuzzy TOPSIS.
      </p>

      {/* Data Source Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Data Source
        </label>
        <div className="flex gap-2 mb-4">
          {['manual','example','dataset'].map(mode => (
            <button
              key={mode}
              onClick={() => setInputMode(mode as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputMode === mode
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'manual' && '✏️ Manual Entry'}
              {mode === 'example' && '📝 Example Data'}
              {mode === 'dataset' && '📊 Import Dataset'}
            </button>
          ))}
        </div>
      </div>

      {inputMode === 'dataset' && (
        <div className="mb-8">
          <DatasetLoader
            onDataLoaded={handleDataLoaded}
            onMappingComplete={handleMappingComplete}
          />
        </div>
      )}

      {inputMode === 'example' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <button
            onClick={() => {
              loadExampleData();
              setShowExample(true);
            }}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            📝 Load Interview Example (click to auto-fill)
          </button>
          {showExample && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Example loaded! You can now edit or proceed with the example data.
            </p>
          )}
        </div>
      )}

      {(inputMode === 'manual' || inputMode === 'example' || (inputMode === 'dataset' && criteria.length > 0)) && (
        <div>

          {/* Goal */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📌 Decision Goal/Problem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Select the best candidate..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Criteria */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700">
                📊 Evaluation Criteria (min 2) <span className="text-red-500">*</span>
              </label>
              <button onClick={addCriterion} className="btn-secondary text-sm">
                + Add Criterion
              </button>
            </div>

            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      placeholder={`Criterion ${index + 1}`}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                      value={criteriaTypes[index]}
                      onChange={(e) =>
                        updateCriteriaType(index, e.target.value as 'benefit' | 'cost')
                      }
                      className="w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="benefit">📈 Benefit (higher is better)</option>
                      <option value="cost">📉 Cost (lower is better)</option>
                    </select>

                    {criteria.length > 2 && (
                      <button
                        onClick={() => removeCriterion(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidates */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700">
                👥 Candidates to Evaluate (min 2) <span className="text-red-500">*</span>
              </label>
              <button onClick={addAlternative} className="btn-secondary text-sm">
                + Add Candidate
              </button>
            </div>

            <div className="space-y-3">
              {alternatives.slice(0, showAllCandidates ? alternatives.length : 15).map((alt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 text-center text-gray-500 font-medium">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={alt}
                    onChange={(e) => updateAlternative(index, e.target.value)}
                    placeholder={`Candidate ${index + 1}`}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            
            {/* Show More/Less Button */}
            {alternatives.length > 15 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllCandidates(!showAllCandidates)}
                  className="px-6 py-2 bg-white hover:bg-blue-50 border-2 border-blue-300 text-blue-700 font-semibold rounded-lg transition-colors"
                >
                  {showAllCandidates ? '▲' : '▼'} {showAllCandidates ? 'Collapse' : `Show All Candidates (${alternatives.length - 15} more)`}
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {!canProceed && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
          ❌ Please fill in all required fields
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`btn-primary ${!canProceed && 'opacity-50 cursor-not-allowed'}`}
        >
          Define Criteria Preferences (Fuzzy AHP) →
        </button>
      </div>
    </div>
  );


}
