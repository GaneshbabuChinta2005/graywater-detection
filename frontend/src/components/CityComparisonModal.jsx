import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Check,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { comparePlaces } from '../services/api';
import { useChartTheme } from '../hooks/useChartTheme';

export const CityComparisonModal = ({ isOpen, onClose, allLocations = [], initialSelected = [] }) => {
  const chartTheme = useChartTheme();
  const [selectedIds, setSelectedIds] = useState(
    initialSelected.length >= 2 ? initialSelected : ['visakhapatnam', 'vijayawada']
  );
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeParam, setActiveParam] = useState('BOD');

  const parameterKeys = [
    { key: 'BOD', label: 'BOD (mg/L)', maxRef: 3.0 },
    { key: 'COD', label: 'COD (mg/L)', maxRef: 250.0 },
    { key: 'TSS', label: 'TSS (mg/L)', maxRef: 100.0 },
    { key: 'pH', label: 'pH (pH units)', minRef: 6.5, maxRef: 8.5 },
    { key: 'Faecal_Coliform', label: 'Faecal Coliform (MPN/100mL)', maxRef: 2500 }
  ];

  const handleToggleCity = (locId) => {
    setSelectedIds((prev) => {
      if (prev.includes(locId)) {
        if (prev.length <= 2) return prev; // Keep at least 2
        return prev.filter((id) => id !== locId);
      } else {
        if (prev.length >= 5) return prev; // Limit to 5 for clean readability
        return [...prev, locId];
      }
    });
  };

  useEffect(() => {
    if (!isOpen || selectedIds.length < 2) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    comparePlaces(selectedIds)
      .then((res) => {
        if (mounted && res && res.comparison) {
          setComparisonData(res.comparison);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('[CityComparison] Fetch error:', err);
          setError('Failed to fetch comparison data. Please try again.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  // Prepare chart dataset for active parameter
  const chartData = comparisonData?.cities.map((city) => {
    const item = city.parameters[activeParam];
    return {
      cityName: city.city_name,
      value: item && item.is_available ? item.value : 0,
      isAvailable: item ? item.is_available : false,
      unit: item ? item.unit : '',
      sampleDate: item?.sample_date
        ? new Date(item.sample_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : 'N/A'
    };
  }) || [];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-City Water Quality Comparison
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Side-by-side comparative analysis of official CPCB/APPCB surface water parameters across selected locations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* City Selection Pills */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Select Locations to Compare (Select 2 to 5 cities):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allLocations.map((loc) => {
                const isSelected = selectedIds.includes(loc.location_id);
                return (
                  <button
                    key={loc.location_id}
                    onClick={() => handleToggleCity(loc.location_id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    <span>{loc.city_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading comparison data...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              {error}
            </div>
          ) : comparisonData ? (
            <>
              {/* Comparative Chart */}
              <div
                style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Comparative Parameter Distribution
                    </span>
                  </div>

                  {/* Parameter Selector */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {parameterKeys.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setActiveParam(p.key)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: activeParam === p.key ? 'var(--primary)' : 'var(--bg-surface)',
                          color: activeParam === p.key ? '#FFFFFF' : 'var(--text-secondary)',
                          boxShadow: activeParam === p.key ? 'var(--shadow-xs)' : 'none'
                        }}
                      >
                        {p.key}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis dataKey="cityName" stroke={chartTheme.axis} fontSize={12} tickLine={false} />
                      <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBg,
                          borderColor: chartTheme.tooltipBorder,
                          borderRadius: 8,
                          color: chartTheme.tooltipText
                        }}
                        formatter={(val, name, props) => {
                          if (!props.payload.isAvailable) return ['Data Not Available', activeParam];
                          return [`${val} ${props.payload.unit}`, `${activeParam} (Sampled: ${props.payload.sampleDate})`];
                        }}
                      />
                      <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} name={activeParam} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Matrix Table */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Detailed Side-by-Side Parameter Matrix
                </h4>
                <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Water Parameter</th>
                        {comparisonData.cities.map((city) => (
                          <th key={city.location_id} style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {city.city_name}
                            <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                              {city.district_name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.matrix.map((row, idx) => (
                        <tr
                          key={row.parameter_key}
                          style={{
                            borderBottom: idx < comparisonData.matrix.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-surface-subtle)'
                          }}
                        >
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {row.parameter_name}
                          </td>
                          {comparisonData.cities.map((city) => {
                            const cell = row[city.location_id];
                            if (!cell || !cell.is_available) {
                              return (
                                <td key={city.location_id} style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                                  <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Data Not Available</span>
                                </td>
                              );
                            }
                            return (
                              <td key={city.location_id} style={{ padding: '10px 14px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {cell.value} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>{cell.unit}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {new Date(cell.sample_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-surface-subtle)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityComparisonModal;

