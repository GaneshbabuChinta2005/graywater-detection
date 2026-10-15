import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Activity,
  AlertTriangle,
  Zap,
  Droplet,
  Layers,
  Thermometer,
  Gauge,
  FlaskConical,
  Radio
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
  { id: 'abnormal_ph', name: 'Detergent Surge', desc: 'Extreme alkaline surge (pH 9.8)' },
  { id: 'microbial_spike', name: 'Cross-Contamination', desc: 'E. coli surge (850k CFU)' },
  { id: 'sensor_fault_stuck', name: 'Hardware Stuck Fault', desc: 'Turbidity sensor frozen at 75 NTU' },
  { id: 'sensor_fault_drift', name: 'Calibration Drift', desc: 'Progressive electrochemical pH sensor drift' }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Simulation Banner Notice */}
      <div
        style={{
          backgroundColor: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
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
            </p>
          </div>
        </div>

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
          </button>
        </div>
      </div>

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
                const isSelected = selectedEvent === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    style={{
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
          badge={<StatusBadge label={latestTelemetry?.sensor_status || 'OK'} />}
        />
      </div>

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
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
