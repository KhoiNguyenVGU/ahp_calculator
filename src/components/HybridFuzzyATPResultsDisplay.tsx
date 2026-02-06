'use client';

import React, { useState } from 'react';
import { HybridFuzzyATPTopsisResult } from '@/utils/hybridFuzzyATPTopsis';
import { TFN, formatTFN } from '@/utils/fahp';
import { exportToCSV, exportToJSON, downloadFile, generateHTMLReport } from '@/utils/exportResults';
import CandidateComparison from '@/components/CandidateComparison';

interface HybridFuzzyATPResultsDisplayProps {
  result: HybridFuzzyATPTopsisResult;
  goal: string;
  criteria: string[];
  alternatives: string[];
  criteriaTypes: ('benefit' | 'cost')[];
  onReset: () => void;
}

export default function HybridFuzzyATPResultsDisplay({
  result,
  goal,
  criteria,
  alternatives,
  criteriaTypes,
  onReset,
}: HybridFuzzyATPResultsDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string>('summary');
  const [viewMode, setViewMode] = useState<'ranking' | 'comparison'>('ranking');
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(result, goal, criteria, alternatives);
    downloadFile(csv, `interview-evaluation-${new Date().getTime()}.csv`, 'csv');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(result, goal, criteria, alternatives);
    downloadFile(json, `interview-evaluation-${new Date().getTime()}.json`, 'json');
  };

  const handleExportHTML = () => {
    const html = generateHTMLReport(result, goal, criteria, alternatives);
    const element = document.createElement('a');
    const file = new Blob([html], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `interview-evaluation-${new Date().getTime()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sortedAlternatives = alternatives
    .map((alt, index) => ({
      name: alt,
      rank: result.finalRankings[index],
      score: result.finalScores[index],
      distanceBest: result.fuzzyTOPSISResult.crispDistanceFromBest[index],
      distanceWorst: result.fuzzyTOPSISResult.crispDistanceFromWorst[index],
    }))
    .sort((a, b) => a.rank - b.rank);

  const displayedAlternatives = showAllCandidates 
    ? sortedAlternatives 
    : sortedAlternatives.slice(0, 15);

  return (
    <div className="card max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Hybrid Fuzzy AHP-TOPSIS Results
      </h2>
      <p className="text-gray-600 mb-2">
        <strong>Goal:</strong> {goal}
      </p>
      <p className="text-gray-600 mb-6">
        Combined Fuzzy AHP criterion weights with Fuzzy TOPSIS alternative ranking
      </p>

      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6 p-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => setViewMode('ranking')}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-all ${
            viewMode === 'ranking'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          🏆 Rankings
        </button>
        <button
          onClick={() => setViewMode('comparison')}
          className={`flex-1 py-2 px-4 rounded font-semibold transition-all ${
            viewMode === 'comparison'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📊 Comparison View
        </button>
      </div>

      {/* Rankings View */}
      {viewMode === 'ranking' && (
        <>
          {/* Final Rankings */}
          <div className="bg-gradient-to-r from-purple-50 via-cyan-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Final Rankings</h3>
            <div className="space-y-3">
              {displayedAlternatives.map((alt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-400'
                              : 'bg-blue-500'
                      }`}
                    >
                      {alt.rank}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{alt.name}</p>
                      <p className="text-xs text-gray-500">Closeness Coefficient</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{alt.score.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show More/Less Button */}
            {sortedAlternatives.length > 15 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllCandidates(!showAllCandidates)}
                  className="px-6 py-2 bg-white hover:bg-purple-50 border-2 border-purple-300 text-purple-700 font-semibold rounded-lg transition-colors"
                >
                  {showAllCandidates ? '▲' : '▼'} {showAllCandidates ? 'Show Top 15 Only' : `Show All Candidates (${sortedAlternatives.length - 15} more)`}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && (
        <div className="mb-6">
          <CandidateComparison result={result} criteria={criteria} alternatives={alternatives} />
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="space-y-4">
        {/* Phase 1: Fuzzy AHP Results */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('ahp')}
            className="w-full px-6 py-4 bg-purple-50 hover:bg-purple-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>📊 Phase 1: Fuzzy AHP - Criterion Weights</span>
            <span>{expandedSection === 'ahp' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'ahp' && (
            <div className="p-6 space-y-6">
              {/* Fuzzy Weights */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Fuzzy Criterion Weights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteria.map((crit, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
                    >
                      <p className="font-bold text-gray-800 mb-2">{crit}</p>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Type:</span>{' '}
                        {criteriaTypes[index] === 'benefit' ? '📈 Benefit' : '📉 Cost'}
                      </p>
                      <div className="bg-white rounded p-2 mb-2 font-mono text-sm text-purple-700">
                        {formatTFN(result.fuzzyAHPWeights[index], 3)}
                      </div>
                      <p className="text-xs text-gray-600">
                        <strong>Crisp:</strong> {result.crispAHPWeights[index].toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Normalized:</strong> {result.normalizedAHPWeights[index].toFixed(4)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pairwise Comparison Matrix */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Pairwise Comparison Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                          Criterion
                        </th>
                        {criteria.map((crit, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-3 py-2 text-left font-semibold"
                          >
                            {crit.substring(0, 10)}...
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map((critI, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2 font-semibold">
                            {critI.substring(0, 10)}...
                          </td>
                          {criteria.map((_, j) => (
                            <td
                              key={j}
                              className="border border-gray-300 px-3 py-2 font-mono text-xs"
                            >
                              {formatTFN(result.fuzzyCriteriaMatrix[i][j], 2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase 2: Fuzzy TOPSIS Results */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('topsis')}
            className="w-full px-6 py-4 bg-cyan-50 hover:bg-cyan-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>📈 Phase 2: Fuzzy TOPSIS - Alternative Rankings</span>
            <span>{expandedSection === 'topsis' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'topsis' && (
            <div className="p-6 space-y-6">
              {/* Distances and Scores */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Distance Measures & Closeness Coefficients</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Alternative
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          d⁺ (Ideal Best)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          d⁻ (Ideal Worst)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          CC (Score)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Rank
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
                            {result.fuzzyTOPSISResult.crispDistanceFromBest[i].toFixed(4)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-mono">
                            {result.fuzzyTOPSISResult.crispDistanceFromWorst[i].toFixed(4)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-bold text-purple-600">
                            {result.finalScores[i].toFixed(4)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                            {result.finalRankings[i]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Data */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Alternative Performance Data</h4>
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
                            <td key={j} className="border border-gray-300 px-4 py-2 font-mono">
                              {result.fuzzyTOPSISResult.fuzzyMatrix[i][j].m.toFixed(3)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('methodology')}
            className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 flex justify-between items-center font-semibold text-gray-800 border-b transition-colors"
          >
            <span>ℹ️ Methodology</span>
            <span>{expandedSection === 'methodology' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'methodology' && (
            <div className="p-6">
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h5 className="font-bold text-gray-900 mb-2">Phase 1: Fuzzy AHP (Criterion Weights)</h5>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>You provided pairwise comparisons of criteria using Saaty scale</li>
                    <li>Each comparison was converted to a Triangular Fuzzy Number (TFN)</li>
                    <li>Fuzzy geometric mean was calculated for each criterion row</li>
                    <li>Fuzzy weights were derived from geometric means</li>
                    <li>Weights were defuzzified and normalized for use in Phase 2</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 mb-2">Phase 2: Fuzzy TOPSIS (Alternative Rankings)</h5>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Performance data for alternatives was normalized</li>
                    <li>Fuzzy AHP weights were applied to create weighted decision matrix</li>
                    <li>Fuzzy ideal best (F⁺) and worst (F⁻) solutions were identified</li>
                    <li>Separation distances were calculated using vertex method</li>
                    <li>Closeness coefficient (d⁻ / (d⁺ + d⁻)) determined alternative rankings</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                  <p className="text-xs font-semibold text-yellow-900">
                    ✓ This hybrid approach provides more robust decision-making by combining 
                    the strengths of both fuzzy AHP (for weight determination) and fuzzy TOPSIS 
                    (for alternative evaluation).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export & Action Buttons */}
      <div className="mt-8 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-3">📥 Export Results:</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
            >
              📊 Export to CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
            >
              📄 Export to JSON
            </button>
            <button
              onClick={handleExportHTML}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold transition-colors"
            >
              🌐 Export to HTML
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold transition-colors"
            >
              ← Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Tips for Using Results */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h3 className="font-bold text-yellow-900 mb-2">💡 Using These Results:</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✓ <strong>Interview Feedback:</strong> Share rankings with hiring team</li>
          <li>✓ <strong>Decision Documentation:</strong> Export results for audit trail</li>
          <li>✓ <strong>Comparison View:</strong> Use to discuss candidate strengths/weaknesses</li>
          <li>✓ <strong>Fair & Objective:</strong> Results based on weighted criteria, not bias</li>
          <li>✓ <strong>Transparency:</strong> Show candidates how they were evaluated</li>
        </ul>
      </div>
    </div>
  );
}
