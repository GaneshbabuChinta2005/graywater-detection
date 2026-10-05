import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { GitFork, ShieldCheck, AlertOctagon, CheckCircle2, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const SmartRoutingPage = () => {
  const { latestAnalysis, summary } = useSystem();

  const pred = latestAnalysis?.prediction || {
    class_name: summary?.predictedRoute || 'Restricted Irrigation',
    confidence: summary?.confidence || 0.94,
    probabilities: {
      'Sewer Bypass': 0.02,
      'Bio-filtration': 0.04,
      'Restricted Irrigation': 0.92,
      'Indoor Reuse': 0.02
    }
  };

  const probChartData = Object.entries(pred.probabilities || {}).map(([name, prob]) => ({
    name,
    probability: parseFloat((prob * 100).toFixed(1)),
    color: name === pred.class_name ? '#10b981' : '#334155'
  }));

  const routing = latestAnalysis?.routing || {
    final_route: summary?.finalRoute || 'Restricted Irrigation',
    final_action: summary?.finalAction || 'ALLOW_ROUTE',
    override_applied: false,
    reason_codes: ['RC_ML_CONFIDENT_ALLOW']
  };

  const safety = latestAnalysis?.safety || {
    status: summary?.safetyStatus || 'SAFE_FOR_MODEL_REVIEW',
    violations: [],
    explanation: 'All water quality parameters comply with regulatory non-potable thresholds.'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Smart Context-Aware Routing & Multi-Criteria Arbitration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Arbitrates between XGBoost probability vectors, deterministic EPA/WHO safety cutoffs, and environmental constraints.
        </p>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Supervised ML Class"
          value={pred.class_name}
          subtitle={`Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="#3b82f6"
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
          title="Safety Screening"
          value={safety.status}
          subtitle={safety.violations?.length ? `${safety.violations.length} breach(es)` : 'Zero threshold violations'}
          icon={ShieldCheck}
          accentColor={safety.violations?.length ? '#f87171' : '#10b981'}
          badge={<StatusBadge label={safety.status} />}
        />

        <MetricCard
          title="Arbitration Override"
          value={routing.override_applied ? 'OVERRIDE ACTIVE' : 'NO OVERRIDE'}
          subtitle={routing.override_applied ? 'Deterministic rule override' : 'ML model decision approved'}
          icon={AlertOctagon}
          accentColor={routing.override_applied ? '#fbbf24' : '#10b981'}
          badge={<StatusBadge label={routing.override_applied ? 'OVERRIDDEN' : 'APPROVED'} />}
        />

        <MetricCard
          title="Final Route & Action"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor="#10b981"
          badge={<StatusBadge label={routing.final_action} />}
        />
      </div>

      {/* Probability Distribution & Reason Codes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 4-Class Softmax Probability Distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            XGBoost 4-Class Probability Spectrum
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Softmax output probabilities across all valid non-potable greywater destinations.
          </p>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probChartData} layout="vertical" margin={{ left: 130, right: 30, top: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8 }} />
                <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                  {probChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reason Codes & Transparent Audit Rationale */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FileText size={20} color="var(--cyan-400)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Transparent Decision Trace & Reason Codes
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Active Decision Reason Codes:</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(routing.reason_codes || ['RC_ML_CONFIDENT_ALLOW']).map(code => (
                <span
                  key={code}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: '#67e8f9'
                  }}
                >
                  {code}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 10,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.86rem',
              color: '#f1f5f9',
              lineHeight: 1.5
            }}
          >
            <strong>Operational Summary:</strong>{' '}
            {latestAnalysis?.explanation?.summary ||
              'Water telemetry demonstrates low suspended sediment and microbiological loads suitable for landscape irrigation without environmental runoff risk.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRoutingPage;
