import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Database, Clock, Thermometer, Layers, AlertCircle, Info, Activity } from 'lucide-react';

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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Storage Tank Capacity & Biochemical Decay Kinetics
          </h1>
          <p className="page-subtitle">
            Real-time mass-balance level tracking, Arrhenius degradation kinetics, and stagnation risk monitoring for safe retention and discharge.
          </p>
        </div>
        <StatusBadge label={`TANK: ${storage.status}`} size="lg" />
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Current Tank Water Volume"
          value={`${currentLevel.toFixed(1)} L`}
          subtitle={`Fill Level: ${fillPct.toFixed(1)}%`}
          icon={Database}
          accentColor="var(--primary)"
          badge={<StatusBadge label={`${fillPct.toFixed(0)}% FULL`} />}
        />

        <MetricCard
          title="Available Capacity"
          value={`${availableLiters.toFixed(1)} L`}
          subtitle={`Max Non-Overflow: ${capacity.toFixed(0)} L`}
          icon={Layers}
          accentColor="var(--info)"
        />

        <MetricCard
          title="Storage Residence Age"
          value={`${storage.storage_age_hours.toFixed(1)} hrs`}
          subtitle="Elapsed duration in tank"
          icon={Clock}
          accentColor="var(--purple)"
          badge={<StatusBadge label={storage.storage_age_hours < 24 ? 'FRESH' : 'AGED'} />}
        />

        <MetricCard
          title="Deterioration Index (DI)"
          value={storage.deterioration_index.toFixed(2)}
          subtitle="Model estimate [0.0 - 1.0]"
          icon={AlertCircle}
          accentColor={storage.deterioration_index < 0.5 ? 'var(--success)' : 'var(--warning)'}
          badge={<StatusBadge label={storage.status} />}
        />
      </div>

      {/* Visual Tank Gauge and Kinetic Decomposition */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Visual Tank Gauge Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '100%', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Physical Storage Level Gauge
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Calibrated volumetric capacity representation.
            </p>
          </div>

          <div
            style={{
              width: 160,
              height: 240,
              border: '2px solid #CBD5E1',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column-reverse',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
            }}
          >
            {/* Height Tick Lines */}
            {[75, 50, 25].map(pct => (
              <div
                key={pct}
                style={{
                  position: 'absolute',
                  bottom: `${pct}%`,
                  left: 0,
                  right: 0,
                  borderTop: '1px dashed #94A3B8',
                  zIndex: 2,
                  pointerEvents: 'none',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingRight: 6
                }}
              >
                <span style={{ fontSize: '0.65rem', color: '#64748B', backgroundColor: 'rgba(255,255,255,0.7)', padding: '0 2px' }}>
                  {pct}%
                </span>
              </div>
            ))}

            {/* Water Fill Bar with Clean Teal Gradient */}
            <div
              style={{
                width: '100%',
                height: `${Math.min(100, Math.max(0, fillPct))}%`,
                background: 'linear-gradient(180deg, #14B8A6 0%, #0F766E 100%)',
                transition: 'height var(--transition-normal)'
              }}
            />

            {/* Percentage Display */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: fillPct > 50 ? '#FFFFFF' : 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                zIndex: 5
              }}
            >
              {fillPct.toFixed(0)}%
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentLevel.toFixed(1)} L <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {capacity.toFixed(0)} L</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Available headroom: <strong>{availableLiters.toFixed(1)} L</strong>
            </div>
          </div>
        </div>

        {/* Deterioration & Kinetic Monitoring */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Biochemical Kinetic Degradation & Stagnation State
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Greywater retained past maximum residence threshold undergoes dissolved oxygen depletion, anaerobic conversion, and severe odor emergence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Stagnation Status
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  {storage.stagnation_status}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  System Advisory Action
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                  {storage.action}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start'
            }}
          >
            <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--primary)' }}>Estimated Decay Kinetic Assessment:</strong>{' '}
              {storage.explanation || 'Normal kinetic condition. Stored volume remains compliant for landscape irrigation.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTankPage;
