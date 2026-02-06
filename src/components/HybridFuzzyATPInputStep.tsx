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
    <div className="card max-w-4xl mx-auto">
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
          <button
            onClick={() => setInputMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✏️ Manual Entry
          </button>
          <button
            onClick={() => setInputMode('example')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'example' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Example Data
          </button>
          <button
            onClick={() => setInputMode('dataset')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'dataset' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Import Dataset
          </button>
        </div>
      </div>

      {/* Dataset Loader */}
      {inputMode === 'dataset' && (
        <div className="mb-8">
          <DatasetLoader
            onDataLoaded={handleDataLoaded}
            onMappingComplete={handleMappingComplete}
          />
        </div>
      )}

      {/* Example Data Loader */}
      {inputMode === 'example' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <button
            onClick={() => {
              loadExampleData();
              setShowExample(true);
            }}
            className="text-s font-semibold text-green-700 hover:text-green-800"
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

      {/* Manual Input Form */}
      {(inputMode === 'manual' || inputMode === 'example' || (inputMode === 'dataset' && criteria.length > 0)) && (
        <div>

      {/* Goal Definition */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-700">
            📌 Decision Goal/Problem <span className="text-red-500">*</span>
          </label>
          <span
            className="text-xs text-gray-500 cursor-help"
            title="e.g., 'Select the best candidate for Senior Software Engineer position'"
          >
            ℹ️ Example
          </span>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Select the best candidate for Senior Software Engineer position"
          className="input w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe what you're trying to decide or achieve
        </p>
      </div>

      {/* Criteria Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">
            📊 Evaluation Criteria (min 2) <span className="text-red-500">*</span>
          </label>
          <button onClick={addCriterion} className="btn-secondary text-sm">
            + Add Criterion
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-xs text-blue-800">
          <strong>💡 About Criteria:</strong> Define what qualities/skills you'll evaluate candidates on.
          These will be compared pairwise using Fuzzy AHP to determine their importance weights.
          Example for hiring: Technical Skills, Communication, Problem-Solving, Leadership, Experience
        </div>

        <div className="space-y-3">
          {criteria.map((criterion, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <input
                  type="text"
                  value={criterion}
                  onChange={(e) => updateCriterion(index, e.target.value)}
                  placeholder={`Criterion ${index + 1}`}
                  className="input"
                />
                <select
                  value={criteriaTypes[index]}
                  onChange={(e) =>
                    updateCriteriaType(index, e.target.value as 'benefit' | 'cost')
                  }
                  className="input"
                >
                  <option value="benefit">📈 Benefit (higher is better)</option>
                  <option value="cost">📉 Cost (lower is better)</option>
                </select>
              </div>
              {criteria.length > 2 && (
                <button
                  onClick={() => removeCriterion(index)}
                  className="btn-danger text-xs w-full"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives/Candidates Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">
            👥 Candidates to Evaluate (min 2) <span className="text-red-500">*</span>
          </label>
          <button onClick={addAlternative} className="btn-secondary text-sm">
            + Add Candidate
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs text-yellow-800">
          <strong>💡 About Candidates:</strong> These are the options being evaluated.
          In the next steps, you'll rate each candidate on each criterion and compare criteria importance.
        </div>

        <div className="space-y-2">
          {alternatives.map((alt, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={alt}
                onChange={(e) => updateAlternative(index, e.target.value)}
                placeholder={`Candidate ${index + 1}`}
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

      {/* Workflow Overview */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
        <h3 className="font-bold text-purple-900 mb-2">🎯 Next Steps Overview:</h3>
        <ol className="text-sm text-purple-800 space-y-1 ml-4 list-decimal">
          <li><strong>Step 2 - Fuzzy AHP:</strong> You'll compare criteria pairwise to determine their importance weights</li>
          <li><strong>Step 3 - Candidate Scoring:</strong> You'll rate each candidate on each criterion (1-10 scale)</li>
          <li><strong>Step 4 - Results:</strong> System ranks candidates using the weighted criteria, exports reports, and shows comparisons</li>
        </ol>
      </div>

        </div>
      )}

      {/* Validation Message */}
      {!canProceed && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
          ❌ Please fill in all fields marked with <span className="text-red-500">*</span> to proceed
        </div>
      )}

      {/* Action Button */}
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
