'use client';

import React, { useState } from 'react';
import { FAHPResult, formatTFN, sumTFNs } from '../utils/fahp';

interface FAHPResultsDisplayProps {
  result: FAHPResult;
  criteria: string[];
  alternatives: string[];
  goal: string;
  onReset: () => void;
}

export default function FAHPResultsDisplay({
  result,
  criteria,
  alternatives,
  goal,
  onReset,
}: FAHPResultsDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCriterion, setSelectedCriterion] = useState(0);

  const steps = [
    'Fuzzy Criteria Matrix',
    'Criteria Geometric Means',
    'Fuzzy Criteria Weights',
    'Crisp Criteria Weights',
    'Alternative Matrices',
    'Alternative Weights',
    'Final Results',
  ];

  const winnerIndex = result.rankings.indexOf(1);
  const winner = alternatives[winnerIndex];

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-lg text-white text-center">
        <h2 className="text-2xl font-bold mb-2">🎉 Fuzzy AHP Results</h2>
        <p className="text-lg opacity-90">Goal: {goal}</p>
        <div className="mt-4 bg-white/20 rounded-lg p-4 inline-block">
          <p className="text-sm uppercase tracking-wide opacity-80">Best Alternative</p>
          <p className="text-3xl font-bold">{winner}</p>
          <p className="text-sm opacity-80">Score: {result.finalScores[winnerIndex].toFixed(4)}</p>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStep === index
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Step 0: Fuzzy Criteria Matrix */}
        {currentStep === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 1: Fuzzified Pairwise Comparison Matrix (Criteria)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Crisp comparison values converted to Triangular Fuzzy Numbers (l, m, u).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border"></th>
                    {criteria.map((c, i) => (
                      <th key={i} className="p-3 text-center border min-w-[130px]">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border bg-purple-50">{c}</td>
                      {result.fuzzyCriteriaMatrix[i].map((tfn, j) => (
                        <td key={j} className={`p-3 text-center border font-mono text-xs ${i === j ? 'bg-purple-100' : ''}`}>
                          {formatTFN(tfn)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 1: Geometric Means */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 2: Fuzzy Geometric Mean (r̃ᵢ)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              r̃ᵢ = (∏ãᵢⱼ)^(1/n) - Calculate geometric mean for each row.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border">Criterion</th>
                    <th className="p-3 text-center border">Fuzzy Geometric Mean (l, m, u)</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border">{c}</td>
                      <td className="p-3 text-center border font-mono">
                        {formatTFN(result.criteriaGeometricMeans[i], 3)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-purple-100 font-semibold">
                    <td className="p-3 border">Sum (r̃₁ ⊕ r̃₂ ⊕ ... ⊕ r̃ₙ)</td>
                    <td className="p-3 text-center border font-mono">
                      {formatTFN(sumTFNs(result.criteriaGeometricMeans), 3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 2: Fuzzy Weights */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 3: Fuzzy Weights (w̃ᵢ)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              w̃ᵢ = r̃ᵢ ⊗ (r̃₁ ⊕ r̃₂ ⊕ ... ⊕ r̃ₙ)⁻¹
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm font-mono">
              <p>Sum inverse: (1/{sumTFNs(result.criteriaGeometricMeans).u.toFixed(3)}, 
                 1/{sumTFNs(result.criteriaGeometricMeans).m.toFixed(3)}, 
                 1/{sumTFNs(result.criteriaGeometricMeans).l.toFixed(3)})</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border">Criterion</th>
                    <th className="p-3 text-center border">Geometric Mean</th>
                    <th className="p-3 text-center border">Fuzzy Weight (l, m, u)</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border">{c}</td>
                      <td className="p-3 text-center border font-mono text-xs">
                        {formatTFN(result.criteriaGeometricMeans[i], 3)}
                      </td>
                      <td className="p-3 text-center border font-mono">
                        {formatTFN(result.fuzzyCriteriaWeights[i], 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Crisp Weights */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 4: Defuzzified & Normalized Criteria Weights
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Defuzzify using Center of Area: wᵢ = (l + m + u) / 3, then normalize.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border">Criterion</th>
                    <th className="p-3 text-center border">Fuzzy Weight</th>
                    <th className="p-3 text-center border">Crisp Weight</th>
                    <th className="p-3 text-center border">Normalized Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border">{c}</td>
                      <td className="p-3 text-center border font-mono text-xs">
                        {formatTFN(result.fuzzyCriteriaWeights[i], 3)}
                      </td>
                      <td className="p-3 text-center border">{result.crispCriteriaWeights[i].toFixed(4)}</td>
                      <td className="p-3 text-center border font-semibold text-purple-600">
                        {result.normalizedCriteriaWeights[i].toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-purple-100 font-semibold">
                    <td className="p-3 border">Total</td>
                    <td className="p-3 border"></td>
                    <td className="p-3 text-center border">
                      {result.crispCriteriaWeights.reduce((a, b) => a + b, 0).toFixed(4)}
                    </td>
                    <td className="p-3 text-center border">1.0000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Bar Chart */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">Criteria Weight Distribution</h4>
              <div className="space-y-2">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-gray-600 truncate">{c}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${result.normalizedCriteriaWeights[i] * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {(result.normalizedCriteriaWeights[i] * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Alternative Matrices */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 5: Fuzzy Alternative Comparison Matrices
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {criteria.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCriterion(i)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    selectedCriterion === i
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border"></th>
                    {alternatives.map((a, i) => (
                      <th key={i} className="p-3 text-center border min-w-[130px]">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((a, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border bg-purple-50">{a}</td>
                      {result.fuzzyAlternativeMatrices[selectedCriterion][i].map((tfn, j) => (
                        <td key={j} className={`p-3 text-center border font-mono text-xs ${i === j ? 'bg-purple-100' : ''}`}>
                          {formatTFN(tfn)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 5: Alternative Weights */}
        {currentStep === 5 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 6: Alternative Weights per Criterion
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="p-3 text-center border">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((a, aIdx) => (
                    <tr key={aIdx} className={aIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border">{a}</td>
                      {criteria.map((_, cIdx) => (
                        <td key={cIdx} className="p-3 text-center border">
                          {result.normalizedAlternativeWeights[cIdx][aIdx].toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              These are the normalized weights of alternatives for each criterion, calculated using Fuzzy AHP.
            </p>
          </div>
        )}

        {/* Step 6: Final Results */}
        {currentStep === 6 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Step 7: Final Ranking
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Final Score = Σ (Criteria Weight × Alternative Weight)
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="p-3 text-left border">Alternative</th>
                    {criteria.map((c, i) => (
                      <th key={i} className="p-3 text-center border text-xs">
                        {c}<br/>
                        <span className="text-purple-600">
                          (w={result.normalizedCriteriaWeights[i].toFixed(3)})
                        </span>
                      </th>
                    ))}
                    <th className="p-3 text-center border bg-purple-200">Final Score</th>
                    <th className="p-3 text-center border bg-purple-200">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((a, aIdx) => (
                    <tr key={aIdx} className={result.rankings[aIdx] === 1 ? 'bg-green-50' : aIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium border">{a}</td>
                      {criteria.map((_, cIdx) => (
                        <td key={cIdx} className="p-3 text-center border text-xs">
                          {result.normalizedAlternativeWeights[cIdx][aIdx].toFixed(4)}
                        </td>
                      ))}
                      <td className="p-3 text-center border font-semibold bg-purple-50">
                        {result.finalScores[aIdx].toFixed(4)}
                      </td>
                      <td className={`p-3 text-center border font-bold ${
                        result.rankings[aIdx] === 1 ? 'text-green-600 bg-green-100' : ''
                      }`}>
                        #{result.rankings[aIdx]}
                        {result.rankings[aIdx] === 1 && ' 🏆'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Score Chart */}
            <h4 className="font-medium text-gray-700 mb-3">Final Score Comparison</h4>
            <div className="space-y-2">
              {alternatives.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-600 truncate">{a}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8">
                    <div
                      className={`h-8 rounded-full flex items-center justify-end pr-2 ${
                        result.rankings[i] === 1 ? 'bg-green-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${result.finalScores[i] * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {(result.finalScores[i] * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <span className={`w-12 text-center font-bold ${
                    result.rankings[i] === 1 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    #{result.rankings[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
