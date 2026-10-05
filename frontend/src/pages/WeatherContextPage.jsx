import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { CloudRain, CloudSun, Droplet, Thermometer, ShieldAlert } from 'lucide-react';

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
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Meteorological Weather Context & Smart Irrigation Arbitration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Prevents dangerous surface runoff and soil waterlogging by deferring outdoor reuse during precipitation events.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Weather Condition"
          value={summary?.weatherCondition || 'Clear Skies'}
          subtitle={`Status: ${weather.status}`}
          icon={CloudSun}
          accentColor="#f59e0b"
          badge={<StatusBadge label={weather.status} />}
        />

        <MetricCard
          title="Current Rainfall Rate"
          value={`${weather.rainfall_mm.toFixed(1)} mm`}
          subtitle="Precipitation accumulation"
          icon={CloudRain}
          accentColor={isRainy ? '#fbbf24' : '#06b6d4'}
          badge={<StatusBadge label={isRainy ? 'RAIN ACTIVE' : 'DRY'} />}
        />

        <MetricCard
          title="Precipitation Probability"
          value={`${weather.precipitation_probability.toFixed(0)}%`}
          subtitle="Likelihood of rainfall in next 6h"
          icon={Droplet}
          accentColor="#3b82f6"
        />

        <MetricCard
          title="Irrigation Policy Decision"
          value={weather.action}
          subtitle={isRainy ? 'Irrigation deferred due to rain' : 'Safe for landscape irrigation'}
          icon={ShieldAlert}
          accentColor={weather.action === 'ALLOW_ROUTE' ? '#10b981' : '#f59e0b'}
          badge={<StatusBadge label={weather.action} size="lg" />}
        />
      </div>

      {/* Environmental Runoff Arbitration Details */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Regulatory Environmental Runoff Prevention Rules
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Under EPA Guidelines for Water Reuse, reclaimed greywater cannot be sprayed on saturated soil during or immediately following heavy rain.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: 4 }}>
              ALLOW_ROUTE
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Rainfall &lt; 5.0 mm. Soil has adequate capillary absorption capacity. Proceed with landscape irrigation.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>
              DEFER_ROUTE / STORE_FOR_LATER
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Rainfall &gt;= 5.0 mm. Outdoor distribution is temporarily diverted into the storage tank until ground dries.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
              REVIEW_REQUIRED
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Meteorological service offline or conflicting sensor telemetry. Flags automated supervisory alert.
            </p>
          </div>
        </div>

        {weather.explanation && (
          <div
            style={{
              marginTop: 20,
              padding: '14px 18px',
              borderRadius: 10,
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.86rem',
              color: '#e2e8f0'
            }}
          >
            <strong>Context Status:</strong> {weather.explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherContextPage;
