import React, { useState } from 'react';
import {
  Droplet,
  GitFork,
  AlertTriangle,
  Database,
  CloudSun,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Zap,
  MapPin,
  Waves,
  AlertOctagon
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import DecisionPipelineVisualizer from '../components/DecisionPipelineVisualizer';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import RegulatoryChallanModal from '../components/RegulatoryChallanModal';
import { useChartTheme } from '../hooks/useChartTheme';
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
  const ct = useChartTheme();

  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [challanScenario, setChallanScenario] = useState('auto');

  const isViolation =
    summary?.finalAction === 'SEWER_BYPASS' ||
    (latestTelemetry?.COD_mg_L && latestTelemetry.COD_mg_L > 250) ||
    (latestTelemetry?.TSS_mg_L && latestTelemetry.TSS_mg_L > 100) ||
    (latestTelemetry?.E_coli_CFU_100mL && latestTelemetry.E_coli_CFU_100mL > 10000);

  const openChallan = (scenario = 'auto') => {
    setChallanScenario(scenario);
    setIsChallanModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── 1. Page Header (Concise & Clear) ─────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            State Water Resource Digital Twin & Real-Time Overview
          </h1>
          <p className="page-subtitle">
            Autonomous monitoring of effluent water quality and intelligent non-potable reuse diversion.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => openChallan('auto')}
            className={isViolation ? 'btn-danger' : 'btn-primary'}
            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Scale size={15} />
            <span>Generate Demo Report</span>
          </button>
          <StatusBadge label={`Source: ${summary?.source || 'Bathroom'}`} size="lg" />
          <StatusBadge label={isViolation ? 'VIOLATION - SEWER OVERRIDE' : (summary?.finalAction || 'COMPLIANT')} size="lg" />
        </div>
      </div>

      {/* ─── 2. Citizen Transparency & Resource Saving Ticker ──────────────── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderLeft: '4px solid #0F2942',
          borderRadius: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Waves size={18} style={{ color: '#0F2942' }} />
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              State Water Conservation Ledger
            </h2>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
            Prototype Water Reuse Estimate
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          {/* Metric 1 */}
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Water Conserved</span>
              <Droplet size={14} style={{ color: '#0F2942' }} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942' }}>
              48.62 <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>ML</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 600, marginTop: 2 }}>48,620 kL municipal savings</div>
          </div>

          {/* Metric 2 */}
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pumping Energy Offset</span>
              <Zap size={14} style={{ color: '#D97706' }} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942' }}>
              124,850 <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>kWh</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 600, marginTop: 2 }}>Avoided grid pumping energy</div>
          </div>

          {/* Metric 3 */}
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Basin Stations</span>
              <MapPin size={14} style={{ color: '#15803D' }} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>
              6 / 6 <span style={{ fontSize: '0.82rem', color: '#15803D', fontWeight: 600 }}>Online</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 2 }}>Srikakulam to Tirupati</div>
          </div>

          {/* Metric 4 */}
          <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Water Quality Index</span>
              <CheckCircle2 size={14} style={{ color: '#1D4ED8' }} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942' }}>
              88.4 <span style={{ fontSize: '0.82rem', color: '#15803D', fontWeight: 600 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 600, marginTop: 2 }}>Class B Non-Potable Compliant</div>
          </div>
        </div>
      </div>

      {/* ─── 3. Regulatory Violation Notice (Alert when active) ────────────── */}
      {isViolation && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderLeft: '4px solid #B91C1C',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertOctagon size={20} style={{ color: '#B91C1C', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#991B1B' }}>
                Sample Threshold Exceeded: Demo Routing Switched to Sewer Bypass
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7F1D1D' }}>
                Organic or suspended solids limit breached. Water diversion safely locked out.
              </div>
            </div>
          </div>

          <button
            onClick={() => openChallan('auto')}
            className="btn-danger"
            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            View Demo Report
          </button>
        </div>
      )}

      {/* ─── 4. Top 6 Key Metric Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <MetricCard
          title="Current Water Quality"
          value={latestTelemetry ? `${latestTelemetry.pH.toFixed(2)} pH` : '7.40 pH'}
          subtitle={`Turbidity: ${latestTelemetry?.TUR_NTU || 28.5} NTU`}
          icon={Droplet}
          accentColor="#0F2942"
          badge={<StatusBadge label={summary?.source || 'Bathroom'} />}
        />

        <MetricCard
          title="AI Predicted Route"
          value={summary?.predictedRoute || 'Restricted Irrigation'}
          subtitle={`Confidence: ${((summary?.confidence || 0.94) * 100).toFixed(0)}%`}
          icon={GitFork}
          accentColor="#1D4ED8"
          badge={<StatusBadge label={summary?.predictedRoute || 'PERMITTED REUSE'} />}
        />

        <MetricCard
          title="Final Arbitrated Route"
          value={summary?.finalRoute || 'Restricted Irrigation'}
          subtitle={`Action: ${summary?.finalAction || 'COMPLIANT'}`}
          icon={CheckCircle2}
          accentColor={isViolation ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={isViolation ? 'VIOLATION - SEWER OVERRIDE' : (summary?.finalAction || 'COMPLIANT')} />}
        />

        <MetricCard
          title="Anomaly Screening"
          value={summary?.anomalyStatus || 'NORMAL'}
          subtitle={`Isolation Score: ${(summary?.anomalyScore || 0.04).toFixed(3)}`}
          icon={AlertTriangle}
          accentColor={summary?.anomalyStatus === 'NORMAL' ? '#15803D' : '#D97706'}
          badge={<StatusBadge label={summary?.anomalyStatus || 'NORMAL'} />}
        />

        <MetricCard
          title="Storage Tank Level"
          value={`${summary?.tankLevelLiters || 250.0} L`}
          subtitle={`Capacity: ${summary?.tankCapacityLiters || 1000} L (${summary?.fillPercentage || 25}%)`}
          icon={Database}
          accentColor="#4338CA"
          badge={<StatusBadge label={`${summary?.fillPercentage || 25}% Full`} />}
        />

        <MetricCard
          title="Weather Context"
          value={summary?.weatherCondition || 'Clear'}
          subtitle={`Rainfall: ${summary?.rainfallMm || 0} mm`}
          icon={CloudSun}
          accentColor="#D97706"
          badge={<StatusBadge label={summary?.rainfallMm >= 5 ? 'DEFERRED - MONSOON' : 'COMPLIANT'} />}
        />
      </div>

      {/* ─── 5. Decision Pipeline Visualizer ─────────────────────────────────── */}
      <DecisionPipelineVisualizer analysis={latestAnalysis} />

      {/* ─── 6. Analytics & Explainability ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 18 }}>
        {/* Telemetry Trend Graph */}
        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                Water Quality Telemetry History
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                Real-time tracking of pH, Turbidity (NTU), and COD (mg/L).
              </p>
            </div>
            <Activity size={18} style={{ color: '#0F2942' }} />
          </div>

          <div style={{ width: '100%', height: 260, backgroundColor: '#FFFFFF' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryTrends} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke={ct.axisStroke}
                  tickFormatter={(t) => (t ? t.split(' ')[1] || t.slice(11, 16) : '')}
                  tick={{ fontSize: 11, fill: ct.tickFill }}
                />
                <YAxis stroke={ct.axisStroke} tick={{ fontSize: 11, fill: ct.tickFill }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 4,
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                <Line type="monotone" dataKey="pH" stroke={ct.colorPrimary} strokeWidth={2} dot={false} name="pH" />
                <Line type="monotone" dataKey="TUR_NTU" stroke={ct.colorWarning} strokeWidth={2} dot={false} name="Turbidity (NTU)" />
                <Line type="monotone" dataKey="COD_mg_L" stroke={ct.colorDanger} strokeWidth={2} dot={false} name="COD (mg/L)" />
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

      {/* ─── 7. Auto-Challan Regulatory Modal ───────────────────────────────── */}
      <RegulatoryChallanModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        telemetry={latestTelemetry}
        analysis={latestAnalysis}
        initialScenario={challanScenario}
      />
    </div>
  );
};

export default DashboardPage;
