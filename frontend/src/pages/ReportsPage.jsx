import React, { useState, useEffect, useMemo } from 'react';
import { getReports, getAnalysisHistory } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { FileSpreadsheet, Download, RefreshCw, Calendar, CheckSquare, Search, Filter, AlertTriangle, Inbox } from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

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

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesSearch =
        searchTerm === '' ||
        (a.source && a.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.predictedRoute && a.predictedRoute.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.finalRoute && a.finalRoute.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSource = filterSource === 'ALL' || a.source === filterSource;
      const matchesAction = filterAction === 'ALL' || a.finalAction === filterAction;

      return matchesSearch && matchesSource && matchesAction;
    });
  }, [analyses, searchTerm, filterSource, filterAction]);

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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            System Audit Reports & Historical Telemetry Logs
          </h1>
          <p className="page-subtitle">
            Auditable records of automated routing decisions, laboratory batch evaluations, and compliance safety logs stored in MongoDB.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={downloadHistoryCSV} disabled={analyses.length === 0}>
            <Download size={14} /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Audit Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Total Evaluated Records"
          value={analyses.length}
          subtitle="Persistent telemetry audit entries"
          icon={CheckSquare}
          accentColor="var(--primary)"
        />

        <MetricCard
          title="Audit Reports Generated"
          value={reports.length}
          subtitle="Batch evaluations & executive summaries"
          icon={FileSpreadsheet}
          accentColor="var(--info)"
        />

        <MetricCard
          title="Filtered Records In View"
          value={filteredAnalyses.length}
          subtitle="Matching current query filters"
          icon={Filter}
          accentColor="var(--purple)"
        />
      </div>

      {/* Reports List */}
      {reports.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Executive Batch & Compliance Reports
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map((rep, idx) => (
              <div
                key={rep._id || idx}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rep.title}
                    </h4>
                    <StatusBadge label={rep.reportType || 'BATCH_SUMMARY'} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {rep.summaryText}
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>Total Samples: <strong style={{ color: 'var(--text-primary)' }}>{rep.totalSamples}</strong></span>
                    <span>Anomaly Rate: <strong style={{ color: 'var(--text-primary)' }}>{rep.anomalyRate}%</strong></span>
                    <span>Safety Overrides: <strong style={{ color: 'var(--text-primary)' }}>{rep.safetyOverridesCount}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={13} />
                  {rep.generatedAt ? rep.generatedAt.split('T')[0] : '2026-10-03'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Evaluations Table with Search & Filter */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Telemetry Decisions Log (Last 50 Entries)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Traceable record of arbitration reasons, safety interlocks, and ML confidence levels.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search source or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 30, paddingRight: 10, height: 34, fontSize: '0.8125rem' }}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', height: 34, fontSize: '0.8125rem', padding: '0 8px' }}
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="ALL">All Sources</option>
              <option value="Bathroom">Bathroom</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Laundry">Laundry</option>
              <option value="Mixed">Mixed</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', height: 34, fontSize: '0.8125rem', padding: '0 8px' }}
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="ALLOW_ROUTE">ALLOW_ROUTE</option>
              <option value="DEFER_ROUTE">DEFER_ROUTE</option>
              <option value="SEWER_BYPASS">SEWER_BYPASS</option>
            </select>
          </div>
        </div>

        {filteredAnalyses.length === 0 ? (
          <div className="empty-state">
            <Inbox className="empty-state-icon" />
            <div className="empty-state-title">No Audit Logs Found</div>
            <p className="empty-state-desc">
              {analyses.length === 0
                ? 'No analysis runs have been logged yet. Run an analysis or step the digital twin to populate records.'
                : 'No records match your active search or filter criteria.'}
            </p>
            {searchTerm || filterSource !== 'ALL' || filterAction !== 'ALL' ? (
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSource('ALL');
                  setFilterAction('ALL');
                }}
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="data-table-container">
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
                {filteredAnalyses.map((a, i) => (
                  <tr key={a.analysisId || a._id || i}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {a.timestamp ? a.timestamp.split('T')[1]?.slice(0, 8) || a.timestamp : '--'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.source}</td>
                    <td>{a.predictedRoute}</td>
                    <td>{((a.confidence || 0) * 100).toFixed(1)}%</td>
                    <td><StatusBadge label={a.anomalyStatus} /></td>
                    <td><StatusBadge label={a.safetyStatus} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{a.finalRoute}</td>
                    <td><StatusBadge label={a.finalAction} /></td>
                    <td>
                      {a.overrideApplied ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.75rem' }}>YES</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>NO</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
