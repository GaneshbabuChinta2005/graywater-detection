import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { CloudRain, CloudSun, Droplet, Thermometer, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

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
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Meteorological Weather Context & Statutory Irrigation Runoff Arbitration
          </h1>
          <p className="page-subtitle">
            Dynamic integration with Open-Meteo precipitation models. Automatically suppresses outdoor effluent dispersion during monsoon or rainfall events to eliminate hazardous surface runoff and soil waterlogging.
          </p>
        </div>
        <StatusBadge label={`POLICY: ${weather.action}`} size="lg" />
      </div>

      {/* ─── Primary KPI Grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Atmospheric Condition"
          value={summary?.weatherCondition || 'Clear Skies'}
          subtitle={`Telemetry Feed: ${weather.status}`}
          icon={CloudSun}
          accentColor="#0F2942"
          badge={<StatusBadge label={weather.status} />}
        />

        <MetricCard
          title="Current Rainfall Rate"
          value={`${weather.rainfall_mm.toFixed(1)} mm`}
          subtitle="Precipitation accumulation"
          icon={CloudRain}
          accentColor={isRainy ? '#D97706' : '#0F2942'}
          badge={<StatusBadge label={isRainy ? 'DEFERRED - MONSOON' : 'COMPLIANT'} />}
        />

        <MetricCard
          title="Precipitation Probability"
          value={`${weather.precipitation_probability.toFixed(0)}%`}
          subtitle="Rain probability in 6h window"
          icon={Droplet}
          accentColor="#1D4ED8"
        />

        <MetricCard
          title="Irrigation Policy Directive"
          value={weather.action}
          subtitle={isRainy ? 'Deferred due to runoff risk' : 'Approved for landscape irrigation'}
          icon={ShieldAlert}
          accentColor={weather.action === 'ALLOW_ROUTE' ? '#15803D' : '#D97706'}
          badge={<StatusBadge label={isRainy ? 'DEFERRED - MONSOON' : 'PERMITTED REUSE'} size="lg" />}
        />
      </div>

      {/* ─── Environmental Runoff Prevention Interlocks ──────────────────── */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
            Regulatory Environmental Runoff Prevention Interlocks
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
            CPCB / EPA non-potable reuse guidelines prohibit spraying reclaimed water onto saturated or rain-drenched soils.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Outcome 1: ALLOW_ROUTE */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action === 'ALLOW_ROUTE' ? '#F0FDF4' : '#F8FAFC',
              borderRadius: '6px',
              border: weather.action === 'ALLOW_ROUTE' ? '2px solid #BBF7D0' : '1px solid #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CheckCircle2 size={16} style={{ color: '#15803D' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803D' }}>
                  ALLOW_ROUTE (Permitted)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Rainfall &lt; 5.0 mm. Soil maintains high capillary absorption capacity. Outdoor drip and landscape irrigation are safely enabled.
              </p>
            </div>
          </div>

          {/* Outcome 2: DEFER_ROUTE */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action.includes('DEFER') || weather.action.includes('STORE') || isRainy ? '#FFFBEB' : '#F8FAFC',
              borderRadius: '6px',
              border: weather.action.includes('DEFER') || weather.action.includes('STORE') || isRainy ? '2px solid #FDE68A' : '1px solid #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Clock size={16} style={{ color: '#D97706' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#D97706' }}>
                  DEFER_ROUTE / STORE_FOR_LATER
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Rainfall &ge; 5.0 mm. Outdoor distribution is paused; effluent is buffered in the retention tank until soil infiltration capacity recovers.
              </p>
            </div>
          </div>

          {/* Outcome 3: REVIEW_REQUIRED */}
          <div
            style={{
              padding: '16px',
              backgroundColor: weather.action.includes('REVIEW') ? '#FEF2F2' : '#F8FAFC',
              borderRadius: '6px',
              border: weather.action.includes('REVIEW') ? '2px solid #FECACA' : '1px solid #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={16} style={{ color: '#B91C1C' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#B91C1C' }}>
                  REVIEW_REQUIRED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                Meteorological feed unreachable or conflicting telemetry. Prompts automated supervisor alert.
              </p>
            </div>
          </div>
        </div>

        {weather.explanation && (
          <div
            style={{
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '0.84rem',
              color: '#0F172A',
              lineHeight: 1.45,
              display: 'flex',
              gap: 10,
              alignItems: 'center'
            }}
          >
            <ShieldCheck size={18} style={{ color: '#0F2942', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#0F2942' }}>Statutory Weather Context Rationale:</strong> {weather.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherContextPage;
