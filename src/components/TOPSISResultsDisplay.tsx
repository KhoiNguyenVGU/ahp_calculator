'use client';

import React, { useState } from 'react';
import { TOPSISResult } from '@/utils/topsis';

interface TOPSISResultsDisplayProps {
  criteria: string[];
  alternatives: string[];
  criteriaTypes: ('benefit' | 'cost')[];
  weights: number[];
  results: TOPSISResult;
  onRestart: () => void;
}

export default function TOPSISResultsDisplay({
  criteria,
  alternatives,
  criteriaTypes,
  weights,
  results,
  onRestart,
}: TOPSISResultsDisplayProps) {
  const [showStep, setShowStep] = useState(0);

  const {
    rawMatrix,
    normalizedMatrix,
    weightedNormalizedMatrix,
    idealBest,
    idealWorst,
    distanceFromBest,
    distanceFromWorst,
    performanceScores,
    rankings,
  } = results;

  // Find the best alternative (rank 1)
  const bestIndex = rankings.indexOf(1);
  const bestScore = performanceScores[bestIndex];

  // Sort for ranking display
  const ranking = alternatives
    .map((alt, index) => ({ name: alt, score: performanceScores[index], rank: rankings[index], index }))
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
          <h2 className="text-xl mb-2">🏆 Best Alternative (TOPSIS)</h2>
          <div className="text-4xl font-bold mb-2">{alternatives[bestIndex]}</div>
          <div className="text-xl opacity-90">
            Performance Score: {bestScore.toFixed(6)}
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
                      {rawMatrix[i].map((val, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center">{val}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 p-2">√Σx²</td>
                    {criteria.map((_, j) => {
                      const sumSq = rawMatrix.reduce((sum, row) => sum + row[j] ** 2, 0);
                      return (
                        <td key={j} className="border border-gray-300 p-2 text-center text-blue-600">
                          {Math.sqrt(sumSq).toFixed(4)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Formula:</strong> For each column j: √(Σx²ᵢⱼ)
            </div>
          </div>
        )}

        {/* Step 2: Normalized Matrix */}
        {showStep === 1 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 2: Normalized Decision Matrix</h4>
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
                      {normalizedMatrix[i].map((val, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center">
                          <div className="text-xs text-gray-500">
                            {rawMatrix[i][j]} / {Math.sqrt(rawMatrix.reduce((s, r) => s + r[j] ** 2, 0)).toFixed(4)}
                          </div>
                          <div className="font-medium">{val.toFixed(4)}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Formula:</strong> rᵢⱼ = xᵢⱼ / √(Σx²ᵢⱼ)
            </div>
          </div>
        )}

        {/* Step 3: Weighted Normalized Matrix */}
        {showStep === 2 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 3: Weighted Normalized Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-200">
                    <th className="border border-gray-300 p-2">Weightage →</th>
                    {weights.map((w, i) => (
                      <th key={i} className="border border-gray-300 p-2 text-center">{w.toFixed(4)}</th>
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
                      {weightedNormalizedMatrix[i].map((val, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center">
                          <div className="text-xs text-gray-500">
                            {normalizedMatrix[i][j].toFixed(4)} × {weights[j]}
                          </div>
                          <div className="font-medium">{val.toFixed(4)}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong>Formula:</strong> vᵢⱼ = wⱼ × rᵢⱼ
            </div>
          </div>
        )}

        {/* Step 4: Ideal Values */}
        {showStep === 3 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 4: Ideal Best (V⁺) and Ideal Worst (V⁻)</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="border border-gray-300 p-2 bg-blue-100">
                        {c}
                        <div className="text-xs">({criteriaTypes[i] === 'benefit' ? 'Higher Better' : 'Lower Better'})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      {weightedNormalizedMatrix[i].map((val, j) => (
                        <td key={j} className="border border-gray-300 p-2 text-center">{val.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 p-2">V⁺ (Ideal Best)</td>
                    {idealBest.map((val, j) => (
                      <td key={j} className="border border-gray-300 p-2 text-center text-green-700">{val.toFixed(4)}</td>
                    ))}
                  </tr>
                  <tr className="bg-red-50 font-semibold">
                    <td className="border border-gray-300 p-2">V⁻ (Ideal Worst)</td>
                    {idealWorst.map((val, j) => (
                      <td key={j} className="border border-gray-300 p-2 text-center text-red-700">{val.toFixed(4)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p><strong>V⁺ (Ideal Best):</strong> For Higher Better criteria: MAX value. For Lower Better criteria: MIN value.</p>
              <p><strong>V⁻ (Ideal Worst):</strong> For Higher Better criteria: MIN value. For Lower Better criteria: MAX value.</p>
            </div>
          </div>
        )}

        {/* Step 5: Distances & Scores */}
        {showStep === 4 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Step 5: Separation Distances & Performance Scores</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-orange-100">Alternative</th>
                    <th className="border border-gray-300 p-2 bg-blue-100">S⁺ (Distance from Best)</th>
                    <th className="border border-gray-300 p-2 bg-blue-100">S⁻ (Distance from Worst)</th>
                    <th className="border border-gray-300 p-2 bg-blue-100">S⁺ + S⁻</th>
                    <th className="border border-gray-300 p-2 bg-green-100">Pᵢ (Performance Score)</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt, i) => (
                    <tr key={i} className={rankings[i] === 1 ? 'bg-green-50' : ''}>
                      <td className="border border-gray-300 p-2 font-medium bg-orange-50">{alt}</td>
                      <td className="border border-gray-300 p-2 text-center">{distanceFromBest[i].toFixed(4)}</td>
                      <td className="border border-gray-300 p-2 text-center">{distanceFromWorst[i].toFixed(4)}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {(distanceFromBest[i] + distanceFromWorst[i]).toFixed(4)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-bold text-green-700">
                        {performanceScores[i].toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p><strong>S⁺:</strong> √Σ(vᵢⱼ - V⁺ⱼ)² — Euclidean distance from ideal best</p>
              <p><strong>S⁻:</strong> √Σ(vᵢⱼ - V⁻ⱼ)² — Euclidean distance from ideal worst</p>
              <p><strong>Pᵢ:</strong> S⁻ / (S⁺ + S⁻) — Performance score (higher is better)</p>
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
                    <th className="border border-gray-300 p-3 bg-blue-100">Performance Score (Pᵢ)</th>
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
        <button onClick={onRestart} className="btn-primary">
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
