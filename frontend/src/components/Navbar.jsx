import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Globe,
  Droplet,
  Clock,
  RefreshCw,
  Play,
  Pause,
  StepForward,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Database,
  CloudSun,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';

const PRIMARY_NAV = [
  { path: '/dashboard', label: 'Overview' },
  { path: '/places', label: 'Basin Stations' },
  { path: '/monitoring', label: 'Live Telemetry' },
  { path: '/water-quality', label: 'Water Quality' },
  { path: '/routing', label: 'Smart Routing' },
  { path: '/reports', label: 'Audit & Challans' },
  { path: '/analysis', label: 'Lab Analysis' },
];

const MORE_NAV = [
  { path: '/storage', label: 'Storage Tank Balance', icon: Database, desc: 'Tank levels & Arrhenius decay' },
  { path: '/weather', label: 'Meteorological Context', icon: CloudSun, desc: 'Rainfall runoff prevention' },
  { path: '/anomaly', label: 'Anomaly Screening', icon: ShieldAlert, desc: 'Isolation forest outlier detection' },
  { path: '/explainability', label: 'AI Explainability (SHAP)', icon: Cpu, desc: 'Statutory decision attribution' },
  { path: '/system', label: 'Infrastructure Health', icon: Server, desc: '3-tier service diagnostics' }
];

export const Navbar = () => {
  const location = useLocation();
  const {
    systemHealth,
    refreshDashboard,
    loading,
    isSimulating,
    handleStartSimulation,
    handleStopSimulation,
    handleStepSimulation
  } = useSystem();
  const { user } = useAuth();

  const [currentDateTime, setCurrentDateTime] = useState('');
  const [textSize, setTextSize] = useState('normal');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentDateTime(`${new Intl.DateTimeFormat('en-IN', options).format(now)} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Text Size Scalar
  const handleTextSizeChange = (size) => {
    setTextSize(size);
    if (size === 'small') document.documentElement.style.fontSize = '14px';
    else if (size === 'large') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
  };

  const isMoreActive = MORE_NAV.some(item => location.pathname === item.path);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
      {/* ─── TIER 2: Project header ───────────────────────────────────────── */}
      <div
        style={{
          height: '76px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        {/* Left: Project title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Droplet size={38} style={{ color: '#0284C7' }} />

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1 }}>
              Greywater Quality Monitoring
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2942', fontFamily: 'var(--font-heading)', margin: '2px 0 0 0', lineHeight: 1.15 }}>
              AquaTrack
            </h1>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, marginTop: 2 }}>
              A student prototype for water quality analysis and reuse planning
            </div>
          </div>
        </div>

        {/* Right: Project label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="gov-mobile-toggle"
            style={{
              display: 'none',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#0F2942'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── TIER 3: Primary Horizontal Navigation Menu (Official Navy, 44px) ─ */}
      <nav
        style={{
          height: '44px',
          backgroundColor: '#0F2942',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #D97706'
        }}
        className="gov-nav-horizontal"
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2 }}>
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                height: '100%',
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#CBD5E1',
                textDecoration: 'none',
                backgroundColor: isActive ? '#1E3A8A' : 'transparent',
                borderBottom: isActive ? '3px solid #D97706' : '3px solid transparent',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                whiteSpace: 'nowrap'
              })}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Decision Modules Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative', height: '100%' }}>
            <button
              onClick={() => setMoreDropdownOpen(prev => !prev)}
              style={{
                height: '100%',
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.82rem',
                fontWeight: isMoreActive ? 700 : 500,
                color: isMoreActive ? '#FFFFFF' : '#CBD5E1',
                background: isMoreActive ? '#1E3A8A' : 'transparent',
                border: 'none',
                borderBottom: isMoreActive ? '3px solid #D97706' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Decision Modules</span>
              <ChevronDown size={13} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            {moreDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '260px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0 0 6px 6px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #CBD5E1',
                  borderTop: 'none',
                  padding: '6px 0',
                  zIndex: 200
                }}
              >
                {MORE_NAV.map((sub) => {
                  const Icon = sub.icon;
                  const active = location.pathname === sub.path;
                  return (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      onClick={() => setMoreDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        textDecoration: 'none',
                        backgroundColor: active ? '#EFF6FF' : 'transparent',
                        color: active ? '#0F2942' : '#334155',
                        borderLeft: active ? '3px solid #0F2942' : '3px solid transparent',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <Icon size={16} style={{ color: active ? '#0F2942' : '#64748B', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: active ? 700 : 600 }}>{sub.label}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{sub.desc}</div>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Digital Twin Simulator & Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Digital Twin Simulator Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '4px',
              padding: '2px 8px'
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isSimulating ? '#22C55E' : '#94A3B8'
              }}
              className={isSimulating ? 'pulse-dot' : ''}
            />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
              {isSimulating ? 'SIM RUNNING' : 'SIM IDLE'}
            </span>

            <button
              onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
              style={{
                background: isSimulating ? '#D97706' : '#15803D',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3
              }}
              title={isSimulating ? 'Pause continuous simulation' : 'Start continuous simulation'}
            >
              {isSimulating ? <Pause size={10} /> : <Play size={10} />}
              <span>{isSimulating ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => handleStepSimulation()}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3
              }}
              title="Advance single step"
            >
              <StepForward size={10} />
              <span>Step</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshDashboard()}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            disabled={loading}
            title="Refresh state telemetry"
          >
            <RefreshCw size={12} className={loading ? 'pulse-dot' : ''} style={{ transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
            <span>Sync</span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile Dropdown Drawer ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#0F2942',
            borderTop: '1px solid #1E3A8A',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {[...PRIMARY_NAV, ...MORE_NAV].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: '#FFFFFF',
                textDecoration: 'none',
                backgroundColor: isActive ? '#1E3A8A' : 'transparent'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .gov-nav-horizontal {
            display: none !important;
          }
          .gov-mobile-toggle {
            display: block !important;
          }
          .gov-header-info, .gov-header-divider {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
