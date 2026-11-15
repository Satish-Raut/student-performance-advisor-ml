import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export const BatchPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResults(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a valid CSV file before uploading.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiService.uploadCSV(file);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error processing batch CSV');
    } finally {
      setLoading(false);
    }
  };

  // Sample CSV template generator for user convenience
  const downloadSampleCSV = () => {
    const csvContent = 
      "G1,G2,absences,failures,studytime,traveltime,schoolsup,famsup,paid,activities,nursery,higher,internet,romantic,famrel,freetime,goout,Dalc,Walc,health,course\n" +
      "7.0,6.0,16,2,1,2,yes,no,no,no,yes,no,no,yes,2,4,4,2,3,2,math\n" +
      "15.0,16.0,2,0,3,1,no,yes,no,yes,yes,yes,yes,no,5,2,2,1,1,4,portuguese\n" +
      "10.0,11.0,4,0,2,1,no,no,no,no,yes,yes,yes,no,4,3,3,1,1,3,math";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students_cohort.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="batch-page">
      <div className="page-header">
        <div>
          <h2>Cohort Batch Processing & CSV Ingestion</h2>
          <p className="text-muted">
            Upload institutional student rosters in CSV format to calculate risk probabilities across entire cohorts.
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={downloadSampleCSV}>
          <FileSpreadsheet size={16} />
          Download Sample CSV Template
        </button>
      </div>

      <div className="batch-layout">
        {/* Upload Card */}
        <div className="upload-card">
          <form onSubmit={handleUpload}>
            <div className="dropzone">
              <Upload size={40} className="upload-icon" />
              <label htmlFor="csv-upload" className="file-label">
                {file ? file.name : 'Select or Drop Student Roster CSV'}
              </label>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden-input" 
              />
              <span className="file-types-hint">Supported format: .csv (with headers)</span>
            </div>

            {error && (
              <div className="error-card small">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="primary-btn full-width" disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Processing Cohort Records...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Run Batch Cohort Assessment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Overview */}
        {results && (
          <div className="batch-results-container">
            <div className="summary-stats-grid">
              <div className="stat-card">
                <span className="stat-title">Total Evaluated</span>
                <span className="stat-number">{results.total_students}</span>
              </div>
              <div className="stat-card danger">
                <span className="stat-title">High Risk</span>
                <span className="stat-number">{results.high_risk_count}</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-title">Moderate Risk</span>
                <span className="stat-number">{results.moderate_risk_count}</span>
              </div>
              <div className="stat-card success">
                <span className="stat-title">On Track</span>
                <span className="stat-number">{results.low_risk_count}</span>
              </div>
            </div>

            {/* Inferences Table */}
            <div className="table-wrapper">
              <table className="cohort-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Risk Band</th>
                    <th>Risk Probability</th>
                    <th>Primary Flag</th>
                    <th>Human Review</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((res, index) => (
                    <tr key={index}>
                      <td>Student #{index + 1}</td>
                      <td>
                        <span className={`risk-tag ${res.risk_level.includes('High') ? 'tag-high' : res.risk_level.includes('Moderate') ? 'tag-mod' : 'tag-low'}`}>
                          {res.risk_level}
                        </span>
                      </td>
                      <td><strong>{res.confidence_percentage}</strong></td>
                      <td>{res.contributing_factors[0] || 'Nominal Performance'}</td>
                      <td>
                        {res.human_oversight_required ? (
                          <span className="review-badge required">Required</span>
                        ) : (
                          <span className="review-badge routine">Routine</span>
                        )}
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
  );
};
