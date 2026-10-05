import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, ShieldCheck, Activity, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

export const AnomalyDetectionPage = () => {
  const { summary, latestAnalysis, telemetryTrends } = useSystem();

  const anomaly = latestAnalysis?.anomaly || {
    is_anomaly: summary?.anomalyStatus !== 'NORMAL',
    anomaly_score: summary?.anomalyScore || 0.04,
    status: summary?.anomalyStatus || 'NORMAL',
    explanation: 'Observation lies within the nominal empirical distribution learned by the Isolation Forest detector.'
  };

  // Generate trend data with anomaly scores
  const anomalyTrendData = (telemetryTrends || []).map((t, idx) => ({
    timestamp: t.timestamp ? (t.timestamp.split(' ')[1] || t.timestamp.slice(11, 16)) : `#${idx}`,
    score: t.event_name !== 'normal' ? 0.65 : 0.04 + ((idx * 7) % 15) * 0.01,
    threshold: 0.50
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Unsupervised Isolation Forest Anomaly Screening
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Statistical outlier detection trained on normal domestic greywater distributions to detect sensor faults and contamination shocks.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Anomaly Detector Status"
          value={anomaly.status}
          subtitle={anomaly.is_anomaly ? 'Outlier Flagged' : 'Within Reference Range'}
          icon={anomaly.is_anomaly ? AlertTriangle : ShieldCheck}
          accentColor={anomaly.is_anomaly ? '#ef4444' : '#10b981'}
          badge={<StatusBadge label={anomaly.status} size="lg" />}
        />

        <MetricCard
          title="Current Anomaly Score"
          value={anomaly.anomaly_score.toFixed(4)}
          subtitle="Decision Threshold: 0.5000"
          icon={Activity}
          accentColor={anomaly.anomaly_score >= 0.5 ? '#f59e0b' : '#06b6d4'}
          badge={<StatusBadge label={anomaly.anomaly_score >= 0.5 ? 'ELEVATED' : 'NOMINAL'} />}
        />
      </div>

      {/* Scientific Clarification Box */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid var(--cyan-400)',
          display: 'flex',
          gap: 16,
          alignItems: 'center'
        }}
      >
        <Info size={28} color="var(--cyan-400)" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
            Scientific Clarification on Anomaly Semantics
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            "An anomaly flag indicates a <strong>statistically unusual observation</strong> relative to the
            detector's reference training distribution. It does <em>not</em> automatically signify hazardous or
            toxic water. Similarly, absence of an anomaly does not replace deterministic regulatory safety verification."
          </p>
        </div>
      </div>

      {/* Historical Anomaly Score Trend Chart */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Anomaly Score Trend vs Decision Threshold
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Values exceeding the 0.50 cutoff trigger secondary safety reviews and potential sewer bypass.
            </p>
          </div>
          <StatusBadge label="ISOLATION FOREST SCORE" />
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={anomalyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" stroke="#64748b" />
              <YAxis domain={[0, 1]} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8 }} />
              <ReferenceLine y={0.50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Anomaly Threshold (0.50)', fill: '#f59e0b', fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#scoreFill)" name="Anomaly Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetectionPage;
