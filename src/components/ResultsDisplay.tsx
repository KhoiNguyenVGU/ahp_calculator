'use client';

import React from 'react';
import { AHPResult } from '@/utils/ahp';

interface ResultsDisplayProps {
  goalName: string;
  criteria: string[];
  alternatives: string[];
  results: AHPResult;
  onRestart: () => void;
}

export default function ResultsDisplay({
  goalName,
  criteria,
  alternatives,
  results,
  onRestart,
}: ResultsDisplayProps) {
  const { criteriaWeights, alternativeScores, finalScores, consistencyRatios } = results;

  // Find the best alternative
  const maxScore = Math.max(...finalScores);
  const bestIndex = finalScores.indexOf(maxScore);

  // Sort alternatives by score for ranking
  const ranking = alternatives
    .map((alt, index) => ({ name: alt, score: finalScores[index], index }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Winner Banner */}
      <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">🏆 Best Alternative for "{goalName}"</h2>
          <div className="text-4xl font-bold mb-2">{alternatives[bestIndex]}</div>
          <div className="text-xl opacity-90">
            Score: {(maxScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Final Rankings */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Final Rankings</h3>
        <div className="space-y-3">
          {ranking.map((item, rank) => (
            <div
              key={item.index}
              className={`flex items-center p-4 rounded-lg ${
                rank === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                  rank === 0
                    ? 'bg-green-500 text-white'
                    : rank === 1
                    ? 'bg-gray-400 text-white'
                    : rank === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {rank + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      rank === 0 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.score * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 ml-4">
                {(item.score * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Weights */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Criteria Weights</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Criterion</th>
                <th className="text-right p-2">Weight</th>
                <th className="text-left p-2 w-1/2">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{criterion}</td>
                  <td className="p-2 text-right">{(criteriaWeights[index] * 100).toFixed(1)}%</td>
                  <td className="p-2">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${criteriaWeights[index] * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm">
          <span
            className={`px-2 py-1 rounded ${
              consistencyRatios.criteria <= 0.1
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Consistency Ratio: {(consistencyRatios.criteria * 100).toFixed(1)}%
            {consistencyRatios.criteria <= 0.1 ? ' ✓ Acceptable' : ' ⚠ Inconsistent (>10%)'}
          </span>
        </div>
      </div>

      {/* Composition Table */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Composition & Synthesis
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows how each alternative scores on each criterion and the weighted final score.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2"></th>
                {criteria.map((c, i) => (
                  <th key={i} className="border p-2 text-center">
                    <div>{c}</div>
                    <div className="text-xs text-gray-500">
                      ({(criteriaWeights[i] * 100).toFixed(0)}%)
                    </div>
                  </th>
                ))}
                <th className="border p-2 text-center bg-blue-50">Final Score</th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt, aIndex) => (
                <tr key={aIndex} className={aIndex === bestIndex ? 'bg-green-50' : ''}>
                  <td className="border p-2 font-medium">{alt}</td>
                  {criteria.map((_, cIndex) => (
                    <td key={cIndex} className="border p-2 text-center">
                      {(alternativeScores[cIndex][aIndex] * 100).toFixed(0)}%
                    </td>
                  ))}
                  <td
                    className={`border p-2 text-center font-bold ${
                      aIndex === bestIndex ? 'bg-green-100 text-green-800' : 'bg-blue-50'
                    }`}
                  >
                    {(finalScores[aIndex] * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Example */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Calculation Example ({alternatives[0]}):</h4>
          <p className="text-sm text-gray-600 font-mono">
            {criteria
              .map(
                (_, i) =>
                  `${(criteriaWeights[i]).toFixed(2)} × ${(alternativeScores[i][0]).toFixed(2)}`
              )
              .join(' + ')}{' '}
            = {finalScores[0].toFixed(2)}
          </p>
        </div>
      </div>

      {/* Consistency Summary */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Consistency Check</h3>
        <p className="text-sm text-gray-600 mb-4">
          A Consistency Ratio (CR) below 10% indicates acceptable consistency in judgments.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg ${
              consistencyRatios.criteria <= 0.1 ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="font-medium">Criteria Comparisons</div>
            <div className="text-2xl font-bold">
              {(consistencyRatios.criteria * 100).toFixed(1)}%
            </div>
            <div className="text-sm">
              {consistencyRatios.criteria <= 0.1 ? '✓ Consistent' : '⚠ Review needed'}
            </div>
          </div>
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                consistencyRatios.alternatives[index] <= 0.1 ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="font-medium">{criterion}</div>
              <div className="text-2xl font-bold">
                {(consistencyRatios.alternatives[index] * 100).toFixed(1)}%
              </div>
              <div className="text-sm">
                {consistencyRatios.alternatives[index] <= 0.1
                  ? '✓ Consistent'
                  : '⚠ Review needed'}
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
