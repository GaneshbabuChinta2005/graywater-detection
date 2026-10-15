import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { CloudRain, CloudSun, Droplet, Thermometer, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';

export const WeatherContextPage = () => {
  const { summary, latestAnalysis } = useSystem();

  const weather = latestAnalysis?.weather || {
    status: summary?.weatherStatus || 'LIVE',
    rainfall_mm: summary?.rainfallMm || 0.0,
    precipitation_probability: 10.0,
    action: summary?.irrigationAction || 'ALLOW_ROUTE',
    explanation: 'No precipitation forecast. Soil infiltration capacity optimal for landscape irrigation.'
  };

  const isRainy = weather.rainfall_mm >= 5.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Meteorological Weather Context & Smart Irrigation Arbitration
          </h1>
          <p className="page-subtitle">
            Dynamic integration with Open-Meteo precipitation models. Automatically suppresses outdoor reuse during rainfall to eliminate hazardous surface runoff and soil waterlogging.
          </p>
        </div>
        <StatusBadge label={`POLICY: ${weather.action}`} size="lg" />
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Weather Condition"
          value={summary?.weatherCondition || 'Clear Skies'}
          subtitle={`Telemetry Feed: ${weather.status}`}
          icon={CloudSun}
          accentColor="var(--warning)"
          badge={<StatusBadge label={weather.status} />}
        />

        <MetricCard
          title="Current Rainfall Rate"
          value={`${weather.rainfall_mm.toFixed(1)} mm`}
          subtitle="Precipitation accumulation"
          icon={CloudRain}
          accentColor={isRainy ? 'var(--warning)' : 'var(--primary)'}
          badge={<StatusBadge label={isRainy ? 'RAIN DETECTED' : 'DRY WEATHER'} />}
        />

        <MetricCard
          title="Precipitation Probability"
          value={`${weather.precipitation_probability.toFixed(0)}%`}
          subtitle="Rain probability in 6h window"
          icon={Droplet}
          accentColor="var(--info)"
        />

        <MetricCard
          title="Irrigation Policy Decision"
          value={weather.action}
          subtitle={isRainy ? 'Deferred due to runoff risk' : 'Approved for landscape irrigation'}
          icon={ShieldAlert}
          accentColor={weather.action === 'ALLOW_ROUTE' ? 'var(--success)' : 'var(--warning)'}
          badge={<StatusBadge label={weather.action} size="lg" />}
        />
      </div>

      {/* Environmental Runoff Arbitration Details */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Regulatory Environmental Runoff Prevention Interlocks
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            EPA non-potable reuse guidelines prohibit spraying reclaimed water onto saturated or rain-drenched soils.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Outcome 1: ALLOW_ROUTE */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action === 'ALLOW_ROUTE' ? 'var(--success-bg)' : '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: weather.action === 'ALLOW_ROUTE' ? '2px solid var(--success-border)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                  ALLOW_ROUTE
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Rainfall &lt; 5.0 mm. Soil maintains high capillary absorption. Outdoor drip and landscape irrigation are safely enabled.
              </p>
            </div>
          </div>

          {/* Outcome 2: DEFER_ROUTE */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action.includes('DEFER') || weather.action.includes('STORE') ? 'var(--warning-bg)' : '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: weather.action.includes('DEFER') || weather.action.includes('STORE') ? '2px solid var(--warning-border)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Clock size={16} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)' }}>
                  DEFER_ROUTE / STORE_FOR_LATER
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Rainfall &ge; 5.0 mm. Outdoor distribution is paused; water is buffered in the retention tank until soil infiltration capacity recovers.
              </p>
            </div>
          </div>

          {/* Outcome 3: REVIEW_REQUIRED */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action.includes('REVIEW') ? 'var(--danger-bg)' : '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: weather.action.includes('REVIEW') ? '2px solid var(--danger-border)' : '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>
                  REVIEW_REQUIRED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Meteorological service unreachable or conflicting sensor telemetry. Prompts automated supervisor alert.
              </p>
            </div>
          </div>
        </div>

        {weather.explanation && (
          <div
            style={{
              marginTop: 20,
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              display: 'flex',
              gap: 10,
              alignItems: 'center'
            }}
          >
            <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--primary)' }}>Weather Context Verification:</strong> {weather.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherContextPage;
