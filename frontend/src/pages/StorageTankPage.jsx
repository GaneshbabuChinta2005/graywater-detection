import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Database, Clock, Thermometer, Layers, AlertCircle } from 'lucide-react';

export const StorageTankPage = () => {
  const { summary, latestAnalysis } = useSystem();

  const storage = latestAnalysis?.storage || {
    status: summary?.storageStatus || 'FRESH',
    deterioration_index: 0.04,
    stagnation_status: 'NORMAL',
    storage_age_hours: summary?.storageAgeHours || 0.0,
    action: 'CONTINUE_MONITORING',
    explanation: 'Storage telemetry shows safe dissolved oxygen levels and no septic deterioration.'
  };

  const currentLevel = summary?.tankLevelLiters || 250.0;
  const capacity = summary?.tankCapacityLiters || 1000.0;
  const fillPct = summary?.fillPercentage || 25.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Physical Storage Tank & Biochemical Decay Kinetics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Continuous dynamic monitoring of greywater storage age, temperature, stagnation kinetics, and remaining shelf life.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Current Tank Water Volume"
          value={`${currentLevel.toFixed(1)} L`}
          subtitle={`Fill Capacity: ${fillPct}%`}
          icon={Database}
          accentColor="#06b6d4"
          badge={<StatusBadge label={`${fillPct}% FULL`} />}
        />

        <MetricCard
          title="Maximum Storage Capacity"
          value={`${capacity.toFixed(0)} L`}
          subtitle="Physical non-overflow limit"
          icon={Layers}
          accentColor="#3b82f6"
        />

        <MetricCard
          title="Storage Residence Age"
          value={`${storage.storage_age_hours.toFixed(1)} hrs`}
          subtitle="Time elapsed since filling"
          icon={Clock}
          accentColor="#8b5cf6"
          badge={<StatusBadge label={storage.storage_age_hours < 24 ? 'FRESH' : 'AGED'} />}
        />

        <MetricCard
          title="Deterioration Index (DI)"
          value={storage.deterioration_index.toFixed(2)}
          subtitle="Biochemical decay index [0 - 1]"
          icon={AlertCircle}
          accentColor={storage.deterioration_index < 0.5 ? '#10b981' : '#f59e0b'}
          badge={<StatusBadge label={storage.status} />}
        />
      </div>

      {/* Visual Tank Gauge and Kinetic Decomposition */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Visual Tank Gauge Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Physical Storage Level Gauge
          </h3>

          <div
            style={{
              width: 140,
              height: 220,
              border: '3px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(15, 23, 42, 0.8)',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}
          >
            {/* Water Fill Bar with Wave Gradient */}
            <div
              style={{
                width: '100%',
                height: `${Math.min(100, Math.max(0, fillPct))}%`,
                background: 'linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            {/* Overlay Percentage */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              {fillPct}%
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <strong>{currentLevel.toFixed(1)} L</strong> / {capacity} L
          </div>
        </div>

        {/* Deterioration & Kinetic Monitoring */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Biochemical Kinetic Degradation & Stagnation State
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Greywater held for extended periods undergoes dissolved oxygen depletion, anaerobic digestion, and odor emergence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stagnation Status:</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                {storage.stagnation_status}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended Action:</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                {storage.action}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 10,
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.85rem',
              color: '#e2e8f0',
              lineHeight: 1.5
            }}
          >
            <strong>Storage Kinetic Assessment:</strong>{' '}
            {storage.explanation || 'Normal kinetic condition. Stored volume remains compliant for landscape irrigation.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTankPage;
