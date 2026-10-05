import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Droplet,
  GitFork,
  Database,
  CloudSun,
  ShieldAlert,
  Cpu,
  FileSpreadsheet,
  Server,
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  StepForward
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Live Monitoring', icon: Activity },
  { path: '/analysis', label: 'Manual Analysis', icon: FlaskConical },
  { path: '/water-quality', label: 'Water Quality', icon: Droplet },
  { path: '/routing', label: 'Smart Routing', icon: GitFork },
  { path: '/storage', label: 'Storage Tank', icon: Database },
  { path: '/weather', label: 'Weather Context', icon: CloudSun },
  { path: '/anomaly', label: 'Anomaly Screening', icon: ShieldAlert },
  { path: '/explainability', label: 'SHAP Attribution', icon: Cpu },
  { path: '/reports', label: 'Audit Reports', icon: FileSpreadsheet },
  { path: '/system', label: 'System Health', icon: Server }
];

export const Sidebar = () => {
  const {
    isSimulating,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    handleStepSimulation,
    systemHealth
  } = useSystem();

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
          }}
        >
          💧
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '-0.02em' }}>
            HydroSense <span style={{ color: 'var(--cyan-400)' }}>AI</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Smart Greywater Routing
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 10px' }}>
          Navigation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={17} style={{ opacity: 0.9 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Digital Twin Quick Controls Widget */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 23, 42, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Digital Twin
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: isSimulating ? '#34d399' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isSimulating ? '#34d399' : '#64748b'
              }}
            />
            {isSimulating ? 'LOOP ACTIVE' : 'IDLE'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          <button
            className={isSimulating ? 'btn-secondary' : 'btn-primary'}
            style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            {isSimulating ? 'Pause' : 'Start'}
          </button>

          <button
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
            onClick={() => handleStepSimulation()}
          >
            <StepForward size={14} /> Step
          </button>
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', padding: '6px 10px', fontSize: '0.72rem', justifyContent: 'center', color: '#94a3b8' }}
          onClick={handleResetSimulation}
        >
          <RotateCcw size={12} /> Reset to Step 0
        </button>
      </div>

      {/* Live System Indicator */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>Python ML:</span>
        <span style={{ color: systemHealth.pythonMl === 'CONNECTED' ? '#34d399' : '#f87171', fontWeight: 600 }}>
          {systemHealth.pythonMl}
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
