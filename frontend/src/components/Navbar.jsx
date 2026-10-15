import React from 'react';
import { RefreshCw, UserCheck, Menu, Server, Cpu, CheckCircle } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

export const Navbar = ({ onToggleSidebar }) => {
  const { systemHealth, refreshDashboard, loading } = useSystem();
  const { user } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Left: Mobile Toggle & Context Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 8px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Operational Telemetry Console
          </h2>
          <span
            className="navbar-sub-badge"
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)'
            }}
          >
            SaaS v2.4 Active
          </span>
        </div>
      </div>

      {/* Right: Health Badges & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Node Gateway Health */}
        <div className="navbar-health-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Server size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Gateway:</span>
          <StatusBadge label={systemHealth.nodeApi} />
        </div>

        {/* Python ML Health */}
        <div className="navbar-health-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Cpu size={13} style={{ color: 'var(--text-muted)' }} />
          <span>ML Core:</span>
          <StatusBadge label={systemHealth.pythonMl} />
        </div>

        {/* Models Loaded */}
        <div className="navbar-health-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <CheckCircle size={13} style={{ color: 'var(--text-muted)' }} />
          <span>Models:</span>
          <StatusBadge label={systemHealth.modelsLoaded ? 'LOADED' : 'UNLOADED'} />
        </div>

        {/* Refresh Button */}
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem', height: 32 }}
          onClick={() => refreshDashboard()}
          title="Refresh Data & Status"
          disabled={loading}
          aria-label="Refresh telemetry and system status"
        >
          <RefreshCw size={13} className={loading ? 'pulse-dot' : ''} style={{ transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
          <span className="navbar-btn-text">Refresh</span>
        </button>

        {/* User Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'Operator'}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            {user?.role || 'OPERATOR'}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .navbar-health-item {
            display: none !important;
          }
          .navbar-sub-badge {
            display: none !important;
          }
          .navbar-btn-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
