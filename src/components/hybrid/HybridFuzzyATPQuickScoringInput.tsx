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
  const [showAllRows, setShowAllRows] = useState(false);

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
  };

  const clearAll = () => {
    const newMatrix = dataMatrix.map(row => row.map(() => ''));
    setDataMatrix(newMatrix);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          Use a 1–10 scale and enter values directly for each candidate and criterion.
        </p>
        <button
          onClick={clearAll}
          className="px-3 py-2 text-sm bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors text-red-700 font-semibold"
        >
          🗑️ Clear All
        </button>
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
            {alternatives.slice(0, showAllRows ? alternatives.length : 15).map((alt, displayIdx) => {
              const rowIdx = displayIdx; // displayIdx is the actual row index in the sliced array
              return (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 sticky left-0 bg-inherit z-10">
                    {alt}
                  </td>
                  {criteria.map((_, colIdx) => {
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
                          className="w-full px-2 py-1 text-center border rounded border-gray-300"
                          placeholder="1-10"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expand/Collapse Button for large datasets */}
      {alternatives.length > 15 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
          >
            {showAllRows ? (
              <>
                ▲ Collapse
              </>
            ) : (
              <>
                ▼ Show All Candidates ({alternatives.length - 15} more)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
