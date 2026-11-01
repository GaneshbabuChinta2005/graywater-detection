import React from 'react';
<<<<<<< HEAD
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, CloudRain, Database, Cpu, Activity, Lightbulb } from 'lucide-react';
=======
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, CloudRain, Database, Cpu, Activity, ShieldCheck } from 'lucide-react';
>>>>>>> myrepo/main
import StatusBadge from './StatusBadge';

export const DecisionPipelineVisualizer = ({ analysis }) => {
  if (!analysis) {
    return (
<<<<<<< HEAD
      <div className="card" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity size={28} style={{ color: 'var(--text-muted)', marginBottom: 8, margin: '0 auto' }} />
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Pipeline Data Available</div>
        <p style={{ fontSize: '0.85rem' }}>Run a manual analysis or advance the digital twin simulation step to trace the multi-context verification pipeline.</p>
=======
      <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <Activity size={24} style={{ color: '#94A3B8', marginBottom: 6, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Awaiting Pipeline Data</div>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Advance simulation step to trace real-time arbitration stages.</p>
>>>>>>> myrepo/main
      </div>
    );
  }

  const {
    source,
    prediction = {},
    anomaly = {},
    safety = {},
    weather = {},
    storage = {},
    routing = {},
    explanation = {}
  } = analysis;

  const stages = [
    {
      id: 1,
<<<<<<< HEAD
      name: 'Water Quality Telemetry',
      icon: Activity,
      status: 'INPUT_RECEIVED',
      value: `Source: ${source || 'Bathroom'}`,
      detail: `15 Physicochemical parameters normalized`,
      color: 'var(--primary)'
    },
    {
      id: 2,
      name: 'Supervised ML Classifier',
      icon: Cpu,
      status: prediction.class_name ? 'CLASSIFIED' : 'PENDING',
      value: `${prediction.class_name || 'Restricted Irrigation'} (${((prediction.confidence || 0.94) * 100).toFixed(1)}%)`,
      detail: 'XGBoost 4-class Gradient Boosted Trees',
      color: 'var(--info)'
    },
    {
      id: 3,
      name: 'Isolation Forest Anomaly Screen',
      icon: anomaly.is_anomaly ? AlertTriangle : CheckCircle2,
      status: anomaly.status || 'NORMAL',
      value: `Score: ${(anomaly.anomaly_score || 0.04).toFixed(4)}`,
      detail: anomaly.is_anomaly ? 'Outlier detected vs reference training manifold' : 'Within reference baseline manifold',
      color: anomaly.is_anomaly ? 'var(--danger)' : 'var(--success)'
    },
    {
      id: 4,
      name: 'Deterministic Safety Engine',
      icon: ShieldAlert,
      status: safety.status || 'SAFE_FOR_MODEL_REVIEW',
      value: safety.violations?.length ? `${safety.violations.length} Critical Violation(s)` : 'EPA / WHO Compliant',
      detail: safety.violations?.length ? safety.violations.join(', ') : 'No physical or microbial cutoff breaches',
      color: safety.violations?.length ? 'var(--danger)' : 'var(--success)'
    },
    {
      id: 5,
      name: 'Meteorological Context',
      icon: CloudRain,
      status: weather.status || 'LIVE',
      value: `${weather.rainfall_mm || 0.0} mm (${weather.action || 'ALLOW_ROUTE'})`,
      detail: weather.explanation || 'Precipitation check for runoff prevention',
      color: weather.rainfall_mm >= 5 ? 'var(--warning)' : 'var(--success)'
    },
    {
      id: 6,
      name: 'Biochemical Decay Kinetics',
      icon: Database,
      status: storage.status || 'FRESH',
      value: `DI: ${(storage.deterioration_index || 0.0).toFixed(2)} (${storage.action || 'ALLOW_ROUTE'})`,
      detail: storage.explanation || 'Arrhenius stagnation and shelf-life monitoring',
      color: storage.deterioration_index > 0.6 ? 'var(--warning)' : 'var(--success)'
    },
    {
      id: 7,
      name: 'Final Synthesized Routing',
      icon: CheckCircle2,
      status: routing.final_route || 'Restricted Irrigation',
      value: `Action: ${routing.final_action || 'ALLOW_ROUTE'}`,
      detail: routing.override_applied ? 'Deterministic rule override executed' : 'ML model recommendation confirmed',
      color: routing.override_applied ? 'var(--warning)' : 'var(--success)'
=======
      name: 'Telemetry Inflow',
      icon: Activity,
      status: 'RECEIVED',
      value: source || 'Bathroom',
      color: '#0F2942'
    },
    {
      id: 2,
      name: 'AI Prediction',
      icon: Cpu,
      status: 'CLASSIFIED',
      value: `${prediction.class_name || 'Restricted Irrigation'}`,
      color: '#1D4ED8'
    },
    {
      id: 3,
      name: 'Anomaly Screen',
      icon: anomaly.is_anomaly ? AlertTriangle : CheckCircle2,
      status: anomaly.status || 'NORMAL',
      value: `Score: ${(anomaly.anomaly_score || 0.04).toFixed(3)}`,
      color: anomaly.is_anomaly ? '#B91C1C' : '#15803D'
    },
    {
      id: 4,
      name: 'CPCB Safety Check',
      icon: ShieldAlert,
      status: safety.status || 'COMPLIANT',
      value: safety.violations?.length ? `${safety.violations.length} Violation(s)` : 'CPCB Compliant',
      color: safety.violations?.length ? '#B91C1C' : '#15803D'
    },
    {
      id: 5,
      name: 'Weather Check',
      icon: CloudRain,
      status: weather.action || 'ALLOW_ROUTE',
      value: `${weather.rainfall_mm || 0.0} mm Rain`,
      color: weather.rainfall_mm >= 5 ? '#D97706' : '#15803D'
    },
    {
      id: 6,
      name: 'Tank Kinetics',
      icon: Database,
      status: storage.status || 'FRESH',
      value: `DI: ${(storage.deterioration_index || 0.0).toFixed(2)}`,
      color: storage.deterioration_index > 0.6 ? '#D97706' : '#15803D'
    },
    {
      id: 7,
      name: 'Final Route',
      icon: CheckCircle2,
      status: routing.final_route || 'Restricted Irrigation',
      value: routing.final_action || 'ALLOW_ROUTE',
      color: routing.override_applied ? '#B91C1C' : '#15803D'
>>>>>>> myrepo/main
    }
  ];

  return (
<<<<<<< HEAD
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Arbitrated Decision Pipeline
            </h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
              7-Stage Multi-Context Verification
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Deterministic rule validation guarantees that contaminated or stagnant water is diverted before reuse.
          </p>
        </div>
        <StatusBadge label={routing.final_route || 'Restricted Irrigation'} size="lg" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
=======
    <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
            Automated 7-Stage Decision Pipeline
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
            Deterministic rule validation guarantees that contaminated water is diverted before reuse.
          </p>
        </div>
        <StatusBadge label={routing.final_route || 'Restricted Irrigation'} size="md" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
>>>>>>> myrepo/main
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              style={{
<<<<<<< HEAD
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
=======
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 12px',
>>>>>>> myrepo/main
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
<<<<<<< HEAD
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stage.color
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Step {stage.id}
                    </span>
                  </div>
                  <StatusBadge label={stage.status} />
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {stage.name}
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: stage.color, marginBottom: 4 }}>
                  {stage.value}
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginTop: 4, borderTop: '1px solid var(--border-color)', paddingTop: 6 }}>
                {stage.detail}
=======
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>
                  Step {stage.id}
                </span>
                <Icon size={14} style={{ color: stage.color }} />
              </div>

              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stage.name}
              </div>

              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: stage.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stage.value}
>>>>>>> myrepo/main
              </div>
            </div>
          );
        })}
      </div>

      {explanation.summary && (
        <div
          style={{
<<<<<<< HEAD
            marginTop: 18,
            padding: '12px 16px',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          <Lightbulb size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--primary)', marginRight: 4 }}>Pipeline Synthesis Rationale:</strong>
=======
            marginTop: 12,
            padding: '10px 14px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '4px',
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}
        >
          <ShieldCheck size={16} style={{ color: '#0F2942', flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: '#0F172A' }}>
            <strong style={{ color: '#0F2942', marginRight: 4 }}>Decision Trace:</strong>
>>>>>>> myrepo/main
            {explanation.summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPipelineVisualizer;
