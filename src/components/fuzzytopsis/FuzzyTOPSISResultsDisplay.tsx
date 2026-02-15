'use client';

import React, { useState } from 'react';
import { FuzzyTOPSISResult } from '@/utils/fuzzyTopsis';
import { TFN, formatTFN } from '@/utils/fahp';
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
  const [expandedSection, setExpandedSection] = useState<string>('summary');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // Sort alternatives by ranking for display
  const sortedAlternatives = alternatives
    .map((alt, index) => ({
      name: alt,
      score: result.performanceScores[index],
      rank: result.rankings[index],
      distance_best: result.crispDistanceFromBest[index],
      distance_worst: result.crispDistanceFromWorst[index],
    }))
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Fuzzy TOPSIS Results</h2>
      <p className="text-gray-600 mb-6">
        Decision analysis using Fuzzy Triangular Numbers with TOPSIS Method
      </p>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ranking Summary</h3>
        <div className="space-y-3">
          {sortedAlternatives.map((alt, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                          ? 'bg-orange-400'
                          : 'bg-blue-400'
                  }`}
                >
                  {alt.rank}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{alt.name}</p>
                  <p className="text-xs text-gray-500">
                    Closeness Coefficient
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {alt.score.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        {/* Input Data Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('input')}
            className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>📊 Input Data & Weights</span>
            <span>{expandedSection === 'input' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'input' && (
            <div className="p-6 space-y-6">
              {/* Input Matrix */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Decision Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Alternative
                        </th>
                        {criteria.map((crit, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-4 py-2 text-left font-semibold"
                          >
                            {crit}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alternatives.map((alt, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">
                            {alt}
                          </td>
                          {criteria.map((_, j) => (
                            <td key={j} className="border border-gray-300 px-4 py-2">
                              {result.fuzzyMatrix[i][j].m.toFixed(4)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fuzzy Weights */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Fuzzy Criterion Weights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteria.map((crit, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
                    >
                      <h5 className="font-semibold text-gray-800 mb-2">{crit}</h5>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Type:</span>{' '}
                        {criteriaTypes[index] === 'benefit' ? '📈 Benefit' : '📉 Cost'}
                      </p>
                      <p className="text-sm text-gray-700 font-mono bg-white rounded px-2 py-1">
                        {formatFuzzyTFN(fuzzyWeights[index], 3)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Normalized Matrix */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('normalized')}
            className="w-full px-6 py-4 bg-green-50 hover:bg-green-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>📈 Normalized Fuzzy Matrix</span>
            <span>{expandedSection === 'normalized' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'normalized' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                        Alternative
                      </th>
                      {criteria.map((crit, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-2 py-2 text-left font-semibold"
                        >
                          {crit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-2 font-semibold">
                          {alt}
                        </td>
                        {criteria.map((_, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 px-2 py-2 font-mono"
                          >
                            {formatFuzzyTFN(
                              result.normalizedFuzzyMatrix[i][j],
                              2
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Weighted Normalized Matrix */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('weighted')}
            className="w-full px-6 py-4 bg-orange-50 hover:bg-orange-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>⚖️ Weighted Normalized Fuzzy Matrix</span>
            <span>{expandedSection === 'weighted' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'weighted' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold">
                        Alternative
                      </th>
                      {criteria.map((crit, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-2 py-2 text-left font-semibold"
                        >
                          {crit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-2 font-semibold">
                          {alt}
                        </td>
                        {criteria.map((_, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 px-2 py-2 font-mono"
                          >
                            {formatFuzzyTFN(
                              result.weightedNormalizedFuzzyMatrix[i][j],
                              3
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Ideal Values */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('ideal')}
            className="w-full px-6 py-4 bg-cyan-50 hover:bg-cyan-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>🎯 Fuzzy Ideal Values (Best & Worst)</span>
            <span>{expandedSection === 'ideal' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'ideal' && (
            <div className="p-6 space-y-4">
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">
                  Fuzzy Ideal Best (F⁺)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteria.map((crit, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 rounded p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {crit}
                      </p>
                      <p className="text-sm font-mono text-green-700 mt-1">
                        {formatFuzzyTFN(result.idealBestFuzzy[index], 3)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">
                  Fuzzy Ideal Worst (F⁻)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteria.map((crit, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {crit}
                      </p>
                      <p className="text-sm font-mono text-red-700 mt-1">
                        {formatFuzzyTFN(result.idealWorstFuzzy[index], 3)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distances and Scores */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('distances')}
            className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>📏 Separation Distances & Closeness Scores</span>
            <span>{expandedSection === 'distances' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'distances' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Alternative
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        d⁺ (Dist. to Ideal Best)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        d⁻ (Dist. to Ideal Worst)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        CC (Closeness)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">
                          {alt}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">
                          {result.crispDistanceFromBest[i].toFixed(4)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">
                          {result.crispDistanceFromWorst[i].toFixed(4)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-bold text-purple-600">
                          {result.performanceScores[i].toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button onClick={onReset} className="btn-secondary">
          ← Start Over
        </button>
      </div>
    </div>
  );
}
