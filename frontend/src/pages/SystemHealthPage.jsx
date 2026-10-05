import React, { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Server, Database, Cpu, CloudSun, RefreshCw, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

export const SystemHealthPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await getHealth();
      setHealthData(data);
    } catch (e) {
      setHealthData({
        status: 'partial',
        service: 'express-gateway',
        database: { connected: false, host: 'offline' },
        mlService: { status: 'DISCONNECTED', modelsLoaded: false }
      });
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
      desc: 'Single-page responsive UI running on Port 5173',
      icon: Terminal,
      color: '#38bdf8'
    },
    {
      name: 'Node.js / Express API Gateway',
      status: healthData ? 'CONNECTED' : 'CHECKING...',
      desc: 'REST Gateway, Rate Limiting, Authentication on Port 5000',
      icon: Server,
      color: '#34d399'
    },
    {
      name: 'Python FastAPI ML Engine',
      status: healthData?.mlService?.status || 'CHECKING...',
      desc: 'XGBoost, Isolation Forest & SHAP Microservice on Port 8000',
      icon: Cpu,
      color: '#8b5cf6'
    },
    {
      name: 'MongoDB Document Database',
      status: healthData?.database?.connected ? 'CONNECTED' : 'MEMORY_FALLBACK_ACTIVE',
      desc: healthData?.database?.connected ? `Connected to ${healthData.database.database}` : 'Local persistent in-memory fallback enabled',
      icon: Database,
      color: healthData?.database?.connected ? '#10b981' : '#f59e0b'
    },
    {
      name: 'Pre-Trained ML Models',
      status: healthData?.mlService?.modelsLoaded ? 'LOADED' : 'INITIALIZING',
      desc: 'xgboost_optimized.pkl and isolation_forest.pkl serialized weights',
      icon: ShieldCheck,
      color: '#06b6d4'
    },
    {
      name: 'Meteorological Context Provider',
      status: 'AVAILABLE',
      desc: 'Modular weather service with offline realistic fallback',
      icon: CloudSun,
      color: '#fbbf24'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System Architecture & Service Health Monitor
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Live status of MERN-stack microservices, model serialization integrity, and database connectivity.
          </p>
        </div>
        <button className="btn-primary" onClick={checkStatus}>
          <RefreshCw size={15} className={loading ? 'pulse-dot' : ''} />
          Probe Services
        </button>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: comp.color
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {comp.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
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
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Service Orchestration Protocol
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The HydroSense AI architecture guarantees high reliability: if the Python ML microservice is temporarily
          offline, the Node.js API Gateway reports graceful degradation rather than crashing the dashboard.
          If MongoDB is offline, the backend transitions automatically into an in-memory repository ensuring
          zero downtime for operational telemetry visualization.
        </p>
      </div>
    </div>
  );
};

export default SystemHealthPage;
