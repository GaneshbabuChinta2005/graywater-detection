import React, { useState, useEffect } from 'react';
import { getReports, getAnalysisHistory } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { FileSpreadsheet, Download, RefreshCw, Calendar, CheckSquare } from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repData, anaData] = await Promise.all([getReports(), getAnalysisHistory(50)]);
      if (repData.success) setReports(repData.reports || []);
      if (anaData.success) setAnalyses(anaData.analyses || []);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadHistoryCSV = () => {
    if (analyses.length === 0) return;
    const headers = ['analysisId', 'timestamp', 'source', 'predictedRoute', 'confidence', 'anomalyStatus', 'safetyStatus', 'finalRoute', 'finalAction', 'overrideApplied'];
    const rows = analyses.map(a => [
      a.analysisId,
      a.timestamp,
      a.source,
      a.predictedRoute,
      a.confidence,
      a.anomalyStatus,
      a.safetyStatus,
      a.finalRoute,
      a.finalAction,
      a.overrideApplied
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greywater_analysis_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System Audit Reports & Historical Telemetry Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Immutable records of automated routing decisions, batch evaluations, and compliance audits stored in MongoDB.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={fetchData}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={downloadHistoryCSV}>
            <Download size={15} /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Audit Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Total Evaluated Records"
          value={analyses.length}
          subtitle="Persistent audit log count"
          icon={CheckSquare}
          accentColor="#06b6d4"
        />

        <MetricCard
          title="Audit Reports Generated"
          value={reports.length}
          subtitle="Batch evaluations & daily summaries"
          icon={FileSpreadsheet}
          accentColor="#3b82f6"
        />
      </div>

      {/* Reports List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Executive Batch & Compliance Reports
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((rep, idx) => (
            <div
              key={rep._id || idx}
              style={{
                padding: '16px 20px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {rep.title}
                  </h4>
                  <StatusBadge label={rep.reportType || 'BATCH_SUMMARY'} />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {rep.summaryText}
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>Total Samples: <strong>{rep.totalSamples}</strong></span>
                  <span>Anomaly Rate: <strong>{rep.anomalyRate}%</strong></span>
                  <span>Safety Overrides: <strong>{rep.safetyOverridesCount}</strong></span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                {rep.generatedAt ? rep.generatedAt.split('T')[0] : '2026-10-03'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Recent Telemetry Decisions Log (Last 50 Entries)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>ML Class</th>
                <th>Confidence</th>
                <th>Anomaly</th>
                <th>Safety</th>
                <th>Final Route</th>
                <th>Action</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a, i) => (
                <tr key={a.analysisId || a._id || i}>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {a.timestamp ? a.timestamp.split('T')[1]?.slice(0, 8) || a.timestamp : '--'}
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{a.source}</td>
                  <td>{a.predictedRoute}</td>
                  <td>{((a.confidence || 0) * 100).toFixed(1)}%</td>
                  <td><StatusBadge label={a.anomalyStatus} /></td>
                  <td><StatusBadge label={a.safetyStatus} /></td>
                  <td style={{ fontWeight: 600, color: 'var(--cyan-400)' }}>{a.finalRoute}</td>
                  <td><StatusBadge label={a.finalAction} /></td>
                  <td>
                    {a.overrideApplied ? (
                      <span style={{ color: '#f87171', fontWeight: 600 }}>YES</span>
                    ) : (
                      <span style={{ color: '#34d399' }}>NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
