import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import { Cpu, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

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

  const topContributors = (shap.predicted_class_contributions || []).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          SHAP Feature Attribution & Algorithmic Transparency
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Exact mathematical contribution of each sensor parameter calculated via SHAP TreeExplainer on XGBoost.
        </p>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <MetricCard
          title="XGBoost Predicted Class"
          value={pred.class_name}
          subtitle={`Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={Cpu}
          accentColor="#8b5cf6"
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
          title="Arbitrated Final Decision"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor="#10b981"
          badge={<StatusBadge label={routing.override_applied ? 'OVERRIDDEN' : 'APPROVED'} />}
        />
      </div>

      {/* Clear Separation Architecture Box */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Box A: Model Explanation */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderTop: '4px solid #8b5cf6'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>🧠</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                1. Supervised Model Explanation (SHAP Attribution)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Mathematical feature attribution from the trained XGBoost decision trees.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16 }}>
            TreeExplainer quantifies how each normalized water quality sensor increased or decreased
            the model's prediction score towards <strong>{pred.class_name}</strong>.
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Observed Value</th>
                <th>SHAP Value</th>
                <th>Direction</th>
              </tr>
            </thead>
            <tbody>
              {topContributors.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.feature}</td>
                  <td>{c.value}</td>
                  <td style={{ fontWeight: 700, color: c.shap_value >= 0 ? '#34d399' : '#f87171' }}>
                    {c.shap_value > 0 ? `+${c.shap_value.toFixed(4)}` : c.shap_value.toFixed(4)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: c.shap_value >= 0 ? '#34d399' : '#f87171' }}>
                      {c.shap_value >= 0 ? '▲ Pushes Toward' : '▼ Pushes Away'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box B: Final Decision Explanation */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderTop: '4px solid #10b981'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>⚖️</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                2. Operational Decision Explanation (Safety Rules & Context)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Multi-criteria arbitration fusing ML output with physical and legal constraints.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.86rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              marginBottom: 16
            }}
          >
            <strong>Human-Readable Audit Rationale:</strong>
            <p style={{ marginTop: 6 }}>
              {latestAnalysis?.explanation?.summary ||
                `Model recommendation approved: Sample characteristics satisfy physical, chemical, and biological non-potable reuse criteria.`}
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Operational Constraint Rules:</strong>
            <ul style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.5 }}>
              <li>Deterministic EPA/WHO cutoffs override machine learning predictions in all critical breaches.</li>
              <li>Isolation Forest anomaly score flags statistical outliers for engineering review.</li>
              <li>Environmental rainfall &gt;= 5.0 mm defers irrigation to prevent surface runoff.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SHAP Waterfall Chart Component */}
      <ShapWaterfallChart
        shapData={shap}
        predictedRoute={pred.class_name}
        confidence={pred.confidence}
      />
    </div>
  );
};

export default ShapExplainabilityPage;
