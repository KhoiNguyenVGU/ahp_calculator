'use client';

import React from 'react';
import { HybridFuzzyATPTopsisResult } from '@/utils/hybridFuzzyATPTopsis';

interface CandidateComparisonProps {
  result: HybridFuzzyATPTopsisResult;
  criteria: string[];
  alternatives: string[];
}

export default function CandidateComparison({
  result,
  criteria,
  alternatives,
}: CandidateComparisonProps) {
  // Rank candidates
  const ranked = alternatives
    .map((alt, idx) => ({
      name: alt,
      score: result.fuzzyTOPSISResult.performanceScores[idx],
      index: idx,
    }))
    .sort((a, b) => b.score - a.score);

  // Get top 3 for quick comparison
  const topThree = ranked.slice(0, 3);

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📊 Candidate Comparison View
      </h2>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {topThree.map((candidate, idx) => (
            <div
              key={candidate.index}
              className={`rounded-lg p-6 border-2 ${
                idx === 0
                  ? 'border-yellow-400 bg-yellow-50'
                  : idx === 1
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-orange-400 bg-orange-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {candidate.name}
                </h3>
                <span className="text-3xl">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
              </div>

              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600 mb-1">Closeness Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {candidate.score.toFixed(4)}
                </p>
              </div>

              {/* Show criteria scores for this candidate */}
              <div className="space-y-2">
                {criteria.map((crit, critIdx) => {
                  const score = result.fuzzyTOPSISResult.fuzzyMatrix[candidate.index][critIdx].m;
                  const maxScore = Math.max(
                    ...alternatives.map(
                      (_, altIdx) =>
                        result.fuzzyTOPSISResult.fuzzyMatrix[altIdx][critIdx].m
                    )
                  );
                  const percentage = (score / maxScore) * 100;

                  return (
                    <div key={critIdx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">
                          {crit}
                        </span>
                        <span className="text-gray-600">{score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            idx === 0
                              ? 'bg-yellow-500'
                              : idx === 1
                              ? 'bg-gray-400'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full comparison table */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        📋 Full Comparison Table
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Rank
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Candidate
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                Score
              </th>
              {criteria.map((crit, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-sm"
                >
                  {crit}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((candidate, rank) => (
              <tr key={candidate.index} className={rank % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2 font-bold text-lg">
                  {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {candidate.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold text-blue-600">
                  {candidate.score.toFixed(4)}
                </td>
                {criteria.map((_, critIdx) => (
                  <td
                    key={critIdx}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    <span className="font-semibold">
                      {result.fuzzyTOPSISResult.fuzzyMatrix[candidate.index][critIdx].m.toFixed(1)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistical Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-semibold mb-1">Best Candidate</p>
          <p className="text-lg font-bold text-blue-900">{ranked[0]?.name}</p>
          <p className="text-xs text-blue-600 mt-2">
            Score: {ranked[0]?.score.toFixed(4)}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-semibold mb-1">Score Range</p>
          <p className="text-lg font-bold text-green-900">
            {(ranked[ranked.length - 1]?.score - ranked[0]?.score).toFixed(4)}
          </p>
          <p className="text-xs text-green-600 mt-2">
            Highest - Lowest
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-semibold mb-1">Average Score</p>
          <p className="text-lg font-bold text-purple-900">
            {(
              ranked.reduce((sum, c) => sum + c.score, 0) / ranked.length
            ).toFixed(4)}
          </p>
          <p className="text-xs text-purple-600 mt-2">All candidates</p>
        </div>
      </div>
    </div>
  );
}
