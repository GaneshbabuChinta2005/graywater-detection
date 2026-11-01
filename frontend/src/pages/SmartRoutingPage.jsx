import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
<<<<<<< HEAD
import { GitFork, ShieldCheck, AlertOctagon, CheckCircle2, FileText, ArrowRight, Home, TreePine, Filter, Flame } from 'lucide-react';
=======
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
>>>>>>> myrepo/main
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';

const ROUTING_CATEGORIES = [
  {
    name: 'Indoor Reuse',
<<<<<<< HEAD
    desc: 'Toilet flushing & non-contact indoor infrastructure. Requires high purity & near-zero pathogen load.',
    icon: Home,
    color: '#2563EB',
    bgColor: 'var(--info-bg)',
    borderColor: 'var(--info-border)'
  },
  {
    name: 'Restricted Irrigation',
    desc: 'Subsurface landscape & drip irrigation. Strict runoff prevention, moderate salinity, weather-gated.',
    icon: TreePine,
    color: '#0F766E',
    bgColor: 'var(--primary-subtle)',
    borderColor: 'var(--primary-border)'
  },
  {
    name: 'Bio-filtration',
    desc: 'Constructed wetlands, reed beds, or sand filtration. Required for surfactant or elevated organic loads.',
    icon: Filter,
    color: '#B45309',
    bgColor: 'var(--warning-bg)',
    borderColor: 'var(--warning-border)'
  },
  {
    name: 'Sewer Bypass',
    desc: 'Direct fail-safe discharge to municipal sewer. Triggered by severe contamination, kitchen grease, or anomaly.',
    icon: Flame,
    color: '#B91C1C',
    bgColor: 'var(--danger-bg)',
    borderColor: 'var(--danger-border)'
=======
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
>>>>>>> myrepo/main
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
<<<<<<< HEAD
    explanation: 'All water quality parameters comply with regulatory non-potable thresholds.'
  };

  const probChartData = Object.entries(pred.probabilities || {}).map(([name, prob]) => ({
    name,
    probability: parseFloat((prob * 100).toFixed(1)),
    color: name === routing.final_route ? ct.colorPrimary : ct.tickFill
=======
    explanation: 'All water quality parameters comply with regulatory non-potable thresholds under CPCB Schedule VI.'
  };

  const isViolation = routing.override_applied || routing.final_action === 'SEWER_BYPASS';

  const probChartData = Object.entries(pred.probabilities || {}).map(([name, prob]) => ({
    name,
    probability: parseFloat((prob * 100).toFixed(1)),
    color: name === routing.final_route ? '#0F2942' : '#94A3B8'
>>>>>>> myrepo/main
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
<<<<<<< HEAD
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Smart Context-Aware Routing & Multi-Criteria Arbitration
          </h1>
          <p className="page-subtitle">
            Hierarchical arbitration engine synthesizing supervised XGBoost probability vectors with deterministic EPA/WHO safety cutoffs, weather advisories, and tank decay kinetics.
=======
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Smart Context-Aware Routing & Statutory Multi-Criteria Arbitration
          </h1>
          <p className="page-subtitle">
            Hierarchical arbitration engine synthesizing supervised XGBoost probability distributions with deterministic CPCB/EPA statutory cutoffs, meteorological alerts, and tank decay kinetics.
>>>>>>> myrepo/main
          </p>
        </div>
        <StatusBadge label={`ACTIVE: ${routing.final_route}`} size="lg" />
      </div>

<<<<<<< HEAD
      {/* Top 4 Metric Cards */}
=======
      {/* ─── Top 4 Metric Cards Grid ──────────────────────────────────────── */}
>>>>>>> myrepo/main
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Supervised ML Class"
          value={pred.class_name}
<<<<<<< HEAD
          subtitle={`Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="var(--info)"
=======
          subtitle={`Probability: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="#0F2942"
>>>>>>> myrepo/main
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
<<<<<<< HEAD
          title="Safety Interlock"
          value={safety.status}
          subtitle={safety.violations?.length ? `${safety.violations.length} critical breach(es)` : 'Zero threshold violations'}
          icon={ShieldCheck}
          accentColor={safety.violations?.length ? 'var(--danger)' : 'var(--success)'}
=======
          title="Safety Interlock Status"
          value={safety.status}
          subtitle={safety.violations?.length ? `${safety.violations.length} critical breach(es)` : 'Zero threshold violations'}
          icon={ShieldCheck}
          accentColor={safety.violations?.length ? '#B91C1C' : '#15803D'}
>>>>>>> myrepo/main
          badge={<StatusBadge label={safety.status} />}
        />

        <MetricCard
          title="Arbitration Override"
<<<<<<< HEAD
          value={routing.override_applied ? 'OVERRIDE TRIGGERED' : 'ML CONFIRMED'}
          subtitle={routing.override_applied ? 'Deterministic rule override enforced' : 'Model prediction approved'}
          icon={AlertOctagon}
          accentColor={routing.override_applied ? 'var(--warning)' : 'var(--success)'}
          badge={<StatusBadge label={routing.override_applied ? 'OVERRIDDEN' : 'APPROVED'} />}
        />

        <MetricCard
          title="Final Route & Action"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor="var(--primary)"
=======
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
>>>>>>> myrepo/main
          badge={<StatusBadge label={routing.final_action} />}
        />
      </div>

<<<<<<< HEAD
      {/* 4 Standard Routing Categories Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Standard Non-Potable Greywater Destinations
=======
      {/* ─── 4 Standard Routing Categories Grid ──────────────────────────── */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
          Standard Non-Potable Greywater Destinations (CPCB Schedule VI Categories)
>>>>>>> myrepo/main
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {ROUTING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCurrentFinal = routing.final_route === cat.name;
            return (
              <div
                key={cat.name}
                style={{
<<<<<<< HEAD
                  backgroundColor: isCurrentFinal ? cat.bgColor : 'var(--bg-surface)',
                  border: isCurrentFinal ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  boxShadow: isCurrentFinal ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
=======
                  backgroundColor: isCurrentFinal ? cat.bgColor : '#FFFFFF',
                  border: isCurrentFinal ? `2px solid ${cat.color}` : '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: isCurrentFinal ? '0 4px 6px -1px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
>>>>>>> myrepo/main
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
<<<<<<< HEAD
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isCurrentFinal ? '#FFFFFF' : 'var(--bg-surface-subtle)',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
=======
                        borderRadius: '6px',
                        backgroundColor: isCurrentFinal ? '#FFFFFF' : '#F1F5F9',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #CBD5E1'
>>>>>>> myrepo/main
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {isCurrentFinal && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
<<<<<<< HEAD
                          fontWeight: 700,
                          backgroundColor: cat.color,
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase'
=======
                          fontWeight: 800,
                          backgroundColor: cat.color,
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
>>>>>>> myrepo/main
                        }}
                      >
                        Active Route
                      </span>
                    )}
                  </div>
<<<<<<< HEAD
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {cat.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
=======
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                    {cat.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
>>>>>>> myrepo/main
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

<<<<<<< HEAD
      {/* Probability Spectrum & Transparent Audit Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Softmax Probability Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              XGBoost 4-Class Probability Distribution
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Softmax output probabilities across valid greywater destinations.
            </p>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probChartData} layout="vertical" margin={{ left: 130, right: 30, top: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
                <YAxis type="category" dataKey="name" stroke="var(--border-color)" tick={{ fontSize: 11, fill: ct.tickFillPrimary, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
                    fontSize: 12
=======
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
>>>>>>> myrepo/main
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
<<<<<<< HEAD
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Decision Audit Trace & Reason Codes
=======
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FileText size={18} style={{ color: '#0F2942' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Decision Audit Trace & Statutory Reason Codes
>>>>>>> myrepo/main
              </h3>
            </div>

            <div style={{ marginBottom: 16 }}>
<<<<<<< HEAD
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Machine-Readable Reason Codes:
=======
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Machine-Readable Audit Reason Codes:
>>>>>>> myrepo/main
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(routing.reason_codes || ['RC_ML_CONFIDENT_ALLOW']).map(code => (
                  <span
                    key={code}
                    style={{
<<<<<<< HEAD
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-subtle)',
                      border: '1px solid var(--primary-border)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--primary)',
                      fontWeight: 600
=======
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#0F2942',
                      fontWeight: 700
>>>>>>> myrepo/main
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
<<<<<<< HEAD
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5
            }}
          >
            <strong style={{ color: 'var(--primary)', marginRight: 4 }}>Arbitration Summary:</strong>{' '}
            {latestAnalysis?.explanation?.summary ||
              'Water telemetry demonstrates low suspended sediment and microbial counts suitable for landscape irrigation without environmental runoff risk.'}
=======
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
>>>>>>> myrepo/main
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRoutingPage;
