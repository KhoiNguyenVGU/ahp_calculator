// Export Results Utility - PDF and Excel formats
import { HybridFuzzyATPTopsisResult } from './hybridFuzzyATPTopsis';

// Export to CSV (Excel compatible)
export function exportToCSV(
  result: HybridFuzzyATPTopsisResult,
  goal: string,
  criteria: string[],
  alternatives: string[]
): string {
  let csv = '';

  // Header
  csv += `Decision Goal: ${goal}\n`;
  csv += `Date: ${new Date().toLocaleDateString()}\n\n`;

  // Rankings
  csv += 'RANKINGS\n';
  csv += 'Rank,Candidate,Closeness Score,Distance to Best,Distance to Worst\n';
  
  const ranked = alternatives
    .map((alt, idx) => ({
      name: alt,
      score: result.fuzzyTOPSISResult.performanceScores[idx],
      distBest: result.fuzzyTOPSISResult.crispDistanceFromBest[idx],
      distWorst: result.fuzzyTOPSISResult.crispDistanceFromWorst[idx],
      index: idx,
    }))
    .sort((a, b) => b.score - a.score);

  ranked.forEach((alt, rank) => {
    csv += `${rank + 1},${alt.name},${alt.score.toFixed(4)},${alt.distBest.toFixed(4)},${alt.distWorst.toFixed(4)}\n`;
  });

  csv += '\n';

  // Criteria Weights
  csv += 'CRITERIA WEIGHTS (from Fuzzy AHP)\n';
  csv += 'Criterion,Weight (Crisp),Left,Middle,Right\n';
  criteria.forEach((crit, idx) => {
    const weight = result.normalizedAHPWeights[idx];
    const fuzzyWeight = result.fuzzyAHPWeights[idx];
    csv += `${crit},${weight.toFixed(4)},${fuzzyWeight.l.toFixed(4)},${fuzzyWeight.m.toFixed(4)},${fuzzyWeight.u.toFixed(4)}\n`;
  });

  csv += '\n';

  // Decision Matrix
  csv += 'DECISION MATRIX (Candidate Scores)\n';
  csv += 'Candidate,' + criteria.join(',') + '\n';
  alternatives.forEach((alt, i) => {
    csv += alt;
    criteria.forEach((_, j) => {
      csv += ',' + result.fuzzyTOPSISResult.fuzzyMatrix[i][j].m.toFixed(2);
    });
    csv += '\n';
  });

  return csv;
}

// Export to JSON
export function exportToJSON(
  result: HybridFuzzyATPTopsisResult,
  goal: string,
  criteria: string[],
  alternatives: string[]
): string {
  const exportData = {
    metadata: {
      goal,
      date: new Date().toISOString(),
      criteria,
      alternatives,
    },
    rankings: alternatives
      .map((alt, idx) => ({
        rank: idx,
        candidate: alt,
        closenessScore: result.fuzzyTOPSISResult.performanceScores[idx],
        distanceFromBest: result.fuzzyTOPSISResult.crispDistanceFromBest[idx],
        distanceFromWorst: result.fuzzyTOPSISResult.crispDistanceFromWorst[idx],
      }))
      .sort((a, b) => b.closenessScore - a.closenessScore),
    criteriaWeights: criteria.map((crit, idx) => ({
      criterion: crit,
      crispWeight: result.normalizedAHPWeights[idx],
      fuzzyWeight: {
        lower: result.fuzzyAHPWeights[idx].l,
        middle: result.fuzzyAHPWeights[idx].m,
        upper: result.fuzzyAHPWeights[idx].u,
      },
    })),
    decisionMatrix: alternatives.map((alt, i) => ({
      candidate: alt,
      scores: criteria.map((_, j) => result.fuzzyTOPSISResult.fuzzyMatrix[i][j].m),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

// Download wrapper
export function downloadFile(content: string, filename: string, format: 'csv' | 'json'): void {
  const element = document.createElement('a');
  const file = new Blob([content], {
    type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
  });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Generate simple HTML report
export function generateHTMLReport(
  result: HybridFuzzyATPTopsisResult,
  goal: string,
  criteria: string[],
  alternatives: string[]
): string {
  const ranked = alternatives
    .map((alt, idx) => ({
      name: alt,
      score: result.fuzzyTOPSISResult.performanceScores[idx],
      index: idx,
    }))
    .sort((a, b) => b.score - a.score);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interview Evaluation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .info { background: #f0f7ff; padding: 10px; border-radius: 4px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; font-weight: bold; }
    tr:nth-child(even) { background: #f9f9f9; }
    .rank-1 { background: #fff3cd; }
    .medal { font-size: 20px; font-weight: bold; }
    .score { color: #28a745; font-weight: bold; }
    .footer { text-align: center; color: #999; margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 Interview Evaluation Report</h1>
    
    <div class="info">
      <strong>Goal:</strong> ${goal}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
      <strong>Method:</strong> Hybrid Fuzzy AHP-TOPSIS
    </div>

    <h2>🏆 Candidate Rankings</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Candidate</th>
          <th>Closeness Score</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${ranked
          .map(
            (alt, idx) => `
          <tr ${idx === 0 ? 'class="rank-1"' : ''}>
            <td><span class="medal">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</span></td>
            <td>${alt.name}</td>
            <td><span class="score">${alt.score.toFixed(4)}</span></td>
            <td>${idx === 0 ? '✅ Recommended' : idx <= 2 ? '⚠️ Consider' : '❌ Not Recommended'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <h2>⚖️ Evaluation Criteria Weights</h2>
    <table>
      <thead>
        <tr>
          <th>Criterion</th>
          <th>Weight (%)</th>
          <th>Importance</th>
        </tr>
      </thead>
      <tbody>
        ${criteria
          .map(
            (crit, idx) => `
          <tr>
            <td>${crit}</td>
            <td><strong>${(result.normalizedAHPWeights[idx] * 100).toFixed(1)}%</strong></td>
            <td>${getImportanceLabel(result.normalizedAHPWeights[idx])}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <h2>📊 Decision Matrix (Candidate Scores)</h2>
    <table>
      <thead>
        <tr>
          <th>Candidate</th>
          ${criteria.map(c => `<th>${c}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${alternatives
          .map(
            (alt, i) => `
          <tr>
            <td><strong>${alt}</strong></td>
            ${criteria.map((_, j) => `<td>${result.fuzzyTOPSISResult.fuzzyMatrix[i][j].m.toFixed(2)}</td>`).join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated by Objective Interview Evaluation System</p>
      <p>This report was generated using Fuzzy AHP-TOPSIS methodology to ensure objective candidate evaluation.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

function getImportanceLabel(weight: number): string {
  if (weight >= 0.3) return '🔴 High';
  if (weight >= 0.15) return '🟡 Medium';
  return '🟢 Low';
}
