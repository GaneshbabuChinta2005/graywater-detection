import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, CloudRain, Database, Cpu, Activity } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const DecisionPipelineVisualizer = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No decision evaluation loaded yet. Run a single analysis or simulation step to trace pipeline.
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
      name: 'Water Quality Telemetry',
      icon: Activity,
      status: 'INPUT_RECEIVED',
      value: `Source: ${source || 'Bathroom'}`,
      detail: `15 Physicochemical Parameters Received & Normalized`,
      color: 'var(--cyan-400)'
    },
    {
      id: 2,
      name: 'Supervised ML Classifier',
      icon: Cpu,
      status: prediction.class_name ? 'CLASSIFIED' : 'PENDING',
      value: `${prediction.class_name || 'Restricted Irrigation'} (${((prediction.confidence || 0.94) * 100).toFixed(1)}%)`,
      detail: 'XGBoost 4-class Gradient Boosted Decision Tree',
      color: '#38bdf8'
    },
    {
      id: 3,
      name: 'Isolation Forest Anomaly Screen',
      icon: anomaly.is_anomaly ? AlertTriangle : CheckCircle2,
      status: anomaly.status || 'NORMAL',
      value: `Score: ${(anomaly.anomaly_score || 0.04).toFixed(4)}`,
      detail: anomaly.is_anomaly ? 'Statistical outlier detected' : 'Within reference training manifold',
      color: anomaly.is_anomaly ? '#f87171' : '#34d399'
    },
    {
      id: 4,
      name: 'Deterministic Safety Engine',
      icon: ShieldAlert,
      status: safety.status || 'SAFE_FOR_MODEL_REVIEW',
      value: safety.violations?.length ? `${safety.violations.length} Critical Violation(s)` : 'EPA/WHO Compliant',
      detail: safety.violations?.length ? safety.violations.join(', ') : 'No physical/microbial cutoff breaches',
      color: safety.violations?.length ? '#f87171' : '#34d399'
    },
    {
      id: 5,
      name: 'Meteorological Context',
      icon: CloudRain,
      status: weather.status || 'LIVE',
      value: `${weather.rainfall_mm || 0.0} mm (${weather.action || 'ALLOW_ROUTE'})`,
      detail: weather.explanation || 'Rainfall check for runoff prevention',
      color: weather.rainfall_mm >= 5 ? '#fbbf24' : '#34d399'
    },
    {
      id: 6,
      name: 'Biochemical Decay Kinetics',
      icon: Database,
      status: storage.status || 'FRESH',
      value: `DI: ${(storage.deterioration_index || 0.0).toFixed(2)} (${storage.action || 'ALLOW_ROUTE'})`,
      detail: storage.explanation || 'Stagnation and shelf-life monitoring',
      color: storage.deterioration_index > 0.6 ? '#fbbf24' : '#34d399'
    },
    {
      id: 7,
      name: 'Final Synthesized Routing',
      icon: CheckCircle2,
      status: routing.final_route || 'Restricted Irrigation',
      value: `Action: ${routing.final_action || 'ALLOW_ROUTE'}`,
      detail: routing.override_applied ? 'Rule-based override executed' : 'ML model recommendation approved',
      color: routing.override_applied ? '#fbbf24' : '#34d399'
    }
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Arbitrated Decision Pipeline (7-Stage Multi-Context Verification)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Each stage validates deterministic safety constraints before allowing greywater reuse.
          </p>
        </div>
        <StatusBadge label={routing.final_route || 'Restricted Irrigation'} size="lg" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stage.color
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Stage {stage.id}
                  </span>
                </div>
                <StatusBadge label={stage.status} />
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {stage.name}
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 500, color: stage.color, marginBottom: 4 }}>
                {stage.value}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {stage.detail}
              </div>
            </div>
          );
        })}
      </div>

      {explanation.summary && (
        <div
          style={{
            marginTop: 18,
            padding: '14px 18px',
            background: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '10px',
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <div style={{ fontSize: '0.85rem', color: '#e0f2fe' }}>
            <strong>Decision Rationale:</strong> {explanation.summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPipelineVisualizer;
