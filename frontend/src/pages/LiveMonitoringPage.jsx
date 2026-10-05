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
  Gauge
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const SYNTHETIC_EVENTS = [
  { id: 'normal', name: 'Nominal Baseline', desc: 'Typical domestic greywater baseline' },
  { id: 'high_turbidity', name: 'Sediment Shock', desc: 'Turbidity & TSS spike' },
  { id: 'high_tds', name: 'Saline Dissolved Shock', desc: 'TDS & Salinity surge' },
  { id: 'high_organic_load', name: 'Kitchen Organic Load', desc: 'Severe COD/BOD food waste load' },
  { id: 'abnormal_ph', name: 'Detergent Surge', desc: 'Extreme alkaline surge (pH 9.8)' },
  { id: 'microbial_spike', name: 'Cross-Contamination', desc: 'E. coli surge (850k CFU)' },
  { id: 'sensor_fault_stuck', name: 'Hardware Stuck Fault', desc: 'Turbidity sensor frozen at 75 NTU' },
  { id: 'sensor_fault_drift', name: 'Sensor Calibration Drift', desc: 'Progressive electrochemical pH sensor drift' }
];

export const LiveMonitoringPage = () => {
  const {
    latestTelemetry,
    latestAnalysis,
    telemetryTrends,
    isSimulating,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    handleStepSimulation
  } = useSystem();

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
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(6, 182, 212, 0.12))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 14,
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '1.6rem' }}>🧪</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fef3c7' }}>
                DIGITAL TWIN SIMULATION MODE
              </h2>
              <StatusBadge label={isSimulating ? 'SIMULATION RUNNING' : 'STEP-BY-STEP READY'} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: 2 }}>
              Telemetry streams are synthetic physical/chemical operational data derived from statistical profiles. Not physical sensor hardware.
            </p>
          </div>
        </div>

        {/* Live Controller Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={isSimulating ? 'btn-secondary' : 'btn-primary'}
            onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
            {isSimulating ? 'Pause Loop' : 'Start Auto-Run'}
          </button>

          <button className="btn-secondary" onClick={onStepClick}>
            <StepForward size={16} /> Advance Step (+5m)
          </button>

          <button className="btn-secondary" onClick={handleResetSimulation}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Interactive Controls & Shock Injector */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          Telemetry Generation Parameters & Controlled Shock Injection
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          {/* Source Selector */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Active Greywater Source:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Bathroom', 'Kitchen', 'Laundry', 'Mixed'].map(src => (
                <button
                  key={src}
                  className={selectedSource === src ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                  onClick={() => setSelectedSource(src)}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Synthetic Event Injector */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Synthetic Shock Load or Sensor Malfunction:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {SYNTHETIC_EVENTS.map(evt => (
                <button
                  key={evt.id}
                  className={selectedEvent === evt.id ? 'btn-primary' : 'btn-secondary'}
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                  onClick={() => setSelectedEvent(evt.id)}
                >
                  <span style={{ fontWeight: 600 }}>{evt.name}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{evt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live State Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Simulation Step"
          value={latestTelemetry?.step !== undefined ? `Step #${latestTelemetry.step}` : 'Step #0'}
          subtitle={`Time: ${latestTelemetry?.timestamp || '2026-10-03 06:00:00'}`}
          icon={Activity}
          accentColor="#06b6d4"
        />

        <MetricCard
          title="Inflow Volume Rate"
          value={`${latestTelemetry?.flow_rate_L_min || 14.5} L/min`}
          subtitle={`Source: ${latestTelemetry?.greywater_source || 'Bathroom'}`}
          icon={Gauge}
          accentColor="#3b82f6"
        />

        <MetricCard
          title="Storage Tank Balance"
          value={`${latestTelemetry?.tank_level_L || 250.0} L`}
          subtitle={`Capacity: ${latestTelemetry?.tank_capacity_L || 1000} L`}
          icon={Layers}
          accentColor="#8b5cf6"
        />

        <MetricCard
          title="Hardware Sensor Status"
          value={latestTelemetry?.sensor_status || 'OK'}
          subtitle={`Injected Event: ${latestTelemetry?.event_name || 'normal'}`}
          icon={Zap}
          accentColor={latestTelemetry?.sensor_status === 'OK' ? '#10b981' : '#ef4444'}
          badge={<StatusBadge label={latestTelemetry?.sensor_status || 'OK'} />}
        />
      </div>

      {/* Continuous Time-Series Simulation Charts */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dynamic Fluid Mass Balance & Inflow Rate Trajectory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Continuous numerical integration of tank storage: V(t) = V(t-1) + (Q_in - Q_out) * dt.
            </p>
          </div>
          <StatusBadge label="PHYSICAL MASS BALANCE" />
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryTrends} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="tankFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" stroke="#64748b" tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')} />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="tank_level_L" stroke="#8b5cf6" fillOpacity={1} fill="url(#tankFill)" name="Tank Level (L)" />
              <Area type="monotone" dataKey="flow_rate_L_min" stroke="#06b6d4" fillOpacity={1} fill="url(#flowFill)" name="Inflow Rate (L/min)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
