import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, CloudRain, Database, Cpu, Activity, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const DecisionPipelineVisualizer = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <Activity size={24} style={{ color: '#94A3B8', marginBottom: 6, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Awaiting Pipeline Data</div>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Advance simulation step to trace real-time arbitration stages.</p>
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
    }
  ];

  return (
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
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
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
              </div>
            </div>
          );
        })}
      </div>

      {explanation.summary && (
        <div
          style={{
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
            {explanation.summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPipelineVisualizer;
