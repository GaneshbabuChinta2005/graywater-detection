import React from 'react';
import { useSystem } from '../context/SystemContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import { Cpu, CheckCircle2, AlertOctagon, HelpCircle, Layers, Scale, Sparkles, ShieldCheck } from 'lucide-react';

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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            SHAP Feature Attribution & Algorithmic Explainability
          </h1>
          <p className="page-subtitle">
            Local feature attribution calculated via SHAP TreeExplainer on XGBoost trees, clarifying how each physical/chemical sensor pushed model log-odds.
          </p>
        </div>
        <StatusBadge label={`EXPLAINING: ${pred.class_name}`} size="lg" />
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <MetricCard
          title="XGBoost Predicted Class"
          value={pred.class_name}
          subtitle={`Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
          icon={Cpu}
          accentColor="var(--purple)"
          badge={<StatusBadge label={pred.class_name} />}
        />

        <MetricCard
          title="Arbitrated Final Decision"
          value={routing.final_route}
          subtitle={`Action: ${routing.final_action}`}
          icon={CheckCircle2}
          accentColor="var(--primary)"
          badge={<StatusBadge label={routing.override_applied ? 'OVERRIDDEN' : 'APPROVED'} />}
        />
      </div>

      {/* Clear Separation Architecture Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Box A: Model Explanation */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderTop: '3px solid var(--purple)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--purple-bg)',
                color: 'var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                1. Supervised Model Explanation (SHAP)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Mathematical feature attribution from trained XGBoost decision trees.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            TreeExplainer quantifies how each normalized water quality sensor measurement increased or decreased the model's prediction score towards <strong>{pred.class_name}</strong>.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Value</th>
                  <th>SHAP</th>
                  <th>Attribution</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.feature}</td>
                    <td>{c.value}</td>
                    <td style={{ fontWeight: 700, color: c.shap_value >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {c.shap_value > 0 ? `+${c.shap_value.toFixed(4)}` : c.shap_value.toFixed(4)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: c.shap_value >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: c.shap_value >= 0 ? 'var(--success)' : 'var(--danger)',
                          border: `1px solid ${c.shap_value >= 0 ? 'var(--success-border)' : 'var(--danger-border)'}`
                        }}
                      >
                        {c.shap_value >= 0 ? '▲ Pushes Toward' : '▼ Pushes Away'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Box B: Final Decision Explanation */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderTop: '3px solid var(--primary)',
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
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Scale size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Operational Decision Explanation
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Multi-criteria arbitration fusing ML output with physical and regulatory constraints.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                marginBottom: 16
              }}
            >
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>Human-Readable Audit Rationale:</strong>
              {latestAnalysis?.explanation?.summary ||
                `Model recommendation approved: Sample characteristics satisfy physical, chemical, and biological non-potable reuse criteria.`}
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Deterministic Override Precedence Rules:</strong>
            <ul style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.5 }}>
              <li>Deterministic EPA/WHO cutoffs override machine learning in all critical breaches.</li>
              <li>Isolation Forest score flags statistical anomalies for supervisory review.</li>
              <li>Precipitation &ge; 5.0 mm defers irrigation to prevent environmental runoff.</li>
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
