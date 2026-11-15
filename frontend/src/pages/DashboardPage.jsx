import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Activity, 
  Database, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  BookOpen,
  Wine,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { apiService } from '../services/api';
import edaData from '../services/edaData.json';

// Cyber lime & purple palette matching sample UI
const CYBER_PIE_COLORS = ['#84cc16', '#a855f7', '#38bdf8', '#f59e0b', '#f43f5e'];

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, logsData] = await Promise.all([
        apiService.getMonitoringSummary(),
        apiService.getMonitoringLogs(20),
      ]);
      setSummary(sumData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format real-time inference risk breakdown for donut chart
  const riskPieData = summary ? [
    { name: 'High Risk', value: summary.high_risk_total },
    { name: 'Moderate Risk', value: summary.moderate_risk_total },
    { name: 'Low Risk', value: summary.low_risk_total },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h2>System Dashboard &amp; Educational Analytics</h2>
          <p className="text-muted">
            Real-time inference distribution, model performance metrics, and behavioral analysis from EDA exploration.
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh Live Stream
        </button>
      </div>

      {/* Top Metric Cards (Sample UI Cyber Aesthetic) */}
      <div className="summary-stats-grid">
        <div className="stat-card lime">
          <div className="stat-header">
            <span className="stat-title">Total Inferences</span>
            <div className="stat-icon" style={{ color: '#84cc16' }}><Activity size={18} /></div>
          </div>
          <span className="stat-number">{summary ? summary.total_inferences : '—'}</span>
          <span className="stat-sub">Persisted in SQLite storage</span>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <span className="stat-title">At-Risk Ratio</span>
            <div className="stat-icon" style={{ color: '#f43f5e' }}><AlertTriangle size={18} /></div>
          </div>
          <span className="stat-number">
            {summary ? `${(summary.at_risk_ratio * 100).toFixed(1)}%` : '—'}
          </span>
          <span className="stat-sub">Flagged with G3 &lt; 10 fail probability</span>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <span className="stat-title">Mean Risk Probability</span>
            <div className="stat-icon" style={{ color: '#c084fc' }}><TrendingUp size={18} /></div>
          </div>
          <span className="stat-number">
            {summary ? `${(summary.average_risk_probability * 100).toFixed(1)}%` : '—'}
          </span>
          <span className="stat-sub">Across all served queries</span>
        </div>

        <div className="stat-card cyan">
          <div className="stat-header">
            <span className="stat-title">Model Architecture</span>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><Database size={18} /></div>
          </div>
          <span className="stat-number" style={{ fontSize: '1.65rem', paddingTop: '6px' }}>GBM Ensemble</span>
          <span className="stat-sub">Recall: 80.4% • Precision: 82.2%</span>
        </div>
      </div>

      {/* Section 1: Live Inferences Overview */}
      <h3 className="dashboard-section-heading">Live Model Inference Stream</h3>
      <div className="charts-grid">
        {/* Risk Donut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Live Inferences Risk Classification</h3>
            <span className="chart-desc">Breakdown of recent student evaluations into advisory tiers</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              {riskPieData.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#5e6d60' }}>
                  No live predictions recorded yet. Run an assessment to populate chart!
                </div>
              ) : (
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CYBER_PIE_COLORS[index % CYBER_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#121813', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      color: '#ffffff' 
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#9aa89b', fontSize: '0.85rem' }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Progression Wave Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Grade Progression: G1 to Final Exam (G3)</h3>
            <span className="chart-desc">Shows how early period grade trends translate into final outcome</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={edaData.grade_progression} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e261f" />
                <XAxis dataKey="g1" stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <YAxis stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121813', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#ffffff' 
                  }} 
                />
                <Area type="monotone" dataKey="avg_g3" name="Avg Final Grade (G3)" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#limeGrad)" />
                <Area type="monotone" dataKey="avg_g2" name="Avg Midterm (G2)" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#purpleGrad)" />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#9aa89b', fontSize: '0.85rem' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: EDA Deep-Dive Behavioral Insights from Notebook */}
      <h3 className="dashboard-section-heading">Behavioral &amp; Educational Insights (from Notebook EDA)</h3>
      <div className="charts-grid">
        {/* Plot 1: Past Failures vs Risk Rate */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Past Class Failures vs. At-Risk Probability</h3>
            <span className="chart-desc">Direct impact of prior academic failures on final passing odds</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={edaData.failures_impact} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e261f" />
                <XAxis dataKey="failures" stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <YAxis stroke="#5e6d60" unit="%" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Risk Probability']} 
                  contentStyle={{ backgroundColor: '#121813', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff' }} 
                />
                <Bar dataKey="risk_rate" name="At-Risk Rate (%)" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Study Time Impact */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Weekly Study Time vs. Risk Rate</h3>
            <span className="chart-desc">Shows how dedicated study hours outside class reduce failure risk</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={edaData.studytime_impact} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e261f" />
                <XAxis dataKey="studytime" stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <YAxis stroke="#5e6d60" unit="%" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'At-Risk Proportion']}
                  contentStyle={{ backgroundColor: '#121813', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff' }} 
                />
                <Line type="monotone" dataKey="risk_rate" name="Risk %" stroke="#84cc16" strokeWidth={3} dot={{ fill: '#84cc16', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 3: Absences Binned Impact */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>School Absenteeism (Days) vs. Risk Rate</h3>
            <span className="chart-desc">Threshold analysis: elevated absences correlate with failure</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={edaData.absences_impact} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e261f" />
                <XAxis dataKey="range" stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <YAxis stroke="#5e6d60" unit="%" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'At-Risk Rate']}
                  contentStyle={{ backgroundColor: '#121813', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff' }} 
                />
                <Bar dataKey="risk_rate" name="Risk %" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 4: Alcohol Score Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Cumulative Alcohol Intake (Dalc + Walc)</h3>
            <span className="chart-desc">Combined weekday &amp; weekend drinking impact on academic resilience</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={edaData.alcohol_impact} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e261f" />
                <XAxis dataKey="score" stroke="#5e6d60" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <YAxis stroke="#5e6d60" unit="%" tick={{ fill: '#9aa89b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'At-Risk Proportion']}
                  contentStyle={{ backgroundColor: '#121813', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff' }} 
                />
                <Area type="monotone" dataKey="risk_rate" name="At-Risk Rate (%)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#roseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Live Query Stream Table */}
      <div className="logs-section">
        <h3 className="dashboard-section-heading">Live Query Logs (Last 20 Inferences)</h3>
        <div className="table-wrapper">
          <table className="cohort-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp (UTC)</th>
                <th>Course</th>
                <th>G1 / G2 Grades</th>
                <th>Absences</th>
                <th>Failures</th>
                <th>Assessed Band</th>
                <th>Probability</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#5e6d60' }}>
                    No predictions logged yet. Run a student assessment to populate the live stream!
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td><code>#{log.id}</code></td>
                    <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td><span className="badge-outline">{log.course}</span></td>
                    <td>{log.g1} / {log.g2}</td>
                    <td>{log.absences} days</td>
                    <td>{log.failures}</td>
                    <td>
                      <span className={`risk-tag ${log.risk_level.includes('High') ? 'tag-high' : log.risk_level.includes('Moderate') ? 'tag-mod' : 'tag-low'}`}>
                        {log.risk_level}
                      </span>
                    </td>
                    <td><strong style={{ color: '#84cc16' }}>{(log.risk_probability * 100).toFixed(1)}%</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
