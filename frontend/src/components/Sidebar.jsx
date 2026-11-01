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
  Radio,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Droplet
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const NAV_GROUPS = [
  {
    title: 'Operations & Telemetry',
    items: [
      { path: '/dashboard', label: 'System Overview', icon: LayoutDashboard },
      { path: '/monitoring', label: 'Live Telemetry Stream', icon: Activity },
      { path: '/analysis', label: 'Manual Lab Analysis', icon: FlaskConical },
      { path: '/water-quality', label: 'Water Quality Norms', icon: Droplet },
    ]
  },
  {
    title: 'Regional Basin Surveillance',
    items: [
      { path: '/places', label: 'Andhra Pradesh Nodes', icon: MapPin },
    ]
  },
  {
    title: 'Statutory AI & Decision Engine',
    items: [
      { path: '/routing', label: 'Smart Routing Engine', icon: GitFork },
      { path: '/storage', label: 'Storage Tank Balance', icon: Database },
      { path: '/weather', label: 'Meteorological Context', icon: CloudSun },
      { path: '/anomaly', label: 'Anomaly Screening', icon: ShieldAlert },
      { path: '/explainability', label: 'SHAP Statutory Audit', icon: Cpu },
    ]
  },
  {
    title: 'Compliance & System Health',
    items: [
      { path: '/reports', label: 'Audit Logs & Challans', icon: FileSpreadsheet },
      { path: '/system', label: 'Infrastructure Health', icon: Server }
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
          width: 270,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.04)',
          transition: 'transform var(--transition-normal)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Droplet size={30} style={{ color: '#0284C7' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AquaTrack
              </div>
              <div style={{ fontSize: '0.68rem', color: '#15803D', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Student Project
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
              color: '#475569',
              padding: 4
            }}
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Structured Institutional Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={group.title} style={{ marginBottom: gIdx !== NAV_GROUPS.length - 1 ? 18 : 6 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0 12px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0F2942' }} />
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
                      className={({ isActive }) =>
                        isActive ? 'gov-nav-tab active-gov-tab' : 'gov-nav-tab'
                      }
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 12px',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#0F2942' : '#334155',
                        textDecoration: 'none',
                        backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                        borderLeft: isActive ? '4px solid #0F2942' : '4px solid transparent',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      })}
                    >
                      <Icon size={16} style={{ flexShrink: 0, color: 'currentColor' }} />
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

        {/* Digital Twin Quick Controls Widget (Solid Government Console Style) */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F2942', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Digital Twin Simulator
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: isSimulating ? '#15803D' : '#64748B',
                fontWeight: 700,
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
                  backgroundColor: isSimulating ? '#15803D' : '#CBD5E1'
                }}
                className={isSimulating ? 'pulse-dot' : ''}
              />
              {isSimulating ? 'SIM ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <button
              className={isSimulating ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '5px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
              aria-label={isSimulating ? 'Pause simulation' : 'Start simulation'}
            >
              {isSimulating ? <Pause size={12} /> : <Play size={12} />}
              {isSimulating ? 'Pause' : 'Start'}
            </button>

            <button
              className="btn-secondary"
              style={{ padding: '5px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleStepSimulation()}
              aria-label="Advance one simulation step"
            >
              <StepForward size={12} /> Step Run
            </button>
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', justifyContent: 'center', color: '#475569' }}
            onClick={handleResetSimulation}
            aria-label="Reset simulation to initial state"
          >
            <RotateCcw size={11} /> Reset Model Step
          </button>
        </div>

        {/* Demo status footer */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#475569',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={13} style={{ color: '#15803D' }} />
            <span style={{ fontWeight: 600 }}>Demo Status:</span>
          </div>
          <span
            style={{
              color: systemHealth.pythonMl === 'CONNECTED' ? '#15803D' : '#B91C1C',
              fontWeight: 700,
              fontSize: '0.68rem',
              backgroundColor: systemHealth.pythonMl === 'CONNECTED' ? '#F0FDF4' : '#FEF2F2',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${systemHealth.pythonMl === 'CONNECTED' ? '#BBF7D0' : '#FECACA'}`
            }}
          >
            {systemHealth.pythonMl === 'CONNECTED' ? 'ONLINE' : 'STANDALONE'}
          </span>
        </div>
      </aside>

      <style>{`
        .gov-nav-tab:hover:not(.active-gov-tab) {
          background-color: #F1F5F9 !important;
          color: #0F172A !important;
        }
        @media (max-width: 1024px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
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
