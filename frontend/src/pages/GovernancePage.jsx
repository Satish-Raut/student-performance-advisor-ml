import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertOctagon, BookOpen, Scale, Layers } from 'lucide-react';
import { apiService } from '../services/api';

export const GovernancePage = () => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await apiService.getModelMetadata();
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching model metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  return (
    <div className="governance-page">
      <div className="page-header">
        <div>
          <h2>Model Governance, Fairness &amp; Acceptance Verification</h2>
          <p className="text-muted">
            Transparent disclosure of training procedures, bias mitigations, and held-out evaluation metrics.
          </p>
        </div>
      </div>

      <div className="governance-grid">
        {/* Responsible AI Card */}
        <div className="gov-card">
          <div className="gov-header">
            <Scale size={22} className="text-blue" />
            <h3>Ethical Alignment &amp; Human Oversight</h3>
          </div>
          <p>
            This system is architected as an <strong>assistive educational diagnostic</strong>. 
            Automated enforcement actions (such as failing grades, retention notices, or exclusion) 
            are strictly forbidden. Every prediction response mandates independent teacher discretion.
          </p>
          <div className="audit-badge verified">
            <CheckCircle2 size={16} />
            <span>Human-in-the-Loop Protocol Enforced</span>
          </div>
        </div>

        {/* Sensitive Features Excluded */}
        <div className="gov-card">
          <div className="gov-header">
            <AlertOctagon size={22} className="text-amber" />
            <h3>Demographic Bias Safeguards</h3>
          </div>
          <p>
            To prevent historical discrimination from leaking into predictive algorithms, 
            protected and sensitive attributes were stripped prior to training:
          </p>
          <div className="excluded-tags">
            {metadata?.sensitive_features_excluded.map((feat, idx) => (
              <span key={idx} className="excluded-tag">
                <s>{feat}</s>
              </span>
            ))}
          </div>
        </div>

        {/* Evaluation Rubric Matrix */}
        <div className="gov-card full-width">
          <div className="gov-header">
            <Layers size={22} className="text-green" />
            <h3>Held-Out Test Set Performance Benchmark (209 Records)</h3>
          </div>
          <p>
            Metrics computed strictly on held-out evaluation folds never exposed to model training:
          </p>
          <div className="table-wrapper">
            <table className="cohort-table">
              <thead>
                <tr>
                  <th>Candidate Architecture</th>
                  <th>Precision</th>
                  <th>Recall (Target)</th>
                  <th>F1-Score</th>
                  <th>Overall Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {metadata?.performance_metrics && Object.entries(metadata.performance_metrics).map(([name, metrics]) => (
                  <tr key={name} className={name.includes('Production') ? 'highlight-row' : ''}>
                    <td>
                      <strong>{name}</strong>
                      {name.includes('Production') && <span className="winner-pill">Active Serving</span>}
                    </td>
                    <td>{(metrics.Precision * 100).toFixed(1)}%</td>
                    <td><strong>{(metrics.Recall * 100).toFixed(1)}%</strong></td>
                    <td>{(metrics.F1 * 100).toFixed(1)}%</td>
                    <td>{(metrics.Accuracy * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
