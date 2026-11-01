import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';
<<<<<<< HEAD
import { Info } from 'lucide-react';

export const ShapWaterfallChart = ({ shapData, predictedRoute, confidence }) => {
  const ct = useChartTheme();
  if (!shapData || !shapData.predicted_class_contributions) {
    return (
      <div className="card" style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Info size={28} style={{ color: 'var(--text-muted)', marginBottom: 8, margin: '0 auto' }} />
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Attribution Data Available</div>
        <p style={{ fontSize: '0.85rem' }}>Run a manual analysis or simulation step to compute SHAP TreeExplainer attributions.</p>
=======
import { Info, Scale } from 'lucide-react';

export const ShapWaterfallChart = ({ shapData, predictedRoute, confidence }) => {
  const ct = useChartTheme();

  if (!shapData || !shapData.predicted_class_contributions) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <Info size={24} style={{ color: '#94A3B8', marginBottom: 6, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>No Attribution Data Available</div>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Step digital twin to compute feature attributions.</p>
>>>>>>> myrepo/main
      </div>
    );
  }

  const rawContribs = shapData.predicted_class_contributions || [];
<<<<<<< HEAD
  const topContribs = rawContribs.slice(0, 8); // Top 8 contributors for clarity

  // Transform data for horizontal bar visualization
=======
  const topContribs = rawContribs.slice(0, 7);

>>>>>>> myrepo/main
  const chartData = topContribs.map(item => ({
    feature: item.feature,
    value: item.value,
    shapValue: parseFloat(item.shap_value.toFixed(4)),
<<<<<<< HEAD
    direction: item.shap_value >= 0 ? 'Pushes Toward Predicted Class' : 'Pushes Away From Predicted Class',
    color: item.shap_value >= 0 ? ct.colorSuccess : ct.colorDanger
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
=======
    direction: item.shap_value >= 0 ? 'Favors Reuse Approval' : 'Pushes to Sewer Diversion',
    color: item.shap_value >= 0 ? '#15803D' : '#B91C1C'
  }));

  return (
    <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={16} style={{ color: '#0F2942' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
              Statutory Attribution Analysis (SHAP)
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
            Impact of each parameter on classifying as <strong style={{ color: '#0F2942' }}>{predictedRoute || 'Predicted Class'}</strong>.
          </p>
        </div>

        <div style={{ backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Base Expected Value: </span>
          <strong style={{ fontSize: '0.85rem', color: '#0F2942', fontFamily: 'var(--font-mono)' }}>
            {shapData.base_value !== undefined ? shapData.base_value.toFixed(4) : '0.0000'}
          </strong>
        </div>
      </div>

      <div style={{ width: '100%', height: 260, backgroundColor: '#FFFFFF' }}>
>>>>>>> myrepo/main
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
<<<<<<< HEAD
            margin={{ top: 10, right: 20, left: 110, bottom: 5 }}
=======
            margin={{ top: 5, right: 25, left: 100, bottom: 5 }}
>>>>>>> myrepo/main
          >
            <XAxis
              type="number"
              stroke={ct.axisStroke}
              tick={{ fontSize: 11, fill: ct.tickFill }}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke={ct.axisStroke}
<<<<<<< HEAD
              tick={{ fontSize: 11, fill: ct.tickFillPrimary, fontWeight: 500 }}
=======
              tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
>>>>>>> myrepo/main
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
<<<<<<< HEAD
                        backgroundColor: 'var(--bg-surface)',
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
                      <div style={{ color: data.shapValue >= 0 ? ct.colorSuccess : ct.colorDanger, fontWeight: 700 }}>
                        SHAP Value: {data.shapValue > 0 ? `+${data.shapValue}` : data.shapValue}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
=======
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0F2942', marginBottom: 2 }}>
                        {data.feature}: {data.value}
                      </div>
                      <div style={{ color: data.shapValue >= 0 ? '#15803D' : '#B91C1C', fontWeight: 700 }}>
                        SHAP Score: {data.shapValue > 0 ? `+${data.shapValue}` : data.shapValue}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
>>>>>>> myrepo/main
                        {data.direction}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
<<<<<<< HEAD
            <ReferenceLine x={0} stroke={ct.gridStroke} strokeDasharray="3 3" />
            <Bar dataKey="shapValue" radius={[4, 4, 4, 4]}>
=======
            <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
            <Bar dataKey="shapValue" radius={[0, 4, 4, 0]}>
>>>>>>> myrepo/main
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

<<<<<<< HEAD
      {/* Scientific Disclaimer Note */}
      <div
        style={{
          marginTop: 16,
          padding: '10px 14px',
          backgroundColor: 'var(--purple-bg)',
          border: '1px solid var(--purple-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--purple)',
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
=======
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #E2E8F0', fontSize: '0.72rem', color: '#64748B' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#15803D' }} />
            <span>Favors Reuse Approval</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#B91C1C' }} />
            <span>Pushes to Sewer Override</span>
          </span>
        </div>
        <span>CPCB Protocol 2026</span>
>>>>>>> myrepo/main
      </div>
    </div>
  );
};

export default ShapWaterfallChart;
