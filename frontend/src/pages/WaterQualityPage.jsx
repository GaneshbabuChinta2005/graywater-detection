import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Activity, ShieldCheck, HelpCircle } from 'lucide-react';
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
    { key: 'pH', label: 'pH Level', unit: 'pH', safeRange: '6.5 - 8.5', normal: 7.2 },
    { key: 'TEMP_C', label: 'Temperature', unit: '°C', safeRange: '15 - 35', normal: 24.5 },
    { key: 'TUR_NTU', label: 'Turbidity', unit: 'NTU', safeRange: '< 50.0', normal: 28.5 },
    { key: 'DS_mg_L', label: 'Dissolved Solids (DS)', unit: 'mg/L', safeRange: '< 500', normal: 255.0 },
    { key: 'TDS_mg_L', label: 'Total Dissolved Solids (TDS)', unit: 'mg/L', safeRange: '< 600', normal: 275.0 },
    { key: 'TSS_mg_L', label: 'Total Suspended Solids (TSS)', unit: 'mg/L', safeRange: '< 100', normal: 34.0 },
    { key: 'COND_uS_cm', label: 'Electrical Conductivity', unit: 'µS/cm', safeRange: '< 800', normal: 515.0 }
  ],
  chemical: [
    { key: 'DO_mg_L', label: 'Dissolved Oxygen (DO)', unit: 'mg/L', safeRange: '> 2.0', normal: 4.8 },
    { key: 'BOD_mg_L', label: 'Biological Oxygen Demand', unit: 'mg/L', safeRange: '< 50', normal: 28.0 },
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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            15 Physicochemical & Microbial Telemetry Parameters
          </h1>
          <p className="page-subtitle">
            Continuous multi-sensor telemetry benchmarked against EPA & WHO non-potable reuse safety thresholds. Click any metric to visualize historical telemetry.
          </p>
        </div>
      </div>

      {/* Physical Parameters Group */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
            A. Physical Parameters (Sediments, Solids & Electrochemistry)
          </h3>
          <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
            7 Parameters
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.physical.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            const isSelected = selectedParam === p.key;
            return (
              <div
                key={p.key}
                style={{
                  outline: isSelected ? '2px solid var(--primary)' : 'none',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <MetricCard
                  title={p.label}
                  value={val !== undefined ? `${val} ${p.unit}` : '--'}
                  subtitle={`Limit: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? 'var(--primary)' : '#94A3B8'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Chemical Parameters Group */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--info)' }}>
            B. Chemical Parameters (Organics, Nutrients & Salinity)
          </h3>
          <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
            7 Parameters
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.chemical.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            const isSelected = selectedParam === p.key;
            return (
              <div
                key={p.key}
                style={{
                  outline: isSelected ? '2px solid var(--info)' : 'none',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <MetricCard
                  key={p.key}
                  title={p.label}
                  value={val !== undefined ? `${val} ${p.unit}` : '--'}
                  subtitle={`Limit: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? 'var(--info)' : '#94A3B8'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Microbiological Parameters Group */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--danger)' }}>
            C. Microbiological Parameters (Pathogen Load)
          </h3>
          <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
            1 Parameter
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {PARAM_GROUPS.microbiological.map(p => {
            const val = latestTelemetry ? latestTelemetry[p.key] : p.normal;
            const status = getStatus(p.key, val);
            const isSelected = selectedParam === p.key;
            return (
              <div
                key={p.key}
                style={{
                  outline: isSelected ? '2px solid var(--danger)' : 'none',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <MetricCard
                  key={p.key}
                  title={p.label}
                  value={val !== undefined ? `${Number(val).toLocaleString()} ${p.unit}` : '--'}
                  subtitle={`Threshold: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? 'var(--danger)' : '#94A3B8'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Trend Chart for Selected Parameter */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Telemetry Trend: <span style={{ color: 'var(--primary)' }}>{selectedParam}</span>
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Temporal progression across active simulation steps. Click any card above to focus.
            </p>
          </div>
          <StatusBadge label={`FOCUS: ${selectedParam}`} />
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#94A3B8"
                tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
                  fontSize: 12
                }}
              />
              <Line type="monotone" dataKey={selectedParam} stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3, fill: '#0F766E' }} name={selectedParam} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPage;
