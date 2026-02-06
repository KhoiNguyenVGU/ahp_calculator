'use client';

import React, { useState } from 'react';

interface QuickScoringInputProps {
  alternatives: string[];
  criteria: string[];
  dataMatrix: string[][];
  setDataMatrix: (matrix: string[][]) => void;
}

export default function QuickScoringInput({
  alternatives,
  criteria,
  dataMatrix,
  setDataMatrix,
}: QuickScoringInputProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Quick scoring presets
  const scoringPresets = [
    { label: '😞 Poor', value: '2', describe: 'Significant gaps, not qualified' },
    { label: '😐 Adequate', value: '5', describe: 'Meets basic requirements' },
    { label: '😊 Good', value: '7', describe: 'Good demonstration, above average' },
    { label: '😃 Excellent', value: '9', describe: 'Exceptional, exactly what we need' },
  ];

  const criteriaDescriptions: { [key: string]: string } = {
    'Technical Skills': 'Can they solve technical problems? Knowledge of required tech stack?',
    'Communication': 'Can they explain ideas clearly? Listen well? Present confidently?',
    'Problem-Solving': 'Do they approach problems systematically? Think creatively?',
    'Leadership': 'Can they mentor others? Drive projects? Take initiative?',
    'Experience': 'Relevant years in field? Project types handled?',
    'Teamwork': 'Collaborate well? Share knowledge? Support others?',
    'Adaptability': 'Learn quickly? Handle changes? Flexible mindset?',
    'Initiative': 'Self-starter? Drive improvements? Take ownership?',
  };

  const updateScore = (rowIdx: number, colIdx: number, value: string) => {
    const newMatrix = dataMatrix.map(row => [...row]);
    newMatrix[rowIdx][colIdx] = value;
    setDataMatrix(newMatrix);
    setSelectedCell(null);
  };

  const applyScoreToRow = (rowIdx: number, value: string) => {
    const newMatrix = dataMatrix.map((row, idx) => {
      if (idx === rowIdx) {
        return row.map(() => value);
      }
      return row;
    });
    setDataMatrix(newMatrix);
  };

  const applyScoreToColumn = (colIdx: number, value: string) => {
    const newMatrix = dataMatrix.map(row => {
      const newRow = [...row];
      newRow[colIdx] = value;
      return newRow;
    });
    setDataMatrix(newMatrix);
  };

  const clearAll = () => {
    const newMatrix = dataMatrix.map(row => row.map(() => ''));
    setDataMatrix(newMatrix);
  };

  const cellId = (i: number, j: number) => `cell-${i}-${j}`;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">📝 How to Score:</h3>
        <p className="text-sm text-blue-800 mb-3">
          Rate each candidate on each criterion using a 1-10 scale. Use quick buttons below or type custom values.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {scoringPresets.map(preset => (
            <div key={preset.value} className="text-xs">
              <span className="block font-semibold">{preset.label}</span>
              <span className="block text-gray-600">{preset.value}/10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-bold text-gray-700 mb-3">⚡ Quick Actions:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {scoringPresets.map(preset => (
            <button
              key={preset.value}
              onClick={() => applyScoreToRow(-1, preset.value)} // Will create a more targeted version
              title={preset.describe}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-3 py-2 text-sm bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors text-red-700 font-semibold"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Scoring Table with Tooltips */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 sticky top-0">
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800 sticky left-0 bg-gray-200 z-10">
                Candidate
              </th>
              {criteria.map((crit, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-3 text-center font-bold text-gray-800 min-w-max relative group"
                  onMouseEnter={() => setShowTooltip(`crit-${idx}`)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{crit}</span>
                    <span className="text-gray-500 cursor-help">ℹ️</span>
                  </div>
                  {showTooltip === `crit-${idx}` && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-2 px-3 w-max z-20 whitespace-normal">
                      {criteriaDescriptions[crit] || crit}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alternatives.map((alt, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 sticky left-0 bg-inherit z-10">
                  {alt}
                </td>
                {criteria.map((_, colIdx) => {
                  const cellKey = cellId(rowIdx, colIdx);
                  const isSelected = selectedCell === cellKey;

                  return (
                    <td
                      key={colIdx}
                      className="border border-gray-300 p-1 text-center relative"
                    >
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={dataMatrix[rowIdx][colIdx]}
                        onChange={e =>
                          updateScore(rowIdx, colIdx, e.target.value)
                        }
                        onFocus={() => setSelectedCell(cellKey)}
                        className={`w-full px-2 py-1 text-center border rounded transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="1-10"
                      />

                      {/* Quick preset buttons appear on focus */}
                      {isSelected && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-2 grid grid-cols-2 gap-1 min-w-max">
                          {scoringPresets.map(preset => (
                            <button
                              key={preset.value}
                              onClick={() =>
                                updateScore(rowIdx, colIdx, preset.value)
                              }
                              title={preset.describe}
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scoring Guide */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h3 className="font-bold text-green-900 mb-2">📚 Scoring Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-green-800 mb-1">Standard Scale:</p>
            <ul className="text-green-800 space-y-1">
              <li><strong>1-2:</strong> Poor - Significant gaps</li>
              <li><strong>3-4:</strong> Below Average - Needs improvement</li>
              <li><strong>5-6:</strong> Adequate - Meets requirements</li>
              <li><strong>7-8:</strong> Good - Above average</li>
              <li><strong>9-10:</strong> Excellent - Exceeds expectations</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-green-800 mb-1">Tips:</p>
            <ul className="text-green-800 space-y-1">
              <li>✓ Use consistent scale across all candidates</li>
              <li>✓ Be specific when scoring different criteria</li>
              <li>✓ Consider: examples from interview</li>
              <li>✓ Discuss scores with interview panel</li>
              <li>✓ Higher score = Better candidate for that criterion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
