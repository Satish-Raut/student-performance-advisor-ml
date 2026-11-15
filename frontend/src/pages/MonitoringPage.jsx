import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { apiService } from '../services/api';

const RISK_COLORS = {
  'High Risk': '#f43f5e',
  'Moderate Risk': '#f59e0b',
  'Low Risk / On Track': '#10b981'
};

const PIE_COLORS = ['#f43f5e', '#f59e0b', '#10b981'];

export const MonitoringPage = () => {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, logsData] = await Promise.all([
        apiService.getMonitoringSummary(),
        apiService.getMonitoringLogs(25),
      ]);
      setSummary(sumData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load monitoring analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const riskPieData = summary ? [
    { name: 'High Risk', value: summary.high_risk_total },
    { name: 'Moderate Risk', value: summary.moderate_risk_total },
    { name: 'Low Risk', value: summary.low_risk_total },
  ].filter(d => d.value > 0) : [];

  const courseBarData = summary ? Object.entries(summary.course_breakdown).map(([course, count]) => ({
    name: course.toUpperCase(),
    Inferences: count,
  })) : [];

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div>
          <h2>MLOps Real-Time Inference &amp; Drift Monitor</h2>
          <p className="text-muted">
            Monitors live inference distributions, risk shifts, and database logs using lightweight SQLite streaming.
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh Metrics
        </button>
      </div>

      {summary && (
        <div className="summary-stats-grid">
          <div className="stat-card">
            <span className="stat-title">Total Processed Inferences</span>
            <span className="stat-number">{summary.total_inferences}</span>
            <span className="stat-sub">Persisted in SQLite</span>
          </div>

          <div className="stat-card danger">
            <span className="stat-title">Overall At-Risk Proportion</span>
            <span className="stat-number">{(summary.at_risk_ratio * 100).toFixed(1)}%</span>
            <span className="stat-sub">Flagged with G3 &lt; 10 probability</span>
          </div>

          <div className="stat-card">
            <span className="stat-title">Mean Risk Probability</span>
            <span className="stat-number">{(summary.average_risk_probability * 100).toFixed(1)}%</span>
            <span className="stat-sub">Across all live queries</span>
          </div>

          <div className="stat-card success">
            <span className="stat-title">Active Database Store</span>
            <span className="stat-number">SQLite3</span>
            <span className="stat-sub">WAL Mode Enabled</span>
          </div>
        </div>
      )}

      {/* Visual Charts */}
      {summary && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Risk Category Distribution</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                {riskPieData.length === 0 ? (
                  <div className="empty-chart-text">No inference data recorded yet</div>
                ) : (
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '8px', 
                        color: '#ffffff' 
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '0.85rem' }} 
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Inference Volume by Course Major</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={courseBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      color: '#ffffff' 
                    }} 
                  />
                  <Bar dataKey="Inferences" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Query Logs Table */}
      <div className="logs-section">
        <h3>Live Inference Stream (Last 25 Evaluations)</h3>
        <div className="table-wrapper">
          <table className="cohort-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp (UTC)</th>
                <th>Course</th>
                <th>G1 / G2</th>
                <th>Absences</th>
                <th>Failures</th>
                <th>Assessed Band</th>
                <th>Probability</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    No predictions logged yet. Run a student assessment to generate live log data!
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
                    <td><strong>{(log.risk_probability * 100).toFixed(1)}%</strong></td>
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
