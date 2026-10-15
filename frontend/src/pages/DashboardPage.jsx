import React from 'react';
import {
  Droplet,
  GitFork,
  AlertTriangle,
  Database,
  CloudSun,
  Activity,
  CheckCircle2,
  TrendingUp,
  Sliders
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
  CartesianGrid,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const { summary, latestTelemetry, telemetryTrends, latestAnalysis } = useSystem();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            System Overview & Real-Time Telemetry
          </h1>
          <p className="page-subtitle">
            Continuous multi-context greywater quality monitoring, XGBoost routing classification, and deterministic safety arbitration.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <StatusBadge label={`SOURCE: ${summary?.source || 'Bathroom'}`} size="lg" />
          <StatusBadge label={summary?.finalAction || 'ALLOW_ROUTE'} size="lg" />
        </div>
      </div>

      {/* KPI Grid (Top 6 Operational Metric Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Current Water Quality"
          value={latestTelemetry ? `${latestTelemetry.pH.toFixed(2)} pH` : '7.40 pH'}
          subtitle={`Turbidity: ${latestTelemetry?.TUR_NTU || 28.5} NTU`}
          icon={Droplet}
          accentColor="var(--primary)"
          badge={<StatusBadge label={summary?.source || 'Bathroom'} />}
        />

        <MetricCard
          title="ML Predicted Route"
          value={summary?.predictedRoute || 'Restricted Irrigation'}
          subtitle={`Confidence: ${((summary?.confidence || 0.94) * 100).toFixed(1)}%`}
          icon={GitFork}
          accentColor="var(--info)"
          badge={<StatusBadge label={summary?.predictedRoute || 'Irrigation'} />}
        />

        <MetricCard
          title="Final Arbitrated Route"
          value={summary?.finalRoute || 'Restricted Irrigation'}
          subtitle={`Action: ${summary?.finalAction || 'ALLOW_ROUTE'}`}
          icon={CheckCircle2}
          accentColor="var(--success)"
          badge={<StatusBadge label={summary?.finalAction || 'ALLOW_ROUTE'} />}
        />

        <MetricCard
          title="Anomaly Screening"
          value={summary?.anomalyStatus || 'NORMAL'}
          subtitle={`Isolation Score: ${(summary?.anomalyScore || 0.04).toFixed(4)}`}
          icon={AlertTriangle}
          accentColor={summary?.anomalyStatus === 'NORMAL' ? 'var(--success)' : 'var(--danger)'}
          badge={<StatusBadge label={summary?.anomalyStatus || 'NORMAL'} />}
        />

        <MetricCard
          title="Storage Tank Level"
          value={`${summary?.tankLevelLiters || 250.0} L`}
          subtitle={`Capacity: ${summary?.tankCapacityLiters || 1000} L (${summary?.fillPercentage || 25}%)`}
          icon={Database}
          accentColor="var(--purple)"
          badge={<StatusBadge label={`${summary?.fillPercentage || 25}% Full`} />}
        />

        <MetricCard
          title="Weather Context"
          value={summary?.weatherCondition || 'Clear'}
          subtitle={`Rainfall: ${summary?.rainfallMm || 0} mm (${summary?.irrigationAction || 'ALLOW_ROUTE'})`}
          icon={CloudSun}
          accentColor="var(--warning)"
          badge={<StatusBadge label={summary?.irrigationAction || 'ALLOW_ROUTE'} />}
        />
      </div>

      {/* Decision Pipeline Visualizer */}
      <DecisionPipelineVisualizer analysis={latestAnalysis} />

      {/* Analytics & SHAP Attribution Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* Telemetry Trend Graph */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Water Quality Telemetry History
                </h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  Last 24 Steps
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Real-time tracking of pH, Turbidity (NTU), and Chemical Oxygen Demand (COD mg/L).
              </p>
            </div>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94A3B8"
                  tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="pH" stroke="#0F766E" strokeWidth={2.5} dot={false} name="pH" />
                <Line type="monotone" dataKey="TUR_NTU" stroke="#B45309" strokeWidth={2} dot={false} name="Turbidity (NTU)" />
                <Line type="monotone" dataKey="COD_mg_L" stroke="#B91C1C" strokeWidth={2} dot={false} name="COD (mg/L)" />
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
