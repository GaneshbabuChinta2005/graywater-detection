import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export const ShapWaterfallChart = ({ shapData, predictedRoute, confidence }) => {
  if (!shapData || !shapData.predicted_class_contributions) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No SHAP attribution data loaded for this observation.
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
    direction: item.shap_value >= 0 ? 'Pushes Toward Class' : 'Pushes Away From Class',
    color: item.shap_value >= 0 ? '#10b981' : '#f43f5e'
  }));

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            SHAP Local Feature Contributions (TreeExplainer Attribution)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Shows how each physicochemical sensor pushed model log-odds towards{' '}
            <span style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>{predictedRoute || 'Predicted Class'}</span>.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Value (Base)</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--violet-500)', fontFamily: 'var(--font-mono)' }}>
            {shapData.base_value !== undefined ? shapData.base_value.toFixed(4) : '0.0000'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 320, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 120, bottom: 5 }}
          >
            <XAxis type="number" stroke="#64748b" tickFormatter={(v) => v.toFixed(2)} />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#94a3b8"
              tick={{ fontSize: 12, fill: '#cbd5e1' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
                        {data.feature}
                      </div>
                      <div style={{ color: '#94a3b8' }}>
                        Sensor Value: <strong style={{ color: '#fff' }}>{data.value}</strong>
                      </div>
                      <div style={{ color: data.color, fontWeight: 600 }}>
                        SHAP Attribution: {data.shapValue > 0 ? `+${data.shapValue}` : data.shapValue}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                        {data.direction}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
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
          padding: '12px 16px',
          background: 'rgba(139, 92, 246, 0.05)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          lineHeight: 1.4
        }}
      >
        <strong style={{ color: '#c084fc' }}>SCIENTIFIC CLARIFICATION:</strong> SHAP values explain
        feature contributions to the trained XGBoost mathematical output. They do NOT establish causality,
        biological mechanisms, or regulatory compliance. Final routing is governed by deterministic safety rules.
      </div>
    </div>
  );
};

export default ShapWaterfallChart;
