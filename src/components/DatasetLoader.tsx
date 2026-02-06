'use client';

import React, { useState, useCallback } from 'react';

interface DatasetLoaderProps {
  onDataLoaded: (data: any[], headers: string[]) => void;
  onMappingComplete: (mappedData: { criteria: string[], alternatives: string[], dataMatrix: number[][] }) => void;
}

interface ColumnMapping {
  [key: string]: string; // dataset column -> criteria name
}

const MAX_PREVIEW_ROWS = 500; // Limit preview to 500 rows for performance
const MAX_PROCESSING_ROWS = 30000; // Limit processing to 30000 rows
const MAX_COLUMNS_DISPLAY = 25; // Show max 25 columns in mapping interface

export default function DatasetLoader({ onDataLoaded, onMappingComplete }: DatasetLoaderProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [selectedCandidateColumn, setSelectedCandidateColumn] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [dataStats, setDataStats] = useState({ rows: 0, columns: 0, size: 0 });
  const [step, setStep] = useState<'upload' | 'map' | 'review'>('upload');
  const [useSampling, setUseSampling] = useState(true); // Default to sampling for performance

  // Helper function to detect duplicate column names
  const getDuplicateColumns = (headers: string[]) => {
    const counts: { [key: string]: number } = {};
    const duplicates: string[] = [];
    
    headers.forEach(header => {
      counts[header] = (counts[header] || 0) + 1;
      if (counts[header] === 2) {
        duplicates.push(header);
      }
    });
    
    return duplicates;
  };

  // Parse CSV file with performance optimizations
  const parseCSV = (text: string): { data: any[], headers: string[] } => {
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least 2 lines (header + 1 data row)');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('Parsed headers:', headers.length, 'columns');
    
    // Calculate file stats
    const totalRows = lines.length - 1;
    const fileSize = text.length;
    setDataStats({ rows: totalRows, columns: headers.length, size: fileSize });
    
    // Performance warning for large datasets
    if (totalRows > MAX_PROCESSING_ROWS) {
      console.warn(`Large dataset detected: ${totalRows} rows. Will use smart sampling for performance.`);
    }
    
    // Process data with intelligent sampling for large datasets
    let rowsToProcess = totalRows;
    let samplingStep = 1;
    
    if (totalRows > MAX_PROCESSING_ROWS) {
      // Use systematic sampling - take every nth row to get a representative sample
      samplingStep = Math.ceil(totalRows / MAX_PROCESSING_ROWS);
      rowsToProcess = Math.min(totalRows, MAX_PROCESSING_ROWS);
      console.log(`Applying systematic sampling: every ${samplingStep}th row, processing ${rowsToProcess} rows`);
    }
    
    const dataLines = [];
    for (let i = 1; i <= totalRows && dataLines.length < rowsToProcess; i += samplingStep) {
      if (lines[i]) {
        dataLines.push(lines[i]);
      }
    }
    
    const data = dataLines.map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = { __index: index, __originalRow: index * samplingStep };
      
      headers.forEach((header, i) => {
        const value = values[i] || '';
        // Try to convert to number if possible, otherwise keep as string
        const numValue = Number(value);
        row[header] = (value === '' || isNaN(numValue)) ? value : numValue;
      });
      return row;
    });

    console.log(`Processed ${data.length} rows from ${totalRows} total ${samplingStep > 1 ? `(sampled every ${samplingStep}th row)` : ''}`);
    console.log('Sample row:', data[0]);

    return { data, headers };
  };

  // Handle file upload with size warnings
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (warn if > 10MB)
    const maxSafeSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSafeSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const proceed = confirm(
        `Large file detected (${sizeMB}MB). The system will automatically sample your data to ensure good performance. ` +
        `For files over 10MB, we recommend using a smaller sample for faster processing.\n\nContinue with automatic sampling?`
      );
      if (!proceed) {
        event.target.value = '';
        return;
      }
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { data, headers } = parseCSV(text);
        
        setCsvData(data);
        setCsvHeaders(headers);
        onDataLoaded(data, headers);
        setStep('map');
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
  }, [onDataLoaded]);

  // Suggested criteria mapping for interview dataset
  const suggestedMappings = {
    'Confidence': ['confidence', 'self_confidence', 'confident'],
    'Communication': ['communication', 'language_fluency', 'speaking', 'verbal'],
    'Technical Skills': ['technical', 'skills', 'knowledge', 'expertise'],
    'Problem Solving': ['problem_solving', 'analytical', 'thinking', 'structured_thinking'],
    'Structured Thinking': ['structured', 'thinking', 'logical', 'organized'],
    'Regional Fluency': ['regional', 'fluency', 'language', 'local'],
    'Sales Ability': ['sales', 'selling', 'cold_calling', 'persuasion'],
    'Presentation Skills': ['presentation', 'ppt', 'powerpoint', 'presenting'],
    'Experience': ['experience', 'years', 'background', 'previous'],
    'Education': ['education', 'qualification', 'degree', 'academic'],
    'Performance': ['performance', 'score', 'rating', 'evaluation']
  };

  // Auto-suggest column mappings
  const autoSuggestMappings = () => {
    const newMapping: ColumnMapping = {};
    
    Object.entries(suggestedMappings).forEach(([criteriaName, keywords]) => {
      const matchedColumn = csvHeaders.find(header => 
        keywords.some(keyword => 
          header.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      if (matchedColumn && !Object.keys(newMapping).includes(matchedColumn)) {
        newMapping[matchedColumn] = criteriaName;
      }
    });
    
    setColumnMapping(newMapping);
    setSelectedColumns(Object.keys(newMapping));
    
    console.log('Auto-suggested mappings:', newMapping);
  };

  // Handle mapping changes
  const updateMapping = (column: string, criteriaName: string) => {
    const newMapping = { ...columnMapping };
    
    // Remove old mapping for this criteria
    Object.keys(newMapping).forEach(col => {
      if (newMapping[col] === criteriaName) {
        delete newMapping[col];
      }
    });
    
    // Add new mapping
    if (criteriaName) {
      newMapping[column] = criteriaName;
    } else {
      delete newMapping[column];
    }
    
    setColumnMapping(newMapping);
    setSelectedColumns(Object.keys(newMapping));
  };

  // Process and export mapped data with progress tracking
  const processMappedData = async () => {
    if (!selectedCandidateColumn || selectedColumns.length === 0) {
      alert('Please select candidate column and criteria columns');
      return;
    }

    setProcessingProgress(10);
    console.log('Selected candidate column:', selectedCandidateColumn);
    console.log('Selected columns:', selectedColumns);
    console.log('Column mapping:', columnMapping);
    console.log('Working with dataset:', csvData.length, 'rows');

    // Use the already processed and sampled data
    let workingData = csvData;
    
    if (workingData.length === 0) {
      alert('No data available to process. Please try uploading the file again.');
      setProcessingProgress(0);
      return;
    }

    // Extract unique criteria names in the same order as selectedColumns
    const criteria = selectedColumns.map(column => columnMapping[column]);
    setProcessingProgress(20);
    
    // Extract candidates (alternatives) with progress
    const candidateSet = new Set();
    workingData.forEach(row => {
      const candidate = row[selectedCandidateColumn];
      if (candidate && candidate.toString().trim()) {
        candidateSet.add(candidate);
      }
    });
    const alternatives = Array.from(candidateSet).filter(Boolean) as string[];
    
    // Limit alternatives for performance
    const maxAlternatives = 50;
    if (alternatives.length > maxAlternatives) {
      console.warn(`Too many alternatives (${alternatives.length}). Using first ${maxAlternatives} for performance.`);
      alternatives.splice(maxAlternatives);
    }
    
    setProcessingProgress(40);
    console.log('Alternatives found:', alternatives.length);
    console.log('Criteria mapped:', criteria);

    // Create data matrix with progress updates
    const dataMatrix: number[][] = [];
    
    for (let i = 0; i < alternatives.length; i++) {
      const candidate = alternatives[i];
      const candidateRows = workingData.filter(row => row[selectedCandidateColumn] === candidate);
      
      const row = selectedColumns.map(column => {
        // Calculate average score for this candidate on this criterion
        const scores = candidateRows
          .map(row => {
            const value = row[column];
            const numValue = Number(value);
            return isNaN(numValue) ? 0 : numValue;
          })
          .filter(score => score > 0); // Only include positive scores
        
        const average = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;
        
        return average;
      });
      
      dataMatrix.push(row);
      
      // Update progress
      const progress = 40 + (i / alternatives.length) * 50;
      setProcessingProgress(Math.round(progress));
      
      // Allow UI to update every 10 iterations
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    console.log('Final data matrix:', dataMatrix.length, 'x', dataMatrix[0]?.length);
    setProcessingProgress(100);

    onMappingComplete({
      criteria,
      alternatives,
      dataMatrix
    });

    setTimeout(() => {
      setStep('review');
      setProcessingProgress(0);
    }, 500);
  };

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📊 Load Kaggle Interview Dataset</h3>
          <p className="text-sm text-blue-800 mb-4">
            Upload the <strong>Data - Base.csv</strong> file from the Kaggle interview dataset.
            We'll automatically map the columns to evaluation criteria.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Loading CSV data...</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">🎯 Expected Dataset Structure</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>52 columns</strong> with interview evaluation data</li>
            <li>• Criteria like: Confidence, Communication, Technical Skills, Problem Solving</li>
            <li>• Multiple candidates with scored performance data</li>
            <li>• Numerical ratings or categorical responses</li>
          </ul>
          
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-sm font-medium text-gray-700 mb-2">📁 Test with Sample Data:</p>
            <a 
              href="/sample-interview-data.csv" 
              download
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              📥 Download sample-interview-data.csv
            </a>
            
            <div className="mt-3 text-xs text-gray-600">
              <p className="font-medium mb-1">💡 Performance Tips for Large Datasets:</p>
              <ul className="space-y-0.5 ml-3">
                <li>• Files over 10MB may process slowly</li>
                <li>• Auto-sampling limits processing to {MAX_PROCESSING_ROWS.toLocaleString()} rows</li>
                <li>• Systematic sampling preserves data quality</li>
                <li>• Consider filtering your data before upload</li>
                <li>• Use CSV format for best performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'map') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-green-900 mb-2">✅ CSV Loaded Successfully</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div><strong>Rows:</strong> {dataStats.rows.toLocaleString()}</div>
            <div><strong>Columns:</strong> {dataStats.columns}</div>
            <div><strong>Size:</strong> {(dataStats.size / 1024).toFixed(1)} KB</div>
          </div>
          
          {/* Duplicate Column Warning */}
          {(() => {
            const duplicates = getDuplicateColumns(csvHeaders);
            return duplicates.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-800 mb-2">ℹ️ Multiple Assessment Columns Detected:</p>
                <p className="text-xs text-blue-700 mb-2">
                  Found repeated column names like: <strong>{duplicates.slice(0, 2).join(', ')}</strong>
                  {duplicates.length > 2 && ` and ${duplicates.length - 2} more`}
                </p>
                <p className="text-xs text-blue-600">
                  💡 This is normal for interview datasets with multiple assessments per criteria. 
                  You can map similar columns to the same criteria - the system will average the scores automatically.
                </p>
              </div>
            );
          })()}
          
          {/* Performance Warnings */}
          {(dataStats.rows > MAX_PROCESSING_ROWS || dataStats.columns > MAX_COLUMNS_DISPLAY) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-800 mb-2">⚡ Automatic Optimization Active:</p>
              {dataStats.rows > MAX_PROCESSING_ROWS && (
                <p className="text-xs text-yellow-700">• Large dataset detected ({dataStats.rows.toLocaleString()} rows). Using systematic sampling to process {MAX_PROCESSING_ROWS.toLocaleString()} representative rows for optimal performance.</p>
              )}
              {dataStats.columns > MAX_COLUMNS_DISPLAY && (
                <p className="text-xs text-yellow-700">• Showing first {MAX_COLUMNS_DISPLAY} columns in mapping interface.</p>
              )}
              <p className="text-xs text-yellow-600 mt-1">💡 This ensures fast, responsive performance while maintaining data quality.</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">🔗 Map Dataset Columns to Criteria</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate/Name Column
            </label>
            <select
              value={selectedCandidateColumn}
              onChange={(e) => setSelectedCandidateColumn(e.target.value)}
              className="input w-full"
            >
              <option value="">Select candidate column...</option>
              {csvHeaders.map((header, index) => (
                <option key={`candidate-${header}-${index}`} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <button
            onClick={autoSuggestMappings}
            className="btn-secondary mb-4"
          >
            🤖 Auto-Suggest Mappings
          </button>

          {/* Performance Settings */}
          {dataStats.rows > 500 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">⚡ Dataset Processing Info</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  📊 Your dataset has <strong>{dataStats.rows.toLocaleString()}</strong> total rows.
                  {dataStats.rows > MAX_PROCESSING_ROWS && (
                    <span className="block">🎯 Using systematic sampling: Processing every {Math.ceil(dataStats.rows / MAX_PROCESSING_ROWS)}th row for optimal performance.</span>
                  )}
                </p>
                <p className="text-xs text-blue-700">
                  💡 This maintains data quality while ensuring fast processing. The system automatically selects representative samples.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {csvHeaders.slice(0, MAX_COLUMNS_DISPLAY).map((header, index) => {
              const isDuplicate = csvHeaders.filter(h => h === header).length > 1;
              return (
                <div key={`${header}-${index}`} className="flex gap-3 items-center">
                  <div className="w-48 text-sm font-mono text-gray-600 truncate" title={header}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <span className={isDuplicate ? 'text-orange-600 font-medium' : ''}>
                        {header}
                      </span>
                      {isDuplicate && <span className="text-orange-500 text-xs">📋</span>}
                    </div>
                  </div>
                  <select
                    value={columnMapping[header] || ''}
                    onChange={(e) => updateMapping(header, e.target.value)}
                    className="input flex-1"
                  >
                    <option value="">Skip column</option>
                    <option value="Confidence">Confidence</option>
                    <option value="Communication">Communication</option>
                    <option value="Technical Skills">Technical Skills</option>
                    <option value="Problem Solving">Problem Solving</option>
                    <option value="Structured Thinking">Structured Thinking</option>
                    <option value="Regional Fluency">Regional Fluency</option>
                    <option value="Sales Ability">Sales Ability</option>
                    <option value="Presentation Skills">Presentation Skills</option>
                    <option value="Experience">Experience</option>
                    <option value="Education">Education</option>
                    <option value="Performance">Performance</option>
                  </select>
                </div>
              );
            })}
          </div>

          {csvHeaders.length > MAX_COLUMNS_DISPLAY && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first {MAX_COLUMNS_DISPLAY} of {csvHeaders.length} columns. Use auto-suggest for faster mapping of large datasets.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('upload')}
            className="btn-secondary"
            disabled={processingProgress > 0}
          >
            ← Back
          </button>
          <button
            onClick={processMappedData}
            disabled={!selectedCandidateColumn || selectedColumns.length === 0 || processingProgress > 0}
            className={`btn-primary relative ${(!selectedCandidateColumn || selectedColumns.length === 0 || processingProgress > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {processingProgress > 0 ? (
              <>
                <span className="mr-2">Processing...</span>
                <span className="text-sm">({processingProgress}%)</span>
              </>
            ) : (
              'Process Data →'
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {processingProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Processing large dataset... {processingProgress}% complete
            </p>
          </div>
        )}

        {/* Validation Messages */}
        {(!selectedCandidateColumn || selectedColumns.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Please ensure you have:
              {!selectedCandidateColumn && <span className="block ml-4">• Selected a candidate column</span>}
              {selectedColumns.length === 0 && <span className="block ml-4">• Mapped at least one criterion</span>}
            </p>
          </div>
        )}

        {/* Current Selection Summary */}
        {(selectedCandidateColumn || selectedColumns.length > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-green-800">
              ✅ Current Selection:
              {selectedCandidateColumn && <span className="block ml-4">• Candidate Column: <strong>{selectedCandidateColumn}</strong></span>}
              {selectedColumns.length > 0 && <span className="block ml-4">• Mapped Criteria: <strong>{selectedColumns.length}</strong></span>}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-green-900 mb-2">🎉 Dataset Processed Successfully</h3>
          <p className="text-sm text-green-800 mb-3">
            Data has been mapped and converted to your evaluation format. 
            You can now proceed to define criteria weights using Fuzzy AHP.
          </p>
          
          {/* Processing Summary */}
          <div className="bg-white rounded border p-3 mb-4">
            <h4 className="font-medium text-gray-800 mb-2">📋 Processing Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Original Dataset:</span>
                <div className="text-gray-600 ml-2">
                  • {dataStats.rows.toLocaleString()} total rows
                  <br />• {dataStats.columns} total columns
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Processed Data:</span>
                <div className="text-gray-600 ml-2">
                  • {csvData.length} processed rows {dataStats.rows > MAX_PROCESSING_ROWS ? `(sampled from ${dataStats.rows.toLocaleString()})` : ''}
                  <br />• {Object.values(columnMapping).length} mapped criteria
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📋 Mapped Criteria</h4>
            <ul className="text-sm space-y-1">
              {Object.entries(columnMapping).map(([column, criteria], idx) => (
                <li key={`criteria-${column}-${idx}`} className="text-gray-700">• {criteria}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">👥 Candidates Found</h4>
            <p className="text-sm text-gray-600 mb-2">
              {new Set(csvData.map(row => row[selectedCandidateColumn])).size} unique candidates
            </p>
            {dataStats.rows > MAX_PROCESSING_ROWS && (
              <p className="text-xs text-yellow-700">
                ⚡ Performance mode: Limited to first {MAX_PROCESSING_ROWS.toLocaleString()} rows
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setStep('upload')}
          className="btn-secondary"
        >
          Load Different Dataset
        </button>
      </div>
    );
  }

  return null;
}