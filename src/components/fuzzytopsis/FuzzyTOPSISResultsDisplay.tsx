'use client';

import React, { useState } from 'react';
import { FuzzyTOPSISResult } from '@/utils/fuzzyTopsis';
import { TFN } from '@/utils/fahp';
import { formatFuzzyTFN } from '@/utils/fuzzyTopsis';

interface FuzzyTOPSISResultsDisplayProps {
  result: FuzzyTOPSISResult;
  criteria: string[];
  alternatives: string[];
  criteriaTypes: ('benefit' | 'cost')[];
  fuzzyWeights: TFN[];
  onReset: () => void;
}

export default function FuzzyTOPSISResultsDisplay({
  result,
  criteria,
  alternatives,
  criteriaTypes,
  fuzzyWeights,
  onReset,
}: FuzzyTOPSISResultsDisplayProps) {
  const [showStep, setShowStep] = useState(0);

  const bestIndex = result.rankings.indexOf(1);
  const bestScore = result.performanceScores[bestIndex];

  const ranking = alternatives
    .map((alt, index) => ({
      name: alt,
      score: result.performanceScores[index],
      rank: result.rankings[index],
      index,
    }))
    .sort((a, b) => a.rank - b.rank);

  const steps = [
    'Raw Data',
    'Normalized Matrix',
    'Weighted Normalized',
    'Ideal Values',
    'Distances & Scores',
    'Final Ranking',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Winner Banner */}
      <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">🏆 Best Alternative (Fuzzy TOPSIS)</h2>
          <div className="text-4xl font-bold mb-2">{alternatives[bestIndex]}</div>
          <div className="text-xl opacity-90">
            Closeness Score: {bestScore.toFixed(6)}
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Calculation Steps</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setShowStep(index)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showStep === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {step}
            </button>
          ))}
        </div>

        {/* Step 1: Raw Data */}
        {showStep === 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 1: Raw Decision Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-100">
                    <th className="border border-gray-300 p-2">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="border border-gray-300 p-2 bg-blue-100">
                        {c}
                        <div className="text-xs text-gray-500">
                          ({criteriaTypes[i] === 'benefit' ? 'Higher Better' : 'Lower Better'})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      {criteria.map((_, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center">
                          {result.fuzzyMatrix[i][j].m.toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Note:</strong> Input values are crisp numbers represented as fuzzy numbers in the form (x, x, x).
            </div>
          </div>
        )}

        {/* Step 2: Normalized Matrix */}
        {showStep === 1 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 2: Normalized Fuzzy Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="border border-gray-300 p-2 bg-blue-100">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      {criteria.map((_, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center font-mono text-xs">
                          {formatFuzzyTFN(result.normalizedFuzzyMatrix[i][j], 3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Formula:</strong> r̃ᵢⱼ = x̃ᵢⱼ / √(Σx²ᵢⱼ)
            </div>
          </div>
        )}

        {/* Step 3: Weighted Normalized Matrix */}
        {showStep === 2 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 3: Weighted Normalized Fuzzy Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-200">
                    <th className="border border-gray-300 p-2">Fuzzy Weight →</th>
                    {fuzzyWeights.map((w, i) => (
                      <th key={i} className="border border-gray-300 p-2 text-center font-mono text-xs">
                        {formatFuzzyTFN(w, 2)}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="border border-gray-300 p-2 bg-blue-100">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      {criteria.map((_, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center font-mono text-xs">
                          {formatFuzzyTFN(result.weightedNormalizedFuzzyMatrix[i][j], 3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Formula:</strong> ṽᵢⱼ = w̃ⱼ ⊗ r̃ᵢⱼ
            </div>
          </div>
        )}

        {/* Step 4: Ideal Values */}
        {showStep === 3 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 4: Fuzzy Ideal Best (F⁺) and Fuzzy Ideal Worst (F⁻)</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Criterion</th>
                    <th className="border border-gray-300 p-2 bg-green-100">F⁺ (Ideal Best)</th>
                    <th className="border border-gray-300 p-2 bg-red-100">F⁻ (Ideal Worst)</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((crit, j) => (
                    <tr key={j}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{crit}</td>
                      <td className="border border-gray-300 p-2 text-center font-mono text-green-700">
                        {formatFuzzyTFN(result.idealBestFuzzy[j], 3)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-mono text-red-700">
                        {formatFuzzyTFN(result.idealWorstFuzzy[j], 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p><strong>F⁺ (Ideal Best):</strong> Benefit criterion uses highest value; cost criterion uses lowest value.</p>
              <p><strong>F⁻ (Ideal Worst):</strong> Benefit criterion uses lowest value; cost criterion uses highest value.</p>
            </div>
          </div>
        )}

        {/* Step 5: Distances & Scores */}
        {showStep === 4 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 5: Separation Distances & Closeness Scores</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Alternative</th>
                    <th className="border border-gray-300 p-2 bg-blue-100">d⁺ (Distance from Best)</th>
                    <th className="border border-gray-300 p-2 bg-blue-100">d⁻ (Distance from Worst)</th>
                    <th className="border border-gray-300 p-2 bg-green-100">CC (Closeness Score)</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i} className={result.rankings[i] === 1 ? 'bg-green-50' : ''}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      <td className="border border-gray-300 p-2 text-center">{result.crispDistanceFromBest[i].toFixed(4)}</td>
                      <td className="border border-gray-300 p-2 text-center">{result.crispDistanceFromWorst[i].toFixed(4)}</td>
                      <td className="border border-gray-300 p-2 text-center font-bold text-green-700">
                        {result.performanceScores[i].toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p><strong>CCᵢ:</strong> d⁻ᵢ / (d⁺ᵢ + d⁻ᵢ) — higher score means better alternative.</p>
            </div>
          </div>
        )}

        {/* Step 6: Final Ranking */}
        {showStep === 5 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 6: Final Ranking</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-orange-100">Alternative</th>
                    <th className="border border-gray-300 p-3 bg-blue-100">Closeness Score (CCᵢ)</th>
                    <th className="border border-gray-300 p-3 bg-green-100">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((item) => (
                    <tr key={item.index} className={item.rank === 1 ? 'bg-green-100' : ''}>
                      <td className="border border-gray-300 p-3 font-medium">{item.name}</td>
                      <td className="border border-gray-300 p-3 text-center">{item.score.toFixed(6)}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold ${
                          item.rank === 1 ? 'bg-green-500 text-white' :
                          item.rank === 2 ? 'bg-gray-400 text-white' :
                          item.rank === 3 ? 'bg-amber-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Visual Ranking */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Final Rankings</h3>
        <div className="space-y-3">
          {ranking.map((item) => (
            <div
              key={item.index}
              className={`flex items-center p-4 rounded-lg ${
                item.rank === 1 ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                  item.rank === 1
                    ? 'bg-green-500 text-white'
                    : item.rank === 2
                    ? 'bg-gray-400 text-white'
                    : item.rank === 3
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {item.rank}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${item.rank === 1 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${item.score * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 ml-4">
                {item.score.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <button onClick={onReset} className="btn-primary">
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
