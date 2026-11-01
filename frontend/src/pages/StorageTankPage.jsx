import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Database, Clock, Thermometer, Layers, AlertCircle, Info, Activity, ShieldCheck } from 'lucide-react';

export const StorageTankPage = () => {
  const { summary, latestAnalysis } = useSystem();

  const storage = latestAnalysis?.storage || {
    status: summary?.storageStatus || 'FRESH',
    deterioration_index: 0.04,
    stagnation_status: 'NORMAL',
    storage_age_hours: summary?.storageAgeHours || 0.0,
    action: 'CONTINUE_MONITORING',
    explanation: 'Storage telemetry demonstrates stable dissolved oxygen saturation and zero anaerobic decomposition signs.'
  };

  const currentLevel = summary?.tankLevelLiters || 250.0;
  const capacity = summary?.tankCapacityLiters || 1000.0;
  const fillPct = summary?.fillPercentage || 25.0;
  const availableLiters = Math.max(0, capacity - currentLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Storage Tank Capacity & Biochemical Decay Kinetics
          </h1>
          <p className="page-subtitle">
            Real-time mass-balance level tracking, Arrhenius degradation kinetics, and anaerobic stagnation risk monitoring for safe retention and discharge.
          </p>
        </div>
        <StatusBadge label={`TANK: ${storage.status}`} size="lg" />
      </div>

      {/* ─── Primary KPI Grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Current Tank Water Volume"
          value={`${currentLevel.toFixed(1)} L`}
          subtitle={`Fill Level: ${fillPct.toFixed(1)}%`}
          icon={Database}
          accentColor="#0F2942"
          badge={<StatusBadge label={`${fillPct.toFixed(0)}% FULL`} />}
        />

        <MetricCard
          title="Available Capacity"
          value={`${availableLiters.toFixed(1)} L`}
          subtitle={`Max Non-Overflow: ${capacity.toFixed(0)} L`}
          icon={Layers}
          accentColor="#1D4ED8"
        />

        <MetricCard
          title="Storage Residence Age"
          value={`${storage.storage_age_hours.toFixed(1)} hrs`}
          subtitle="Elapsed duration in tank"
          icon={Clock}
          accentColor="#4338CA"
          badge={<StatusBadge label={storage.storage_age_hours < 24 ? 'FRESH' : 'DEFERRED - MONSOON'} />}
        />

        <MetricCard
          title="Deterioration Index (DI)"
          value={storage.deterioration_index.toFixed(2)}
          subtitle="Model estimate [0.0 - 1.0]"
          icon={AlertCircle}
          accentColor={storage.deterioration_index < 0.5 ? '#15803D' : '#D97706'}
          badge={<StatusBadge label={storage.deterioration_index < 0.5 ? 'COMPLIANT' : 'DEFERRED - MONSOON'} />}
        />
      </div>

      {/* ─── Visual Tank Gauge and Kinetic Decomposition ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Visual Tank Gauge Card */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '100%', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Physical Storage Level Calibrated Gauge
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
              Volumetric hydro-static mass representation.
            </p>
          </div>

          <div
            style={{
              width: 170,
              height: 250,
              border: '2px solid #CBD5E1',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}
          >
            {/* Water Column with subtle blue gradient */}
            <div
              style={{
                width: '100%',
                height: `${Math.min(100, Math.max(5, fillPct))}%`,
                backgroundColor: '#1E3A8A',
                opacity: 0.85,
                transition: 'height 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}
            >
              {fillPct.toFixed(0)}%
            </div>

            {/* Calibration lines */}
            <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, borderTop: '1px dashed #94A3B8', paddingLeft: 6, fontSize: '0.65rem', color: '#64748B' }}>750L (75%)</div>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #94A3B8', paddingLeft: 6, fontSize: '0.65rem', color: '#64748B' }}>500L (50%)</div>
            <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, borderTop: '1px dashed #94A3B8', paddingLeft: 6, fontSize: '0.65rem', color: '#64748B' }}>250L (25%)</div>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
            <span>Reserve Available: <strong>{availableLiters.toFixed(1)} L</strong></span>
            <span>Total Tank Head: <strong>{capacity.toFixed(0)} L</strong></span>
          </div>
        </div>

        {/* Biochemical Kinetics & Microbial Shelf-Life Card */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Thermometer size={18} style={{ color: '#0F2942' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Arrhenius Microbial Decomposition Kinetics
              </h3>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              Dissolved organic matter in stored greywater undergoes anaerobic degradation as dissolved oxygen depletes. The deterioration index (DI) estimates shelf-life viability:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Fresh Storage Window (&lt;24 hrs)</span>
                  <StatusBadge label="COMPLIANT" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Aerobic conditions maintained. Approved for non-contact irrigation & toilet flushing.
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Intermediate Aging (24 - 48 hrs)</span>
                  <StatusBadge label="DEFERRED - MONSOON" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  DO decreases below 2.0 mg/L. Aeration cycles recommended before release.
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Stagnant / Septic (&gt;48 hrs)</span>
                  <StatusBadge label="VIOLATION - SEWER OVERRIDE" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Odor generation and anaerobic pathogen surge. Mandatory sewer purge commanded.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#0F172A',
              lineHeight: 1.45
            }}
          >
            <strong style={{ color: '#0F2942', marginRight: 4 }}>Kinetic Evaluation Rationale:</strong>
            {storage.explanation}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTankPage;
