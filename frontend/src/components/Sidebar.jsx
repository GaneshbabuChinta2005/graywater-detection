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
<<<<<<< HEAD
  MapPin
=======
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Droplet
>>>>>>> myrepo/main
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

const NAV_GROUPS = [
  {
<<<<<<< HEAD
    title: 'Operations',
    items: [
      { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/monitoring', label: 'Live Monitoring', icon: Activity },
      { path: '/analysis', label: 'Manual Analysis', icon: FlaskConical },
      { path: '/water-quality', label: 'Water Quality', icon: Droplet },
    ]
  },
  {
    title: 'Regional Monitoring',
    items: [
      { path: '/places', label: 'Places', icon: MapPin },
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
=======
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
>>>>>>> myrepo/main
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
<<<<<<< HEAD
          width: 260,
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
=======
          width: 270,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #CBD5E1',
>>>>>>> myrepo/main
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
<<<<<<< HEAD
=======
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.04)',
>>>>>>> myrepo/main
          transition: 'transform var(--transition-normal)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
<<<<<<< HEAD
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
=======
            padding: '16px 20px',
            borderBottom: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
>>>>>>> myrepo/main
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
<<<<<<< HEAD
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
=======
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Droplet size={30} style={{ color: '#0284C7' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AquaTrack
              </div>
              <div style={{ fontSize: '0.68rem', color: '#15803D', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Student Project
>>>>>>> myrepo/main
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
<<<<<<< HEAD
              color: 'var(--text-secondary)',
=======
              color: '#475569',
>>>>>>> myrepo/main
              padding: 4
            }}
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> myrepo/main
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
<<<<<<< HEAD
=======
                      className={({ isActive }) =>
                        isActive ? 'gov-nav-tab active-gov-tab' : 'gov-nav-tab'
                      }
>>>>>>> myrepo/main
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 12px',
<<<<<<< HEAD
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
=======
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
>>>>>>> myrepo/main
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

<<<<<<< HEAD
        {/* Digital Twin Quick Controls Widget */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface-subtle)'
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
=======
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
>>>>>>> myrepo/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> myrepo/main
              {isSimulating ? 'Pause' : 'Start'}
            </button>

            <button
              className="btn-secondary"
<<<<<<< HEAD
              style={{ padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleStepSimulation()}
              aria-label="Advance one simulation step"
            >
              <StepForward size={13} /> Step
=======
              style={{ padding: '5px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleStepSimulation()}
              aria-label="Advance one simulation step"
            >
              <StepForward size={12} /> Step Run
>>>>>>> myrepo/main
            </button>
          </div>

          <button
            className="btn-secondary"
<<<<<<< HEAD
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
            backgroundColor: 'var(--bg-surface)'
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
=======
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
>>>>>>> myrepo/main
          </span>
        </div>
      </aside>

      <style>{`
<<<<<<< HEAD
=======
        .gov-nav-tab:hover:not(.active-gov-tab) {
          background-color: #F1F5F9 !important;
          color: #0F172A !important;
        }
>>>>>>> myrepo/main
        @media (max-width: 1024px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
<<<<<<< HEAD
            box-shadow: var(--shadow-xl);
=======
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
>>>>>>> myrepo/main
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
