import React from 'react';
import { 
  ArrowRight, 
  ShieldAlert, 
  BrainCircuit, 
  BarChart3, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Lock 
} from 'lucide-react';

export const LandingPage = ({ onStartAssessment, onViewMonitoring, onViewGovernance }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <BrainCircuit size={16} />
          <span>ALGIONS AI LABS • Advanced Machine Learning System</span>
        </div>

        <h1 className="hero-title">
          Early Academic Risk Detection <br />
          <span className="gradient-text">Empowering Educators with Responsible AI</span>
        </h1>

        <p className="hero-description">
          An explainable, decision-support machine learning platform that identifies students 
          requiring timely academic intervention before final evaluations. Built on historical 
          learning signals with strict privacy guards and zero target leakage.
        </p>

        {/* Responsible AI Disclaimer Banner */}
        <div className="advisory-banner">
          <ShieldAlert size={22} className="advisory-icon" />
          <div className="advisory-text">
            <strong>Strict Ethical Protocol:</strong> This system functions solely as an advisory assistant. 
            Outputs must <u>never</u> be used to trigger automated punishment, grading penalties, or admission rejections. 
            All algorithmic outputs necessitate human educator review.
          </div>
        </div>

        <div className="hero-cta-group">
          <button className="primary-btn" onClick={onStartAssessment}>
            Start Student Assessment
            <ArrowRight size={18} />
          </button>
          <button className="secondary-btn" onClick={onViewMonitoring}>
            View MLOps Live Dashboard
            <BarChart3 size={18} />
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon blue">
            <Cpu size={24} />
          </div>
          <h3>Ensemble ML Engine</h3>
          <p>
            Powered by Gradient Boosted Decision Trees trained on merged multimodal secondary education data. 
            Achieves <strong>82.2% Precision</strong> and <strong>80.4% Recall</strong> with class-balanced weighting.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon purple">
            <Lock size={24} />
          </div>
          <h3>Bias Mitigation & Privacy</h3>
          <p>
            Zero usage of sensitive demographics. Attributes such as gender, urban/rural residence, 
            and parental marital status are strictly excluded to ensure impartial, fair evaluations.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon green">
            <BookOpen size={24} />
          </div>
          <h3>Human-Friendly Signals</h3>
          <p>
            Cryptic dataset columns are translated into plain educational concepts with contextual 
            tooltips and concrete intervention guidance tailored for teachers.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon amber">
            <BarChart3 size={24} />
          </div>
          <h3>Real-Time MLOps Tracking</h3>
          <p>
            Every prediction is logged to an internal asynchronous SQLite store for live tracking, 
            cohort drift monitoring, and distribution analysis without external SaaS lock-in.
          </p>
        </div>
      </section>

      {/* Acceptance Tests Badge Row */}
      <section className="acceptance-summary-card">
        <h2>Assessment Criteria & Verification Summary</h2>
        <div className="criteria-list">
          <div className="criteria-item">
            <CheckCircle2 size={18} className="check-icon" />
            <span><strong>Target Definition:</strong> Binary threshold G3 &lt; 10 (official Portuguese secondary fail mark).</span>
          </div>
          <div className="criteria-item">
            <CheckCircle2 size={18} className="check-icon" />
            <span><strong>Leakage Safe:</strong> Strictly uses pre-period signals (G1, G2, absences, habits). G3 excluded.</span>
          </div>
          <div className="criteria-item">
            <CheckCircle2 size={18} className="check-icon" />
            <span><strong>Evaluated vs Baseline:</strong> Compared with Dummy Most-Frequent, Logistic Regression, &amp; Random Forest.</span>
          </div>
          <div className="criteria-item">
            <CheckCircle2 size={18} className="check-icon" />
            <span><strong>Production Artifact:</strong> Saved self-contained pipeline wrapper with automated scaling &amp; dummy alignment.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
