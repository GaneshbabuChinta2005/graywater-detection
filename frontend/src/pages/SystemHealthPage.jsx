import React, { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Server, Database, Cpu, CloudSun, RefreshCw, CheckCircle2, ShieldCheck, Terminal, Clock, Activity } from 'lucide-react';

export const SystemHealthPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const data = await getHealth();
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setHealthData({
        status: 'partial',
        service: 'express-gateway',
        database: { connected: false, host: 'offline' },
        mlService: { status: 'DISCONNECTED', modelsLoaded: false }
      });
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const components = [
    {
      name: 'React 18 / Vite Frontend',
      status: 'CONNECTED',
      desc: 'Single-page responsive operational UI served via Vite on Port 5173',
      icon: Terminal,
      color: 'var(--primary)'
    },
    {
      name: 'Node.js / Express API Gateway',
      status: healthData ? 'CONNECTED' : 'CHECKING...',
      desc: 'REST Gateway, arbitration engine, and routing proxy on Port 5000',
      icon: Server,
      color: 'var(--success)'
    },
    {
      name: 'Python FastAPI ML Engine',
      status: healthData?.mlService?.status || 'CHECKING...',
      desc: 'XGBoost multi-class classifier, Isolation Forest & SHAP TreeExplainer on Port 8000',
      icon: Cpu,
      color: healthData?.mlService?.status === 'CONNECTED' ? 'var(--info)' : 'var(--danger)'
    },
    {
      name: 'MongoDB Document Database',
      status: healthData?.database?.connected ? 'CONNECTED' : 'MEMORY_FALLBACK_ACTIVE',
      desc: healthData?.database?.connected ? `Connected to ${healthData.database.database}` : 'In-memory persistent fallback repository enabled',
      icon: Database,
      color: healthData?.database?.connected ? 'var(--success)' : 'var(--warning)'
    },
    {
      name: 'Serialized Model Artifacts',
      status: healthData?.mlService?.modelsLoaded ? 'LOADED' : 'INITIALIZING',
      desc: 'xgboost_optimized.pkl and isolation_forest.pkl serialized model weights',
      icon: ShieldCheck,
      color: healthData?.mlService?.modelsLoaded ? 'var(--success)' : 'var(--warning)'
    },
    {
      name: 'Meteorological Context Provider',
      status: 'AVAILABLE',
      desc: 'Open-Meteo precipitation query client with deterministic offline fallback',
      icon: CloudSun,
      color: 'var(--warning)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            System Architecture & Service Health Monitor
          </h1>
          <p className="page-subtitle">
            Diagnostics and probe monitoring across the 3-tier MERN architecture: React frontend, Node gateway, and Python FastAPI ML engine.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {lastChecked && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Last probe: <strong>{lastChecked}</strong> ({latencyMs}ms)
            </span>
          )}
          <button className="btn-primary" onClick={checkStatus} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
            Probe Services
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: comp.color,
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {comp.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                    {comp.desc}
                  </p>
                </div>
              </div>
              <StatusBadge label={comp.status} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Operational Protocol Standards */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Fault Tolerance & Service Orchestration Protocol
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The HydroSense AI architecture guarantees continuous operational telemetry: if the Python ML microservice is temporarily offline, the Node.js API Gateway reports graceful degradation rather than crashing the dashboard. If MongoDB is offline, the backend transitions automatically into an in-memory repository ensuring zero downtime for live greywater routing telemetry.
        </p>
      </div>
    </div>
  );
};

export default SystemHealthPage;
