import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useChartTheme } from '../hooks/useChartTheme';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Activity, ShieldCheck, HelpCircle, Droplet, CheckCircle2 } from 'lucide-react';
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
  const ct = useChartTheme();
  const [selectedParam, setSelectedParam] = useState('TUR_NTU');

  const getStatus = (key, val) => {
    if (val === undefined || val === null) return 'UNKNOWN';
    if (key === 'pH') return val >= 6.5 && val <= 8.5 ? 'COMPLIANT' : 'DEFERRED - MONSOON';
    if (key === 'TUR_NTU') return val < 50 ? 'COMPLIANT' : val < 100 ? 'DEFERRED - MONSOON' : 'VIOLATION - SEWER OVERRIDE';
    if (key === 'COD_mg_L') return val < 150 ? 'COMPLIANT' : val < 250 ? 'DEFERRED - MONSOON' : 'VIOLATION - SEWER OVERRIDE';
    if (key === 'E_coli_CFU_100mL') return val < 1000 ? 'COMPLIANT' : val < 10000 ? 'DEFERRED - MONSOON' : 'VIOLATION - SEWER OVERRIDE';
    return 'COMPLIANT';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            15 Physicochemical & Microbial Telemetry Parameters
          </h1>
          <p className="page-subtitle">
            Continuous multi-sensor telemetry benchmarked against CPCB Schedule VI & EPA non-potable reuse safety thresholds. Click any metric card below to focus the statutory trend analysis.
          </p>
        </div>
      </div>

      {/* ─── Physical Parameters Group ────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942' }}>
            A. Physical Parameters (Sediments, Solids & Electrochemistry)
          </h3>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#EFF6FF', color: '#0F2942', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
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
                  outline: isSelected ? '2px solid #0F2942' : 'none',
                  borderRadius: '8px'
                }}
              >
                <MetricCard
                  title={p.label}
                  value={val !== undefined ? `${val} ${p.unit}` : '--'}
                  subtitle={`Statutory Limit: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? '#0F2942' : '#CBD5E1'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Chemical Parameters Group ────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1D4ED8' }}>
            B. Chemical Parameters (Organics, Nutrients & Salinity)
          </h3>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
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
                  outline: isSelected ? '2px solid #1D4ED8' : 'none',
                  borderRadius: '8px'
                }}
              >
                <MetricCard
                  key={p.key}
                  title={p.label}
                  value={val !== undefined ? `${val} ${p.unit}` : '--'}
                  subtitle={`Statutory Limit: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? '#1D4ED8' : '#CBD5E1'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Microbiological Parameters Group ─────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#B91C1C' }}>
            C. Microbiological Parameters (Pathogen Density)
          </h3>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
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
                  outline: isSelected ? '2px solid #B91C1C' : 'none',
                  borderRadius: '8px'
                }}
              >
                <MetricCard
                  key={p.key}
                  title={p.label}
                  value={val !== undefined ? `${Number(val).toLocaleString()} ${p.unit}` : '--'}
                  subtitle={`Threshold: ${p.safeRange}`}
                  badge={<StatusBadge label={status} />}
                  onClick={() => setSelectedParam(p.key)}
                  accentColor={isSelected ? '#B91C1C' : '#CBD5E1'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Interactive Trend Chart for Selected Parameter ────────────────── */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Historical Statutory Telemetry Trend: <span style={{ color: '#0F2942' }}>{selectedParam}</span>
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
              Temporal progression across active monitoring steps. Click any parameter card above to focus.
            </p>
          </div>
          <StatusBadge label={`FOCUS: ${selectedParam}`} />
        </div>

        <div style={{ width: '100%', height: 280, backgroundColor: '#FFFFFF' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke={ct.axisStroke}
                tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')}
                tick={{ fontSize: 11, fill: ct.tickFill }}
              />
              <YAxis stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                  fontSize: 12,
                  color: '#0F172A'
                }}
              />
              <Line type="monotone" dataKey={selectedParam} stroke="#0F2942" strokeWidth={2.5} dot={{ r: 3, fill: '#0F2942' }} name={selectedParam} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPage;
