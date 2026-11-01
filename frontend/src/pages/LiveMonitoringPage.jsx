import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Activity,
<<<<<<< HEAD
  AlertTriangle,
  Zap,
  Droplet,
  Layers,
  Thermometer,
  Gauge,
  FlaskConical,
  Radio
=======
  Droplet,
  Layers,
  Gauge,
  Zap,
  FlaskConical
>>>>>>> myrepo/main
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useChartTheme } from '../hooks/useChartTheme';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const SYNTHETIC_EVENTS = [
  { id: 'normal', name: 'Nominal Baseline', desc: 'Typical domestic greywater profile' },
  { id: 'high_turbidity', name: 'Sediment Shock', desc: 'Turbidity & TSS suspension spike' },
  { id: 'high_tds', name: 'Saline Shock', desc: 'TDS & Salinity surge' },
  { id: 'high_organic_load', name: 'Kitchen Food Load', desc: 'Severe COD/BOD organic surge' },
<<<<<<< HEAD
  { id: 'abnormal_ph', name: 'Detergent Surge', desc: 'Extreme alkaline surge (pH 9.8)' },
  { id: 'microbial_spike', name: 'Cross-Contamination', desc: 'E. coli surge (850k CFU)' },
  { id: 'sensor_fault_stuck', name: 'Hardware Stuck Fault', desc: 'Turbidity sensor frozen at 75 NTU' },
  { id: 'sensor_fault_drift', name: 'Calibration Drift', desc: 'Progressive electrochemical pH sensor drift' }
=======
  { id: 'abnormal_ph', name: 'Detergent Surge', desc: 'Alkaline detergent spike (pH 9.8)' },
  { id: 'microbial_spike', name: 'Cross-Contamination', desc: 'E. coli pathogen surge' },
  { id: 'sensor_fault_stuck', name: 'Sensor Stuck Fault', desc: 'Turbidity sensor frozen at 75 NTU' },
  { id: 'sensor_fault_drift', name: 'Calibration Drift', desc: 'Electrochemical pH sensor drift' }
>>>>>>> myrepo/main
];

export const LiveMonitoringPage = () => {
  const {
    latestTelemetry,
    telemetryTrends,
    isSimulating,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    handleStepSimulation
  } = useSystem();

  const ct = useChartTheme();
  const [selectedSource, setSelectedSource] = useState('Bathroom');
  const [selectedEvent, setSelectedEvent] = useState('normal');

  const onStepClick = () => {
    handleStepSimulation({
      source: selectedSource,
      event_name: selectedEvent
    });
  };

<<<<<<< HEAD
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Simulation Banner Notice */}
      <div
        style={{
          backgroundColor: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: 'var(--radius-lg)',
=======
  const computeComplianceStatus = (item) => {
    const cod = item.COD_mg_L ?? 82.0;
    const tss = item.TSS_mg_L ?? 34.0;
    const tur = item.TUR_NTU ?? 28.5;
    const event = item.event_name || 'normal';

    if (cod > 250 || tss > 100 || event === 'high_organic_load' || event === 'microbial_spike') {
      return 'VIOLATION - SEWER OVERRIDE';
    }
    if (tur > 60 || event === 'abnormal_ph' || event === 'high_turbidity') {
      return 'DEFERRED - MONSOON';
    }
    if (item.greywater_source === 'Bathroom' && tur < 30) {
      return 'PERMITTED REUSE';
    }
    return 'COMPLIANT';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Simulation Runtime Banner ────────────────────────────────────── */}
      <div
        className="card"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderLeft: '4px solid #0F2942',
          borderRadius: '6px',
>>>>>>> myrepo/main
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
<<<<<<< HEAD
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: 'var(--warning)',
=======
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '6px',
              backgroundColor: '#F1F5F9',
              color: '#0F2942',
>>>>>>> myrepo/main
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
<<<<<<< HEAD
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--warning)' }}>
                DIGITAL TWIN SIMULATION ENVIRONMENT
              </h2>
              <StatusBadge label={isSimulating ? 'SIMULATION RUNNING' : 'STEP-BY-STEP READY'} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--warning)', marginTop: 2 }}>
              Telemetry streams are synthetic physical/chemical operational data derived from statistical profiles for virtual commissioning.
