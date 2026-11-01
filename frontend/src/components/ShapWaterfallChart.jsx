import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';
import { Info, Scale } from 'lucide-react';

export const ShapWaterfallChart = ({ shapData, predictedRoute, confidence }) => {
  const ct = useChartTheme();

  if (!shapData || !shapData.predicted_class_contributions) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <Info size={24} style={{ color: '#94A3B8', marginBottom: 6, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>No Attribution Data Available</div>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Step digital twin to compute feature attributions.</p>
      </div>
    );
  }

  const rawContribs = shapData.predicted_class_contributions || [];
  const topContribs = rawContribs.slice(0, 7);

  const chartData = topContribs.map(item => ({
    feature: item.feature,
    value: item.value,
    shapValue: parseFloat(item.shap_value.toFixed(4)),
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 100, bottom: 5 }}
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
              tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
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
                        {data.direction}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
            <Bar dataKey="shapValue" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

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
      </div>
    </div>
  );
};

export default ShapWaterfallChart;
