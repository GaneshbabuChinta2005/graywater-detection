import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  GitFork,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  FileText,
  ArrowRight,
  Home,
  TreePine,
  Filter,
  Flame,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';

const ROUTING_CATEGORIES = [
  {
    name: 'Indoor Reuse',
    desc: 'Toilet flushing & non-contact institutional plumbing. Strict CPCB biological purity standards.',
    icon: Home,
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  {
    name: 'Restricted Irrigation',
    desc: 'Subsurface landscape & agricultural drip diversion. Runoff prevention & weather-gated.',
    icon: TreePine,
    color: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  {
    name: 'Bio-filtration',
    desc: 'Constructed wetlands, reed beds, or sand filtration. Required for surfactant loads.',
    icon: Filter,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  {
    name: 'Sewer Bypass',
    desc: 'Direct fail-safe discharge to municipal trunk sewer. Enforced on severe breach or anomaly.',
    icon: Flame,
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA'
  }
];

export const SmartRoutingPage = () => {
  const { latestAnalysis, summary } = useSystem();
  const ct = useChartTheme();

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

  const routing = latestAnalysis?.routing || {
    final_route: summary?.finalRoute || 'Restricted Irrigation',
    final_action: summary?.finalAction || 'ALLOW_ROUTE',
    override_applied: false,
    reason_codes: ['RC_ML_CONFIDENT_ALLOW']
  };

  const safety = latestAnalysis?.safety || {
    status: summary?.safetyStatus || 'SAFE_FOR_MODEL_REVIEW',
    violations: [],
    explanation: 'All water quality parameters comply with regulatory non-potable thresholds under CPCB Schedule VI.'
  };

  const isViolation = routing.override_applied || routing.final_action === 'SEWER_BYPASS';

  const probChartData = Object.entries(pred.probabilities || {}).map(([name, prob]) => ({
    name,
    probability: parseFloat((prob * 100).toFixed(1)),
    color: name === routing.final_route ? '#0F2942' : '#94A3B8'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Smart Context-Aware Routing & Statutory Multi-Criteria Arbitration
          </h1>
          <p className="page-subtitle">
            Hierarchical arbitration engine synthesizing supervised XGBoost probability distributions with deterministic CPCB/EPA statutory cutoffs, meteorological alerts, and tank decay kinetics.
          </p>
        </div>
        <StatusBadge label={`ACTIVE: ${routing.final_route}`} size="lg" />
      </div>

      {/* ─── Top 4 Metric Cards Grid ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Supervised ML Class"
          value={pred.class_name}
          subtitle={`Probability: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="#0F2942"
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
          title="Safety Interlock Status"
          value={safety.status}
          subtitle={safety.violations?.length ? `${safety.violations.length} critical breach(es)` : 'Zero threshold violations'}
          icon={ShieldCheck}
          accentColor={safety.violations?.length ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={safety.status} />}
        />

        <MetricCard
          title="Arbitration Override"
          value={routing.override_applied ? 'OVERRIDE ENFORCED' : 'ML CONFIRMED'}
          subtitle={routing.override_applied ? 'Deterministic rule override enforced' : 'Model prediction approved'}
          icon={AlertOctagon}
          accentColor={routing.override_applied ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={routing.override_applied ? 'VIOLATION - SEWER OVERRIDE' : 'COMPLIANT'} />}
        />

        <MetricCard
          title="Final Arbitrated Route"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor={isViolation ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={routing.final_action} />}
        />
      </div>

      {/* ─── 4 Standard Routing Categories Grid ──────────────────────────── */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
          Standard Non-Potable Greywater Destinations (CPCB Schedule VI Categories)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {ROUTING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCurrentFinal = routing.final_route === cat.name;
            return (
              <div
                key={cat.name}
                style={{
                  backgroundColor: isCurrentFinal ? cat.bgColor : '#FFFFFF',
                  border: isCurrentFinal ? `2px solid ${cat.color}` : '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: isCurrentFinal ? '0 4px 6px -1px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: isCurrentFinal ? '#FFFFFF' : '#F1F5F9',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {isCurrentFinal && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          backgroundColor: cat.color,
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        Active Route
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                    {cat.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Probability Spectrum & Transparent Audit Section ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Softmax Probability Distribution */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              XGBoost 4-Class Probability Spectrum
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
              Normalized softmax confidence levels across domestic destination classes.
            </p>
          </div>

          <div style={{ width: '100%', height: 240, backgroundColor: '#FFFFFF' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probChartData} layout="vertical" margin={{ left: 130, right: 30, top: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
                <YAxis type="category" dataKey="name" stroke="#CBD5E1" tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }} />
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
                <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                  {probChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reason Codes & Operational Summary */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FileText size={18} style={{ color: '#0F2942' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Decision Audit Trace & Statutory Reason Codes
              </h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Machine-Readable Audit Reason Codes:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(routing.reason_codes || ['RC_ML_CONFIDENT_ALLOW']).map(code => (
                  <span
                    key={code}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#0F2942',
                      fontWeight: 700
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              fontSize: '0.84rem',
              color: '#0F172A',
              lineHeight: 1.5
            }}
          >
            <strong style={{ color: '#0F2942', marginRight: 4 }}>Statutory Arbitration Summary:</strong>{' '}
            {latestAnalysis?.explanation?.summary ||
              'Effluent telemetry demonstrates low suspended sediment and microbial counts suitable for landscape irrigation without environmental runoff risk.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRoutingPage;
