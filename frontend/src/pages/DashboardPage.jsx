import React from 'react';
import {
  Droplet,
  GitFork,
  ShieldCheck,
  AlertTriangle,
  Database,
  CloudSun,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import DecisionPipelineVisualizer from '../components/DecisionPipelineVisualizer';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const { summary, latestTelemetry, telemetryTrends, latestAnalysis, systemHealth } = useSystem();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System Overview & Real-Time Telemetry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Continuous multi-context greywater quality monitoring, XGBoost routing classification, and safety arbitration.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <StatusBadge label={`SOURCE: ${summary?.source || 'Bathroom'}`} size="lg" />
          <StatusBadge label={summary?.finalAction || 'ALLOW_ROUTE'} size="lg" />
        </div>
      </div>

      {/* KPI Grid (Top 6 Metric Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Current Water Quality"
          value={latestTelemetry ? `${latestTelemetry.pH.toFixed(2)} pH` : '7.40 pH'}
          subtitle={`Turbidity: ${latestTelemetry?.TUR_NTU || 28.5} NTU`}
          icon={Droplet}
          accentColor="#06b6d4"
          badge={<StatusBadge label={summary?.source || 'Bathroom'} />}
        />

        <MetricCard
          title="ML Predicted Route"
          value={summary?.predictedRoute || 'Restricted Irrigation'}
          subtitle={`Confidence: ${((summary?.confidence || 0.94) * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="#3b82f6"
          badge={<StatusBadge label={summary?.predictedRoute || 'Irrigation'} />}
        />

        <MetricCard
          title="Final Arbitrated Route"
          value={summary?.finalRoute || 'Restricted Irrigation'}
          subtitle={`Action: ${summary?.finalAction || 'ALLOW_ROUTE'}`}
          icon={CheckCircle2}
          accentColor="#10b981"
          badge={<StatusBadge label={summary?.finalAction || 'ALLOW_ROUTE'} />}
        />

        <MetricCard
          title="Anomaly Detection"
          value={summary?.anomalyStatus || 'NORMAL'}
          subtitle={`Score: ${(summary?.anomalyScore || 0.04).toFixed(4)}`}
          icon={AlertTriangle}
          accentColor={summary?.anomalyStatus === 'NORMAL' ? '#10b981' : '#ef4444'}
          badge={<StatusBadge label={summary?.anomalyStatus || 'NORMAL'} />}
        />

        <MetricCard
          title="Storage Tank Status"
          value={`${summary?.tankLevelLiters || 250.0} L`}
          subtitle={`Capacity: ${summary?.tankCapacityLiters || 1000} L (${summary?.fillPercentage || 25}%)`}
          icon={Database}
          accentColor="#8b5cf6"
          badge={<StatusBadge label={`${summary?.fillPercentage || 25}% Full`} />}
        />

        <MetricCard
          title="Weather Condition"
          value={summary?.weatherCondition || 'Clear'}
          subtitle={`Rain: ${summary?.rainfallMm || 0} mm (${summary?.irrigationAction || 'ALLOW_ROUTE'})`}
          icon={CloudSun}
          accentColor="#f59e0b"
          badge={<StatusBadge label={summary?.irrigationAction || 'ALLOW_ROUTE'} />}
        />
      </div>

      {/* Decision Pipeline Visualizer */}
      <DecisionPipelineVisualizer analysis={latestAnalysis} />

      {/* Charts & SHAP Attribution Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Telemetry 24-Step Trend Graph */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Water Quality Telemetry History (Last 24 Steps)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Real-time tracking of pH, Turbidity (NTU), and Chemical Oxygen Demand (COD mg/L).
              </p>
            </div>
            <Activity size={18} color="var(--cyan-400)" />
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')}
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Line type="monotone" dataKey="pH" stroke="#06b6d4" strokeWidth={2} dot={false} name="pH" />
                <Line type="monotone" dataKey="TUR_NTU" stroke="#f59e0b" strokeWidth={2} dot={false} name="Turbidity (NTU)" />
                <Line type="monotone" dataKey="COD_mg_L" stroke="#f43f5e" strokeWidth={2} dot={false} name="COD (mg/L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SHAP Waterfall Preview */}
        <ShapWaterfallChart
          shapData={latestAnalysis?.shap}
          predictedRoute={latestAnalysis?.prediction?.class_name}
          confidence={latestAnalysis?.prediction?.confidence}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
