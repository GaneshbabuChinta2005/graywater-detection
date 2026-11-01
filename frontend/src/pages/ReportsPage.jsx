import React, { useState, useEffect, useMemo } from 'react';
import { getReports, getAnalysisHistory } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import RegulatoryChallanModal from '../components/RegulatoryChallanModal';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Calendar,
  CheckSquare,
  Search,
  Filter,
  Inbox,
  Scale,
  Eye,
  FileText,
  AlertOctagon
} from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

  // Regulatory Auto-Challan Modal State
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [selectedChallanData, setSelectedChallanData] = useState(null);
  const [challanScenario, setChallanScenario] = useState('auto');

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
    const headers = [
      'analysisId',
      'timestamp',
      'source',
      'predictedRoute',
      'confidence',
      'anomalyStatus',
      'safetyStatus',
      'finalRoute',
      'finalAction',
      'statutoryCompliance',
      'overrideApplied'
    ];
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
      a.finalAction === 'SEWER_BYPASS' ? 'VIOLATION - SEWER OVERRIDE' : a.finalAction === 'DEFER_ROUTE' ? 'DEFERRED - MONSOON' : 'COMPLIANT',
      a.overrideApplied
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquatrack_water_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenChallan = (record = null, scenario = 'auto') => {
    setSelectedChallanData(record);
    setChallanScenario(scenario);
    setIsChallanModalOpen(true);
  };

  const getFormalStatus = (item) => {
    if (item.finalAction === 'SEWER_BYPASS' || item.overrideApplied || item.safetyStatus === 'SAFETY_FAIL') {
      return 'VIOLATION - SEWER OVERRIDE';
    }
    if (item.finalAction === 'DEFER_ROUTE') {
      return 'DEFERRED - MONSOON';
    }
    if (item.finalRoute === 'Indoor Reuse') {
      return 'PERMITTED REUSE';
    }
    return 'COMPLIANT';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            Water Quality Reports & Monitoring History
          </h1>
          <p className="page-subtitle">
            Review sample analysis results and routing suggestions from this student prototype.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn-danger"
            style={{ fontWeight: 700, padding: '8px 14px', fontSize: '0.8rem' }}
            onClick={() => handleOpenChallan(null, 'auto')}
          >
            <Scale size={15} />
            <span>Generate Demo Report</span>
          </button>
          <button className="btn-secondary" onClick={fetchData} disabled={loading} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} /> Refresh
          </button>
          <button className="btn-primary" onClick={downloadHistoryCSV} disabled={analyses.length === 0} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ─── Metric Cards Grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <MetricCard
          title="Total Evaluated Records"
          value={analyses.length}
          subtitle="Database audit logs"
          icon={CheckSquare}
          accentColor="#0F2942"
        />

        <MetricCard
          title="Reports Generated"
          value={reports.length}
          subtitle="Batch evaluations"
          icon={FileSpreadsheet}
          accentColor="#1D4ED8"
        />

        <MetricCard
          title="Active Filter Count"
          value={filteredAnalyses.length}
          subtitle="Matching current query"
          icon={Filter}
          accentColor="#4338CA"
        />

        <MetricCard
          title="Violations Flagged"
          value={analyses.filter(a => a.finalAction === 'SEWER_BYPASS' || a.overrideApplied).length}
          subtitle="Sewer interlock overrides"
          icon={AlertOctagon}
          accentColor="#B91C1C"
          badge={<StatusBadge label="AUDIT ACTIVE" />}
        />
      </div>

      {/* ─── Sample report banner ─────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderLeft: '4px solid #D97706',
          borderRadius: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={18} style={{ color: '#D97706' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Sample Water Quality Report
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2, margin: 0 }}>
              Creates an educational summary from sample readings. This is not an official notice or certified test result.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOpenChallan(null, 'cod')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Test: COD Breach (&gt;250 mg/L)
            </button>
            <button
              onClick={() => handleOpenChallan(null, 'ecoli')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Test: Pathogen Surge
            </button>
            <button
              onClick={() => handleOpenChallan(null, 'auto')}
              className="btn-danger"
              style={{ fontSize: '0.78rem', padding: '6px 14px', fontWeight: 700 }}
            >
              <FileText size={14} /> Open Demo Report
            </button>
          </div>
        </div>
      </div>

      {/* ─── Executive Reports List (if any) ─────────────────────────────── */}
      {reports.length > 0 && (
        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
            Batch Executive Reports
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reports.map((rep, idx) => (
              <div
                key={rep._id || idx}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {rep.title}
                    </h4>
                    <StatusBadge label={rep.reportType || 'BATCH_SUMMARY'} />
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: '0.75rem', color: '#64748B' }}>
                    <span>Samples: <strong style={{ color: '#0F172A' }}>{rep.totalSamples}</strong></span>
                    <span>Anomaly Rate: <strong style={{ color: '#0F172A' }}>{rep.anomalyRate}%</strong></span>
                    <span>Overrides: <strong style={{ color: '#B91C1C' }}>{rep.safetyOverridesCount}</strong></span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {rep.generatedAt ? rep.generatedAt.split('T')[0] : '2026-10-31'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Telemetry Decisions Log Table ─────────────────────────── */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Recent Telemetry Decisions Log
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
              Prototype log of analysis results, routing suggestions, and confidence scores.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search stream or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 30, paddingRight: 10, height: 32, fontSize: '0.8rem' }}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', height: 32, fontSize: '0.8rem', padding: '0 8px' }}
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
              style={{ width: 'auto', height: 32, fontSize: '0.8rem', padding: '0 8px' }}
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="ALLOW_ROUTE">ALLOW_ROUTE (Permitted)</option>
              <option value="DEFER_ROUTE">DEFER_ROUTE (Monsoon)</option>
              <option value="SEWER_BYPASS">SEWER_BYPASS (Violation)</option>
            </select>
          </div>
        </div>

        {filteredAnalyses.length === 0 ? (
          <div className="empty-state">
            <Inbox className="empty-state-icon" />
            <div className="empty-state-title">No Audit Logs Found</div>
            <p className="empty-state-desc">
              {analyses.length === 0
                ? 'No analysis runs have been logged yet. Step the digital twin to populate records.'
                : 'No records match your active search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Time (IST)</th>
                  <th>Source Stream</th>
                  <th>ML Prediction</th>
                  <th>Confidence</th>
                  <th>Anomaly</th>
                  <th>Final Route</th>
                  <th>Status</th>
                  <th>Override</th>
                  <th>Notice</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((a, i) => {
                  const formalStatus = getFormalStatus(a);
                  return (
                    <tr key={a.analysisId || a._id || i}>
                      <td style={{ fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                        {a.timestamp ? a.timestamp.split('T')[1]?.slice(0, 8) || a.timestamp : '--'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{a.source}</td>
                      <td>{a.predictedRoute}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{((a.confidence || 0) * 100).toFixed(0)}%</td>
                      <td><StatusBadge label={a.anomalyStatus} /></td>
                      <td style={{ fontWeight: 700, color: '#0F2942' }}>{a.finalRoute}</td>
                      <td>
                        <StatusBadge label={formalStatus} />
                      </td>
                      <td>
                        {a.overrideApplied ? (
                          <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.72rem' }}>YES</span>
                        ) : (
                          <span style={{ color: '#64748B', fontSize: '0.72rem' }}>NO</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenChallan(a, a.finalAction === 'SEWER_BYPASS' ? 'cod' : 'auto')}
                          style={{
                            backgroundColor: formalStatus.includes('VIOLATION') ? '#FEF2F2' : '#F1F5F9',
                            color: formalStatus.includes('VIOLATION') ? '#B91C1C' : '#0F2942',
                            border: `1px solid ${formalStatus.includes('VIOLATION') ? '#FECACA' : '#CBD5E1'}`,
                            borderRadius: '3px',
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Notice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Auto-Challan Regulatory Modal ───────────────────────────────── */}
      <RegulatoryChallanModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        telemetry={selectedChallanData}
        initialScenario={challanScenario}
      />
    </div>
  );
};

export default ReportsPage;
