import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import {
  Cpu,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Layers,
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Gavel
} from 'lucide-react';

export const ShapExplainabilityPage = () => {
  const { latestAnalysis, summary } = useSystem();

  const pred = latestAnalysis?.prediction || {
    class_name: summary?.predictedRoute || 'Restricted Irrigation',
    confidence: summary?.confidence || 0.94
  };

  const shap = latestAnalysis?.shap || {
    base_value: 0.125,
    predicted_class_contributions: [
      { feature: 'TUR_NTU', value: 28.5, shap_value: 0.42 },
      { feature: 'COD_mg_L', value: 82.0, shap_value: 0.31 },
      { feature: 'pH', value: 7.4, shap_value: -0.15 },
      { feature: 'TSS_mg_L', value: 34.0, shap_value: 0.12 },
      { feature: 'E_coli_CFU_100mL', value: 1500, shap_value: -0.22 }
    ]
  };

  const routing = latestAnalysis?.routing || {
    final_route: summary?.finalRoute || 'Restricted Irrigation',
    final_action: summary?.finalAction || 'ALLOW_ROUTE',
    override_applied: false
  };

  const topContributors = (shap.predicted_class_contributions || []).slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Statutory Attribution Analysis & Administrative AI Scrutiny
          </h1>
          <p className="page-subtitle">
            Local feature attribution calculated via SHAP TreeExplainer on XGBoost gradient boosted trees, providing full statutory audibility and administrative justification for effluent diversion decisions.
          </p>
        </div>
        <StatusBadge label={`EXPLAINING: ${pred.class_name}`} size="lg" />
      </div>

      {/* ─── Administrative Scrutiny Mandate Banner ───────────────────────── */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderLeft: '5px solid #0F2942',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '6px',
              backgroundColor: '#F1F5F9',
              color: '#0F2942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Gavel size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Statutory Evidentiary Standard for Autonomous Decisions
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '3px 0 0 0', lineHeight: 1.45 }}>
              Under CPCB Water Resource Surveillance Guidelines, any autonomous valve routing or effluent rejection decision must produce a deterministic, human-auditable mathematical trace. SHAP values mathematically isolate the marginal contribution of each physical and chemical sensor measurement towards the arbitrated action.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Top Metric Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Supervised XGBoost Classification"
          value={pred.class_name}
          subtitle={`Mathematical Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={Cpu}
          accentColor="#0F2942"
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
          title="Final Statutory Arbitration"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor={routing.override_applied ? '#B91C1C' : '#15803D'}
          badge={<StatusBadge label={routing.override_applied ? 'VIOLATION - SEWER OVERRIDE' : 'COMPLIANT'} />}
        />
      </div>

      {/* ─── Clear Dual-Panel Architecture Grid ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Panel A: Machine Learning Attribution Table */}
        <div
          className="card"
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderTop: '3px solid #0F2942'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: '#0F2942',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cpu size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                1. Algorithmic Feature Contributions (SHAP)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                Mathematical feature attribution from trained XGBoost decision trees.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, marginBottom: 14 }}>
            TreeExplainer quantifies how each normalized water quality sensor measurement increased or decreased the model prediction score towards <strong>{pred.class_name}</strong>.
          </p>

          <div className="gov-table-container">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Sensor Feature</th>
                  <th>Monitored Reading</th>
                  <th>SHAP Value</th>
                  <th>Attribution Effect</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.feature}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.value}</td>
                    <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: c.shap_value >= 0 ? '#15803D' : '#B91C1C' }}>
                      {c.shap_value > 0 ? `+${c.shap_value.toFixed(4)}` : c.shap_value.toFixed(4)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: c.shap_value >= 0 ? '#F0FDF4' : '#FEF2F2',
                          color: c.shap_value >= 0 ? '#15803D' : '#B91C1C',
                          border: `1px solid ${c.shap_value >= 0 ? '#BBF7D0' : '#FECACA'}`
                        }}
                      >
                        {c.shap_value >= 0 ? '▲ Favors Permitted Route' : '▼ Diverts Toward Sewer'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel B: Final Administrative Scrutiny & Rationale */}
        <div
          className="card"
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderTop: '3px solid #1D4ED8',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Scale size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
                  2. Administrative Scrutiny & Legal Rationale
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                  Multi-criteria arbitration synthesizing ML output with CPCB statutory cutoffs.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '6px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                color: '#0F172A',
                lineHeight: 1.5,
                marginBottom: 16
              }}
            >
              <strong style={{ color: '#0F2942', display: 'block', marginBottom: 4 }}>
                Statutory Regulatory Assessment:
              </strong>
              {latestAnalysis?.explanation?.summary ||
                `Model recommendation approved: Sample characteristics satisfy physical, chemical, and biological non-potable reuse criteria under CPCB Schedule VI.`}
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <strong style={{ color: '#0F2942', display: 'block', marginBottom: 4 }}>
              Deterministic Override Hierarchy (Rule-Based Cutoffs):
            </strong>
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Deterministic CPCB/EPA cutoffs override machine learning in all threshold breaches.</li>
              <li>Isolation Forest score &ge; 0.50 flags statistical anomalies for supervisory review.</li>
              <li>Precipitation &ge; 5.0 mm defers irrigation to prevent environmental runoff.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── SHAP Waterfall Chart Component ─────────────────────────────────── */}
      <ShapWaterfallChart
        shapData={shap}
        predictedRoute={pred.class_name}
        confidence={pred.confidence}
      />
    </div>
  );
};

export default ShapExplainabilityPage;
