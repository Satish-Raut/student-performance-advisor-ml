import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { BatchPage } from './pages/BatchPage';
import { DashboardPage } from './pages/DashboardPage';
import { GovernancePage } from './pages/GovernancePage';
import { apiService } from './services/api';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    const pingAPI = async () => {
      try {
        const res = await apiService.checkHealth();
        if (res && res.status === 'healthy') {
          setApiOnline(true);
        }
      } catch (err) {
        setApiOnline(false);
      }
    };
    pingAPI();
    const interval = setInterval(pingAPI, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-root">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiOnline={apiOnline} 
      />

      <main className="main-content">
        <div className="container">
          {activeTab === 'landing' && (
            <LandingPage 
              onStartAssessment={() => setActiveTab('predict')}
              onViewMonitoring={() => setActiveTab('dashboard')}
              onViewGovernance={() => setActiveTab('governance')}
            />
          )}

          {activeTab === 'predict' && <AssessmentPage />}

          {activeTab === 'batch' && <BatchPage />}

          {activeTab === 'dashboard' && <DashboardPage />}

          {activeTab === 'governance' && <GovernancePage />}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-container">
          <p>
            © {new Date().getFullYear()} <strong style={{ color: '#84cc16' }}>EduSafe AI</strong> — ALGIONS AI LABS Advanced Machine Learning Submission.
          </p>
          <div className="footer-links">
            <span>Decision-Support Advisory Protocol</span>
            <span>•</span>
            <span>Strict Human-in-the-Loop Oversight</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
