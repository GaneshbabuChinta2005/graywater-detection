import React from 'react';
import { RefreshCw, UserCheck, Shield } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

export const Navbar = () => {
  const { systemHealth, refreshDashboard, loading } = useSystem();
  const { user } = useAuth();

  return (
    <header
      style={{
        height: 64,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(9, 14, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Title & Live Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Operational Telemetry & Routing Console
        </h2>
        <StatusBadge label="MERN STACK ARCHITECTURE" size="sm" />
      </div>

      {/* Health Badges & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Node Health */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Gateway:</span>
          <StatusBadge label={systemHealth.nodeApi} />
        </div>

        {/* Python ML Health */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Python ML:</span>
          <StatusBadge label={systemHealth.pythonMl} />
        </div>

        {/* Models Loaded */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Models:</span>
          <StatusBadge label={systemHealth.modelsLoaded ? 'LOADED' : 'UNLOADED'} />
        </div>

        {/* Refresh Button */}
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          onClick={() => refreshDashboard()}
          title="Refresh Data & Status"
        >
          <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
          Refresh
        </button>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <UserCheck size={14} color="var(--cyan-400)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
            {user?.name || 'Operator'}
          </span>
          <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-400)', fontWeight: 700 }}>
            {user?.role || 'OPERATOR'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
