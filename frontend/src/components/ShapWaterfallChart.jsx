import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Info } from 'lucide-react';

export const ShapWaterfallChart = ({ shapData, predictedRoute, confidence }) => {
  if (!shapData || !shapData.predicted_class_contributions) {
    return (
      <div className="card" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Info size={28} style={{ color: 'var(--text-muted)', marginBottom: 8, margin: '0 auto' }} />
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Attribution Data Available</div>
        <p style={{ fontSize: '0.85rem' }}>Run a manual analysis or simulation step to compute SHAP TreeExplainer attributions.</p>
      </div>
    );
  }

  const rawContribs = shapData.predicted_class_contributions || [];
  const topContribs = rawContribs.slice(0, 8); // Top 8 contributors for clarity

  // Transform data for horizontal bar visualization
  const chartData = topContribs.map(item => ({
    feature: item.feature,
    value: item.value,
    shapValue: parseFloat(item.shap_value.toFixed(4)),
    direction: item.shap_value >= 0 ? 'Pushes Toward Predicted Class' : 'Pushes Away From Predicted Class',
    color: item.shap_value >= 0 ? '#15803D' : '#B91C1C'
  }));

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            SHAP Local Feature Contributions
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            TreeExplainer attribution showing how physicochemical parameters pushed model log-odds towards{' '}
            <strong style={{ color: 'var(--primary)' }}>{predictedRoute || 'Predicted Class'}</strong>.
          </p>
        </div>
        <div style={{ textAlign: 'right', backgroundColor: 'var(--bg-surface-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Value (Base)</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>
            {shapData.base_value !== undefined ? shapData.base_value.toFixed(4) : '0.0000'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 300, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 110, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#94A3B8"
              tick={{ fontSize: 11, fill: '#17212F', fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {data.feature}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>
                        Sensor Measurement: <strong style={{ color: 'var(--text-primary)' }}>{data.value}</strong>
                      </div>
                      <div style={{ color: data.color, fontWeight: 700 }}>
                        SHAP Value: {data.shapValue > 0 ? `+${data.shapValue}` : data.shapValue}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {data.direction}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#94A3B8" strokeDasharray="3 3" />
            <Bar dataKey="shapValue" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Disclaimer Note */}
      <div
        style={{
          marginTop: 16,
          padding: '10px 14px',
          backgroundColor: 'var(--purple-bg)',
          border: '1px solid var(--purple-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: '#4C1D95',
          lineHeight: 1.4,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start'
        }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--purple)' }} />
        <div>
          <strong>SCIENTIFIC CLARIFICATION:</strong> SHAP values explain feature contributions to the trained XGBoost mathematical output. They do NOT establish causality, biological mechanisms, or regulatory compliance. Final routing is governed by deterministic safety rules.
        </div>
      </div>
    </div>
  );
};

export default ShapWaterfallChart;
