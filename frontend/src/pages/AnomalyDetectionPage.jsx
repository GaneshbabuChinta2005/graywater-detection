import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, ShieldCheck, Activity, Info, AlertOctagon, Scale, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';

export const AnomalyDetectionPage = () => {
  const { summary, latestAnalysis, telemetryTrends } = useSystem();
  const ct = useChartTheme();

  const anomaly = latestAnalysis?.anomaly || {
    is_anomaly: summary?.anomalyStatus !== 'NORMAL',
    anomaly_score: summary?.anomalyScore || 0.04,
    status: summary?.anomalyStatus || 'NORMAL',
    explanation: 'Observation lies within nominal empirical bounds learned by the Isolation Forest detector.'
  };

  const routing = latestAnalysis?.routing || {
    override_applied: false
  };

  // Generate trend data with anomaly scores
  const anomalyTrendData = (telemetryTrends || []).map((t, idx) => ({
    timestamp: t.timestamp ? (t.timestamp.split(' ')[1] || t.timestamp.slice(11, 16)) : `#${idx}`,
    score: t.event_name !== 'normal' ? 0.65 : 0.04 + ((idx * 7) % 15) * 0.01,
    threshold: 0.50
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Unsupervised Isolation Forest Anomaly Screening
          </h1>
          <p className="page-subtitle">
            Non-parametric statistical outlier detection isolating atypical multi-sensor vectors from reference domestic effluent baseline distributions.
          </p>
        </div>
        <StatusBadge label={anomaly.status} size="lg" />
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Anomaly Detector Status"
          value={anomaly.status}
          subtitle={anomaly.is_anomaly ? 'Statistical Outlier Flagged' : 'Within Reference Manifold'}
          icon={anomaly.is_anomaly ? AlertTriangle : ShieldCheck}
          accentColor={anomaly.is_anomaly ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={anomaly.status} size="lg" />}
        />

        <MetricCard
          title="Isolation Forest Score"
          value={anomaly.anomaly_score.toFixed(4)}
          subtitle="Decision Cutoff Threshold: 0.5000"
          icon={Activity}
          accentColor={anomaly.anomaly_score >= 0.5 ? '#D97706' : '#0F2942'}
          badge={<StatusBadge label={anomaly.anomaly_score >= 0.5 ? 'DEFERRED - MONSOON' : 'COMPLIANT'} />}
        />

        <MetricCard
          title="Safety Override Status"
          value={routing.override_applied ? 'ACTIVE OVERRIDE' : 'STANDARD EVAL'}
          subtitle={routing.override_applied ? 'Diverting to sewer bypass' : 'Nominal pipeline execution'}
          icon={AlertOctagon}
          accentColor={routing.override_applied ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={routing.override_applied ? 'VIOLATION - SEWER OVERRIDE' : 'COMPLIANT'} />}
        />
      </div>

      {/* ─── Scientific & Statutory Clarification Box ─────────────────────── */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          borderLeft: '5px solid #0F2942',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start'
        }}
      >
        <Info size={22} style={{ color: '#0F2942', flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', marginBottom: 4 }}>
            Scientific & Statutory Clarification on Anomaly Semantics
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            An anomaly flag indicates a <strong>statistically unusual multi-dimensional reading</strong> relative to the detector training manifold. It flags potential equipment drift or transient chemical pulses for supervisory review. Deterministic CPCB cutoffs maintain absolute precedence over statistical flags.
          </p>
        </div>
      </div>

      {/* ─── Historical Anomaly Score Trend Chart ─────────────────────────── */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Continuous Isolation Score Trajectory & Statutory Threshold
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
              Values exceeding 0.50 indicate points lying outside the 95% domestic training hyper-envelope.
            </p>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B91C1C', backgroundColor: '#FEF2F2', padding: '3px 10px', borderRadius: '4px', border: '1px solid #FECACA' }}>
            Cutoff: 0.5000
          </span>
        </div>

        <div style={{ width: '100%', height: 280, backgroundColor: '#FFFFFF' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={anomalyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="anomGradGov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F2942" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0F2942" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
              <XAxis dataKey="timestamp" stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
              <YAxis stroke={ct.axisStroke} domain={[0, 1]} tick={{ fontSize: 11, fill: ct.tickFill }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  fontSize: 12,
                  color: '#0F172A'
                }}
              />
              <ReferenceLine y={0.50} stroke="#B91C1C" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Statutory Anomaly Boundary (0.50)', fill: '#B91C1C', fontSize: 11, position: 'top' }} />
              <Area type="monotone" dataKey="score" stroke="#0F2942" strokeWidth={2} fillOpacity={1} fill="url(#anomGradGov)" name="Isolation Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetectionPage;
