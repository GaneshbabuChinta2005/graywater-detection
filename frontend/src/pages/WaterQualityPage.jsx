import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const PARAM_GROUPS = {
  physical: [
    { key: 'pH', label: 'pH (Acidity/Alkalinity)', unit: '', safeRange: '6.5 - 8.5', normal: 7.2 },
    { key: 'TEMP_C', label: 'Temperature', unit: '°C', safeRange: '15 - 35', normal: 24.5 },
    { key: 'TUR_NTU', label: 'Turbidity', unit: 'NTU', safeRange: '< 50.0', normal: 28.5 },
    { key: 'DS_mg_L', label: 'Dissolved Solids (DS)', unit: 'mg/L', safeRange: '< 500', normal: 255.0 },
    { key: 'TDS_mg_L', label: 'Total Dissolved Solids (TDS)', unit: 'mg/L', safeRange: '< 600', normal: 275.0 },
    { key: 'TSS_mg_L', label: 'Total Suspended Solids (TSS)', unit: 'mg/L', safeRange: '< 100', normal: 34.0 },
    { key: 'COND_uS_cm', label: 'Electrical Conductivity', unit: 'µS/cm', safeRange: '< 800', normal: 515.0 }
  ],
  chemical: [
    { key: 'DO_mg_L', label: 'Dissolved Oxygen (DO)', unit: 'mg/L', safeRange: '> 2.0', normal: 4.8 },
    { key: 'BOD_mg_L', label: 'Biochemical Oxygen Demand', unit: 'mg/L', safeRange: '< 50', normal: 28.0 },
    { key: 'COD_mg_L', label: 'Chemical Oxygen Demand', unit: 'mg/L', safeRange: '< 150', normal: 82.0 },
    { key: 'NH4F_mg_L', label: 'Ammonium Fluoride', unit: 'mg/L', safeRange: '< 10.0', normal: 4.2 },
    { key: 'NO3_mg_L', label: 'Nitrate (NO3)', unit: 'mg/L', safeRange: '< 10.0', normal: 4.5 },
    { key: 'K_mg_L', label: 'Potassium (K)', unit: 'mg/L', safeRange: '< 30.0', normal: 15.8 },
    { key: 'SAL_ppt', label: 'Salinity', unit: 'ppt', safeRange: '< 0.5', normal: 0.22 }
  ],
  microbiological: [
    { key: 'E_coli_CFU_100mL', label: 'E. coli Pathogen Count', unit: 'CFU/100mL', safeRange: '< 200 (Indoor) / < 10,000 (Irrigation)', normal: 1500 }
  ]
};

export const WaterQualityPage = () => {
  const { latestTelemetry, telemetryTrends } = useSystem();
  const [selectedParam, setSelectedParam] = useState('TUR_NTU');

  const getStatus = (key, val) => {
    if (val === undefined || val === null) return 'UNKNOWN';
    if (key === 'pH') return val >= 6.5 && val <= 8.5 ? 'NORMAL' : 'REVIEW';
    if (key === 'TUR_NTU') return val < 50 ? 'NORMAL' : val < 100 ? 'ELEVATED' : 'CRITICAL';
    if (key === 'COD_mg_L') return val < 150 ? 'NORMAL' : val < 300 ? 'ELEVATED' : 'CRITICAL';
    if (key === 'E_coli_CFU_100mL') return val < 1000 ? 'NORMAL' : val < 10000 ? 'ELEVATED' : 'CRITICAL';
    return 'NORMAL';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          15 Physicochemical & Biological Water Quality Parameters
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Comprehensive multi-sensor telemetry aligned with EPA & WHO non-potable reuse safety thresholds.
        </p>
      </div>

      {/* Physical Parameters Group */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginBottom: 14 }}>
          A. Physical Parameters (Sediments, Solids & Electrochemistry)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.physical.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            return (
              <MetricCard
                key={p.key}
                title={p.label}
                value={val !== undefined ? `${val} ${p.unit}` : '--'}
                subtitle={`Safe Range: ${p.safeRange}`}
                badge={<StatusBadge label={status} />}
                onClick={() => setSelectedParam(p.key)}
                accentColor={selectedParam === p.key ? 'var(--cyan-400)' : 'rgba(255,255,255,0.1)'}
              />
            );
          })}
        </div>
      </div>

      {/* Chemical Parameters Group */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a78bfa', marginBottom: 14 }}>
          B. Chemical Parameters (Organics, Nutrients & Salinity)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.chemical.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            return (
              <MetricCard
                key={p.key}
                title={p.label}
                value={val !== undefined ? `${val} ${p.unit}` : '--'}
                subtitle={`Safe Range: ${p.safeRange}`}
                badge={<StatusBadge label={status} />}
                onClick={() => setSelectedParam(p.key)}
                accentColor={selectedParam === p.key ? '#a78bfa' : 'rgba(255,255,255,0.1)'}
              />
            );
          })}
        </div>
      </div>

      {/* Microbiological Parameters Group */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171', marginBottom: 14 }}>
          C. Microbiological Parameters (Pathogen Load)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.microbiological.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            return (
              <MetricCard
                key={p.key}
                title={p.label}
                value={val !== undefined ? `${Number(val).toLocaleString()} ${p.unit}` : '--'}
                subtitle={`Threshold: ${p.safeRange}`}
                badge={<StatusBadge label={status} />}
                onClick={() => setSelectedParam(p.key)}
                accentColor={selectedParam === p.key ? '#f87171' : 'rgba(255,255,255,0.1)'}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Trend Chart for Selected Parameter */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Parameter Trend: <span style={{ color: 'var(--cyan-400)' }}>{selectedParam}</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Click any metric card above to plot its temporal progression over the simulation run.
            </p>
          </div>
          <StatusBadge label={selectedParam} />
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" stroke="#64748b" tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')} />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey={selectedParam} stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} name={selectedParam} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPage;
