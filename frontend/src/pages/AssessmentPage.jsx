import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Loader2, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { FEATURE_METADATA } from '../services/featureMetadata';
import { apiService } from '../services/api';

export const AssessmentPage = () => {
  // Initial state populated from metadata defaults
  const [formData, setFormData] = useState({
    G1: 8.0,
    G2: 7.0,
    absences: 12,
    failures: 1,
    studytime: 2,
    traveltime: 1,
    schoolsup: 'yes',
    famsup: 'no',
    paid: 'no',
    activities: 'yes',
    nursery: 'yes',
    higher: 'yes',
    internet: 'yes',
    romantic: 'no',
    famrel: 4,
    freetime: 3,
    goout: 2,
    Dalc: 1,
    Walc: 1,
    health: 3,
    course: 'math'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSelect = (presetType) => {
    if (presetType === 'at_risk') {
      setFormData({
        G1: 7.0,
        G2: 6.0,
        absences: 16,
        failures: 2,
        studytime: 1,
        traveltime: 2,
        schoolsup: 'yes',
        famsup: 'no',
        paid: 'no',
        activities: 'no',
        nursery: 'yes',
        higher: 'no',
        internet: 'no',
        romantic: 'yes',
        famrel: 2,
        freetime: 4,
        goout: 4,
        Dalc: 2,
        Walc: 3,
        health: 2,
        course: 'math'
      });
    } else {
      setFormData({
        G1: 16.0,
        G2: 17.0,
        absences: 2,
        failures: 0,
        studytime: 3,
        traveltime: 1,
        schoolsup: 'no',
        famsup: 'yes',
        paid: 'no',
        activities: 'yes',
        nursery: 'yes',
        higher: 'yes',
        internet: 'yes',
        romantic: 'no',
        famrel: 5,
        freetime: 2,
        goout: 2,
        Dalc: 1,
        Walc: 1,
        health: 4,
        course: 'math'
      });
    }
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.predictStudent(formData);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to connect to ML backend');
    } finally {
      setLoading(false);
    }
  };

  // Group features by category for human-centric tab layout
  const categories = ['Academic', 'Habits & Behavior', 'Support System', 'Social & Lifestyle'];

  return (
    <div className="assessment-page">
      <div className="page-header">
        <div>
          <h2>Individual Student Academic Assessment</h2>
          <p className="text-muted">
            Input educational metrics and behavioral habits to compute an advisory risk band.
            Hover over any field's info icon for full context from the dataset specification.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="preset-buttons">
          <span className="preset-label">Test Sample Profiles:</span>
          <button 
            type="button" 
            className="preset-btn danger" 
            onClick={() => handlePresetSelect('at_risk')}
          >
            ⚠️ Load At-Risk Student Sample
          </button>
          <button 
            type="button" 
            className="preset-btn success" 
            onClick={() => handlePresetSelect('on_track')}
          >
            ✅ Load On-Track Student Sample
          </button>
        </div>
      </div>

      <div className="assessment-layout">
        {/* Form Container */}
        <form className="assessment-form-card" onSubmit={handleSubmit}>
          {categories.map((category) => (
            <div key={category} className="form-category-section">
              <h3 className="category-title">{category} Factors</h3>
              <div className="fields-grid">
                {Object.entries(FEATURE_METADATA)
                  .filter(([_, meta]) => meta.category === category)
                  .map(([fieldName, meta]) => (
                    <div key={fieldName} className="form-group">
                      <div className="label-wrapper">
                        <label htmlFor={fieldName}>{meta.label}</label>
                        <div className="tooltip-container" title={`${meta.description}. ${meta.hint || ''}`}>
                          <HelpCircle size={14} className="info-icon" />
                        </div>
                      </div>

                      {meta.type === 'select' ? (
                        <select
                          id={fieldName}
                          value={formData[fieldName]}
                          onChange={(e) => {
                            const val = typeof meta.options[0].value === 'number' 
                              ? Number(e.target.value) 
                              : e.target.value;
                            handleInputChange(fieldName, val);
                          }}
                        >
                          {meta.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={fieldName}
                          type="number"
                          min={meta.min}
                          max={meta.max}
                          step={fieldName.startsWith('G') ? '0.5' : '1'}
                          value={formData[fieldName]}
                          onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value) || 0)}
                          required
                        />
                      )}

                      <span className="field-hint">{meta.hint}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="primary-btn submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Running Gradient Boosting Model...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Compute Risk Assessment
                </>
              )}
            </button>
          </div>
        </form>

        {/* Inference Results Sidebar */}
        <div className="results-container">
          {error && (
            <div className="error-card">
              <AlertTriangle size={20} />
              <div>
                <strong>Backend Error:</strong>
                <p>{error}</p>
                <small>Ensure FastAPI server is running: <code>uvicorn api.main:app --port 8000</code></small>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="placeholder-card">
              <RefreshCw size={36} className="placeholder-icon" />
              <h3>Awaiting Assessment Input</h3>
              <p>
                Fill out the student parameters on the left or click one of the pre-set buttons 
                above to run live model inference.
              </p>
            </div>
          )}

          {result && (
            <div className={`result-card ${result.is_at_risk ? 'risk-high' : 'risk-low'}`}>
              <div className="result-header">
                <div>
                  <span className="result-badge-label">Advisory Assessment Result</span>
                  <h3 className="risk-level-heading">{result.risk_level}</h3>
                </div>
                <div className="probability-gauge">
                  <span className="probability-val">{result.confidence_percentage}</span>
                  <span className="probability-sub">Risk Prob</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div 
                  className={`progress-fill ${result.risk_level.includes('High') ? 'high' : result.risk_level.includes('Moderate') ? 'moderate' : 'low'}`} 
                  style={{ width: `${Math.min(100, Math.max(5, result.risk_probability * 100))}%` }}
                />
              </div>

              {/* Contributing Signals */}
              <div className="result-section">
                <h4>Primary Contributing Signals</h4>
                <ul className="factors-list">
                  {result.contributing_factors.map((factor, idx) => (
                    <li key={idx}>
                      <span className="bullet-point">▸</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feature Impact Bar Chart (Explainability) */}
              {result.feature_impacts && (
                <div className="result-section">
                  <h4>Feature Impact Breakdown</h4>
                  <div className="impacts-list">
                    {Object.entries(result.feature_impacts).map(([name, weight]) => (
                      <div key={name} className="impact-row">
                        <span className="impact-name">{name.replace(/_/g, ' ')}</span>
                        <div className="impact-bar-wrapper">
                          <div 
                            className="impact-bar-fill" 
                            style={{ width: `${Math.round(weight * 100)}%` }} 
                          />
                        </div>
                        <span className="impact-pct">{(weight * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Educational Interventions */}
              <div className="result-section">
                <h4>Actionable Educational Recommendations</h4>
                <ul className="interventions-list">
                  {result.recommended_interventions.map((action, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} className="check-bullet" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advisory Disclaimer */}
              <div className="advisory-box">
                <ShieldAlert size={18} className="shield-icon" />
                <p>{result.advisory_disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
