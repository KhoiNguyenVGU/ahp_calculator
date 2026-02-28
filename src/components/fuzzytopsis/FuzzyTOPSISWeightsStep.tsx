'use client';

import React, { useEffect, useState } from 'react';
import { TFN } from '@/utils/fahp';
import { fuzzyTopsisWeightScale } from '@/utils/fuzzyTopsis';

interface FuzzyTOPSISWeightsStepProps {
  criteria: string[];
  fuzzyWeights: TFN[];
  setFuzzyWeights: (weights: TFN[]) => void;
  onNext: () => void;
  onBack: () => void;
}

type ImportanceKey = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
type ConfidenceKey = 'low' | 'medium' | 'high';

const importanceOptions: { key: ImportanceKey; label: string; description: string }[] = [
  { key: 'very_low', label: 'Very Low', description: 'Not very important' },
  { key: 'low', label: 'Low', description: 'Slightly important' },
  { key: 'medium', label: 'Medium', description: 'Moderately important' },
  { key: 'high', label: 'High', description: 'Important' },
  { key: 'very_high', label: 'Very High', description: 'Extremely important' },
];

const confidenceOptions: { key: ConfidenceKey; label: string; description: string }[] = [
  { key: 'low', label: 'Low confidence', description: 'Use a wider range' },
  { key: 'medium', label: 'Medium confidence', description: 'Use a moderate range' },
  { key: 'high', label: 'High confidence', description: 'Use a tight range' },
];

const confidenceSpread: Record<ConfidenceKey, number> = {
  low: 0.2,
  medium: 0.12,
  high: 0.06,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const closestImportance = (weight: TFN): ImportanceKey => {
  const keys: ImportanceKey[] = ['very_low', 'low', 'medium', 'high', 'very_high'];
  let bestKey: ImportanceKey = 'medium';
  let bestDiff = Number.POSITIVE_INFINITY;

  keys.forEach((key) => {
    const base = fuzzyTopsisWeightScale[key];
    const diff = Math.abs(weight.m - base.m);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestKey = key;
    }
  });

  return bestKey;
};

const closestConfidence = (weight: TFN): ConfidenceKey => {
  const halfSpread = Math.max(0, (weight.u - weight.l) / 2);
  const keys: ConfidenceKey[] = ['low', 'medium', 'high'];
  let bestKey: ConfidenceKey = 'medium';
  let bestDiff = Number.POSITIVE_INFINITY;

  keys.forEach((key) => {
    const diff = Math.abs(halfSpread - confidenceSpread[key]);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestKey = key;
    }
  });

  return bestKey;
};

const buildWeight = (importance: ImportanceKey, confidence: ConfidenceKey): TFN => {
  const base = fuzzyTopsisWeightScale[importance] || fuzzyTopsisWeightScale.medium;
  const m = clamp01(base.m);
  const spread = confidenceSpread[confidence];
  const l = clamp01(m - spread);
  const u = clamp01(m + spread);

  return { l, m, u };
};

export default function FuzzyTOPSISWeightsStep({
  criteria,
  fuzzyWeights,
  setFuzzyWeights,
  onNext,
  onBack,
}: FuzzyTOPSISWeightsStepProps) {
  const [importanceByCriterion, setImportanceByCriterion] = useState<ImportanceKey[]>([]);
  const [confidenceByCriterion, setConfidenceByCriterion] = useState<ConfidenceKey[]>([]);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    setImportanceByCriterion(
      criteria.map((_, index) => closestImportance(fuzzyWeights[index] || { l: 0.3, m: 0.5, u: 0.7 }))
    );
    setConfidenceByCriterion(
      criteria.map((_, index) => closestConfidence(fuzzyWeights[index] || { l: 0.3, m: 0.5, u: 0.7 }))
    );
  }, [criteria.length]);

  useEffect(() => {
    if (importanceByCriterion.length !== criteria.length || confidenceByCriterion.length !== criteria.length) {
      return;
    }

    const newWeights = criteria.map((_, index) =>
      buildWeight(importanceByCriterion[index], confidenceByCriterion[index])
    );
    setFuzzyWeights(newWeights);
  }, [criteria, importanceByCriterion, confidenceByCriterion, setFuzzyWeights]);

  const updateImportance = (index: number, value: ImportanceKey) => {
    const next = [...importanceByCriterion];
    next[index] = value;
    setImportanceByCriterion(next);
  };

  const updateConfidence = (index: number, value: ConfidenceKey) => {
    const next = [...confidenceByCriterion];
    next[index] = value;
    setConfidenceByCriterion(next);
  };

  const setAllMedium = () => {
    setImportanceByCriterion(criteria.map(() => 'medium'));
    setConfidenceByCriterion(criteria.map(() => 'medium'));
  };

  const canProceed = criteria.length >= 2;

  return (
    <div className="card max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Fuzzy TOPSIS - Set Importance</h2>
      <p className="text-gray-800 mb-6">
        Choose how important each criterion is, then choose how confident you feel about that choice.
      </p>

      <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Simple mode</h3>
        <p className="text-sm text-blue-800">
          You only select importance and confidence. The system automatically creates the fuzzy range in the background.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={setAllMedium} className="btn-secondary">
          Set All to Medium + Medium Confidence
        </button>
        <button onClick={() => setShowTechnical(!showTechnical)} className="btn-secondary">
          {showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {criteria.map((criterion, index) => {
          const weight = fuzzyWeights[index] || buildWeight('medium', 'medium');
          const selectedImportance = importanceByCriterion[index] || 'medium';
          const selectedConfidence = confidenceByCriterion[index] || 'medium';

          return (
            <div key={index} className="p-4 rounded-lg border border-blue-200 bg-white">
              <div className="mb-3">
                <h4 className="text-base font-semibold text-gray-900">{criterion || `Criterion ${index + 1}`}</h4>
                <p className="text-sm text-blue-800 mt-1">Set how important this criterion is in the final decision.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">How important is this criterion?</label>
                  <select
                    value={selectedImportance}
                    onChange={(e) => updateImportance(index, e.target.value as ImportanceKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {importanceOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">How confident are you?</label>
                  <select
                    value={selectedConfidence}
                    onChange={(e) => updateConfidence(index, e.target.value as ConfidenceKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {confidenceOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-800 mt-3">
                Importance for <span className="font-semibold">{criterion || `Criterion ${index + 1}`}</span> is set to{' '}
                <span className="font-semibold text-blue-700">{importanceOptions.find(o => o.key === selectedImportance)?.label}</span>{' '}
                with <span className="font-semibold text-blue-700">{confidenceOptions.find(o => o.key === selectedConfidence)?.label}</span>.
              </p>

              {showTechnical && (
                <p className="text-xs text-gray-700 mt-2 font-mono bg-gray-100 border border-gray-200 rounded px-2 py-1 inline-block">
                  Generated fuzzy weight: ({weight.l.toFixed(2)}, {weight.m.toFixed(2)}, {weight.u.toFixed(2)})
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">Tips</h3>
        <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
          <li>Start with simple choices first; technical values are optional</li>
          <li>Higher importance means this criterion has more impact on ranking</li>
          <li>Lower confidence means a wider uncertainty range is used</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="btn-primary">
          Calculate Results →
        </button>
      </div>
    </div>
  );
}