=======
            <FlaskConical size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Digital Twin Simulation Stream
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  backgroundColor: isSimulating ? '#F0FDF4' : '#F1F5F9',
                  color: isSimulating ? '#15803D' : '#64748B',
                  border: `1px solid ${isSimulating ? '#BBF7D0' : '#CBD5E1'}`
                }}
              >
                {isSimulating ? 'SIM ACTIVE' : 'IDLE'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Diurnal inflow rates, contaminant pulses, and CPCB valve actuation.
>>>>>>> myrepo/main
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* Live Controller Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={isSimulating ? 'btn-secondary' : 'btn-primary'}
            onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
          >
            {isSimulating ? <Pause size={15} /> : <Play size={15} />}
            {isSimulating ? 'Pause Loop' : 'Start Auto-Run'}
          </button>

          <button className="btn-secondary" onClick={onStepClick}>
            <StepForward size={15} /> Advance Step (+5m)
          </button>

          <button className="btn-secondary" onClick={handleResetSimulation}>
            <RotateCcw size={15} /> Reset
=======
        {/* Master Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={isSimulating ? 'btn-secondary' : 'btn-primary'}
            onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
          >
            {isSimulating ? <Pause size={13} /> : <Play size={13} />}
            <span>{isSimulating ? 'Pause Stream' : 'Run Continuous'}</span>
          </button>

          <button className="btn-secondary" onClick={onStepClick} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
            <StepForward size={13} /> <span>Step (+1 Cycle)</span>
          </button>

          <button className="btn-secondary" onClick={handleResetSimulation} style={{ padding: '7px 10px', fontSize: '0.8rem' }}>
            <RotateCcw size={13} />
>>>>>>> myrepo/main
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Interactive Controls & Controlled Shock Injection */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Telemetry Generation Parameters & Controlled Shock Injection
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Select source profile and trigger synthetic boundary conditions to verify real-time safety interlocks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Source Selector */}
          <div>
            <label className="form-label">
              Active Greywater Source:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {['Bathroom', 'Kitchen', 'Laundry', 'Mixed'].map(src => {
                const isSelected = selectedSource === src;
                return (
                  <button
                    key={src}
                    type="button"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => setSelectedSource(src)}
                  >
                    <Droplet size={14} style={{ opacity: isSelected ? 1 : 0.6 }} />
                    {src}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synthetic Event Injector */}
          <div>
            <label className="form-label">
              Synthetic Shock Load or Sensor Malfunction:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {SYNTHETIC_EVENTS.map(evt => {
=======
      {/* ─── Stream Source & Shock Profiles ────────────────────────────────── */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
          Stream Source & Shock Scenario Injection
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: 16, alignItems: 'start' }}>
          {/* Source Tabs */}
          <div>
            <label className="form-label">Effluent Source</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Bathroom', 'Kitchen', 'Laundry', 'Mixed'].map((src) => (
                <button
                  key={src}
                  type="button"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: selectedSource === src ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: selectedSource === src ? '2px solid #0F2942' : '1px solid #CBD5E1',
                    backgroundColor: selectedSource === src ? '#EFF6FF' : '#FFFFFF',
                    color: selectedSource === src ? '#0F2942' : '#334155'
                  }}
                  onClick={() => setSelectedSource(src)}
                >
                  {src} Stream
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios Grid */}
          <div>
            <label className="form-label">Shock Scenarios</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 6 }}>
              {SYNTHETIC_EVENTS.map((evt) => {
>>>>>>> myrepo/main
                const isSelected = selectedEvent === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    style={{
<<<<<<< HEAD
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => setSelectedEvent(evt.id)}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{evt.name}</span>
                    <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', marginTop: 2, lineHeight: 1.2 }}>
                      {evt.desc}
                    </span>
=======
                      padding: '8px 10px',
                      borderRadius: '4px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #0F2942' : '1px solid #CBD5E1',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? '#0F2942' : '#0F172A'
                    }}
                    onClick={() => setSelectedEvent(evt.id)}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{evt.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 1 }}>{evt.desc}</div>
>>>>>>> myrepo/main
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Live State Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Simulation Step"
          value={latestTelemetry?.step !== undefined ? `Step #${latestTelemetry.step}` : 'Step #0'}
          subtitle={`Virtual Time: ${latestTelemetry?.timestamp || '2026-10-03 06:00:00'}`}
          icon={Activity}
          accentColor="var(--primary)"
        />

        <MetricCard
          title="Inflow Volume Rate"
          value={`${latestTelemetry?.flow_rate_L_min || 14.5} L/min`}
          subtitle={`Source: ${latestTelemetry?.greywater_source || 'Bathroom'}`}
          icon={Gauge}
          accentColor="var(--info)"
        />

        <MetricCard
          title="Storage Tank Balance"
          value={`${latestTelemetry?.tank_level_L || 250.0} L`}
          subtitle={`Capacity: ${latestTelemetry?.tank_capacity_L || 1000} L`}
          icon={Layers}
          accentColor="var(--purple)"
        />

        <MetricCard
          title="Hardware Sensor Status"
          value={latestTelemetry?.sensor_status || 'OK'}
          subtitle={`Injected Profile: ${latestTelemetry?.event_name || 'normal'}`}
          icon={Zap}
          accentColor={latestTelemetry?.sensor_status === 'OK' ? 'var(--success)' : 'var(--danger)'}
=======
      {/* ─── Live State KPI Cards ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <MetricCard
          title="Current Cycle"
          value={latestTelemetry?.step !== undefined ? `Step #${latestTelemetry.step}` : 'Step #0'}
          subtitle={latestTelemetry?.timestamp || '2026-10-31 06:00:00'}
          icon={Activity}
          accentColor="#0F2942"
        />

        <MetricCard
          title="Inflow Rate"
          value={`${latestTelemetry?.flow_rate_L_min || 14.5} L/min`}
          subtitle={`Source: ${latestTelemetry?.greywater_source || 'Bathroom'}`}
          icon={Gauge}
          accentColor="#1D4ED8"
        />

        <MetricCard
          title="Storage Balance"
          value={`${latestTelemetry?.tank_level_L || 250.0} L`}
          subtitle={`Capacity: ${latestTelemetry?.tank_capacity_L || 1000} L`}
          icon={Layers}
          accentColor="#4338CA"
        />

        <MetricCard
          title="Sensor Status"
          value={latestTelemetry?.sensor_status || 'OK'}
          subtitle={`Profile: ${latestTelemetry?.event_name || 'normal'}`}
          icon={Zap}
          accentColor={latestTelemetry?.sensor_status === 'OK' ? '#15803D' : '#B91C1C'}
>>>>>>> myrepo/main
          badge={<StatusBadge label={latestTelemetry?.sensor_status || 'OK'} />}
        />
      </div>

<<<<<<< HEAD
      {/* Continuous Time-Series Simulation Charts */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dynamic Fluid Mass Balance & Inflow Rate Trajectory
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Continuous numerical integration of tank storage: V(t) = V(t-1) + (Q_in - Q_out) * dt.
            </p>
          </div>
          <StatusBadge label="PHYSICAL MASS BALANCE" />
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ct.colorPurple} stopOpacity={ct.gradientOpacity} />
                  <stop offset="95%" stopColor={ct.colorPurple} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ct.colorPrimary} stopOpacity={ct.gradientOpacity} />
                  <stop offset="95%" stopColor={ct.colorPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                  backgroundColor: ct.tooltipBg,
                  border: '1px solid ' + ct.tooltipBorder + ',',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
                  fontSize: 12
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="tank_level_L" stroke={ct.colorPurple} strokeWidth={2} fillOpacity={1} fill="url(#tankGrad)" name="Tank Level (L)" />
              <Area type="monotone" dataKey="flow_rate_L_min" stroke={ct.colorPrimary} strokeWidth={2} fillOpacity={1} fill="url(#flowGrad)" name="Inflow Rate (L/min)" />
=======
      {/* ─── Simulation Charts ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Dynamic Fluid Mass Balance & Inflow Rate Trajectory
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
              Numerical integration of tank storage: V(t) = V(t-1) + (Q_in - Q_out) * dt.
            </p>
          </div>
          <StatusBadge label="MASS BALANCE" />
        </div>

        <div style={{ width: '100%', height: 260, backgroundColor: '#FFFFFF' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryTrends} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="tankGradSimple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ct.colorPurple} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={ct.colorPurple} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="flowGradSimple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ct.colorPrimary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={ct.colorPrimary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
              <XAxis dataKey="timestamp" stroke={ct.axisStroke} tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')} tick={{ fontSize: 11, fill: ct.tickFill }} />
              <YAxis stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 4, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
              <Area type="monotone" dataKey="tank_level_L" stroke={ct.colorPurple} strokeWidth={2} fillOpacity={1} fill="url(#tankGradSimple)" name="Tank Volume (L)" />
              <Area type="monotone" dataKey="flow_rate_L_min" stroke={ct.colorPrimary} strokeWidth={2} fillOpacity={1} fill="url(#flowGradSimple)" name="Inflow Rate (L/min)" />
>>>>>>> myrepo/main
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* ─── Real-Time Telemetry Grid ─────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
          Official Real-Time Sampling Grid
        </h3>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Time (IST)</th>
                <th>Source</th>
                <th>pH</th>
                <th>Turbidity</th>
                <th>COD (mg/L)</th>
                <th>Flow</th>
                <th>Tank (L)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {telemetryTrends && telemetryTrends.length > 0 ? (
                telemetryTrends.slice(-8).reverse().map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#64748B' }}>
                      #{t.step !== undefined ? t.step : idx + 1}
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                      {t.timestamp || '--'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      {t.greywater_source || 'Bathroom'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.pH ? t.pH.toFixed(2) : '7.40'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.TUR_NTU ? t.TUR_NTU.toFixed(1) : '28.5'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: (t.COD_mg_L || 0) > 250 ? '#B91C1C' : '#0F172A' }}>
                      {t.COD_mg_L ? t.COD_mg_L.toFixed(1) : '82.0'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.flow_rate_L_min ? t.flow_rate_L_min.toFixed(1) : '14.5'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.tank_level_L ? t.tank_level_L.toFixed(1) : '250.0'}</td>
                    <td><StatusBadge label={computeComplianceStatus(t)} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '16px', color: '#64748B' }}>
                    No telemetry steps yet. Click "Execute Step" to generate samples.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> myrepo/main
    </div>
  );
};

export default LiveMonitoringPage;
