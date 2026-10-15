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
  StepForward,
  X,
  Radio
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const NAV_GROUPS = [
  {
    title: 'Operations',
    items: [
      { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/monitoring', label: 'Live Monitoring', icon: Activity },
      { path: '/analysis', label: 'Manual Analysis', icon: FlaskConical },
      { path: '/water-quality', label: 'Water Quality', icon: Droplet },
    ]
  },
  {
    title: 'AI & Decision Engine',
    items: [
      { path: '/routing', label: 'Smart Routing', icon: GitFork },
      { path: '/storage', label: 'Storage Tank', icon: Database },
      { path: '/weather', label: 'Weather Context', icon: CloudSun },
      { path: '/anomaly', label: 'Anomaly Screening', icon: ShieldAlert },
      { path: '/explainability', label: 'SHAP Attribution', icon: Cpu },
    ]
  },
  {
    title: 'System & Audit',
    items: [
      { path: '/reports', label: 'Audit Reports', icon: FileSpreadsheet },
      { path: '/system', label: 'System Health', icon: Server }
    ]
  }
];

export const Sidebar = ({ isOpen = false, onClose }) => {
  const {
    isSimulating,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    handleStepSimulation,
    systemHealth
  } = useSystem();

  return (
    <>
      <aside
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 260,
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'transform var(--transition-normal)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(15, 118, 110, 0.3)'
              }}
            >
              <Droplet size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                HydroSense <span style={{ color: 'var(--primary)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                Intelligent Greywater OS
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 4
            }}
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items (Categorized with Clean Hierarchy) */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={group.title} style={{ marginBottom: gIdx !== NAV_GROUPS.length - 1 ? 20 : 8 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0 12px 8px'
                }}
              >
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        textDecoration: 'none',
                        backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)'
                      })}
                    >
                      <Icon size={17} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Digital Twin Quick Controls Widget */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Digital Twin Sim
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: isSimulating ? 'var(--success)' : 'var(--text-secondary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: isSimulating ? 'var(--success)' : '#CBD5E1'
                }}
                className={isSimulating ? 'pulse-dot' : ''}
              />
              {isSimulating ? 'RUNNING' : 'IDLE'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <button
              className={isSimulating ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
              aria-label={isSimulating ? 'Pause simulation' : 'Start simulation'}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              {isSimulating ? 'Pause' : 'Start'}
            </button>

            <button
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleStepSimulation()}
              aria-label="Advance one simulation step"
            >
              <StepForward size={13} /> Step
            </button>
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.72rem', justifyContent: 'center', color: 'var(--text-secondary)' }}
            onClick={handleResetSimulation}
            aria-label="Reset simulation to step 0"
          >
            <RotateCcw size={12} /> Reset to Step 0
          </button>
        </div>

        {/* Live System Indicator */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} color="var(--primary)" />
            <span>Python ML:</span>
          </div>
          <span
            style={{
              color: systemHealth.pythonMl === 'CONNECTED' ? 'var(--success)' : 'var(--danger)',
              fontWeight: 700,
              fontSize: '0.7rem',
              backgroundColor: systemHealth.pythonMl === 'CONNECTED' ? 'var(--success-bg)' : 'var(--danger-bg)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              border: `1px solid ${systemHealth.pythonMl === 'CONNECTED' ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}
          >
            {systemHealth.pythonMl}
          </span>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-xl);
          }
          .app-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
