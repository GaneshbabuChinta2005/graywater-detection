import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Layers,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  LineChart as ChartIcon,
  Filter,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  getPlaceById,
  getPlaceStations,
  getPlaceWaterQuality,
  getPlaceHistory,
  exportPlaceCsvUrl
} from '../services/api';
import { useChartTheme } from '../hooks/useChartTheme';

export const PlaceDetailsPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const chartTheme = useChartTheme();

  const [place, setPlace] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [waterQuality, setWaterQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Historical Chart State
  const [activeParam, setActiveParam] = useState('BOD');
  const [historyRange, setHistoryRange] = useState('1y');
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const parameterMeta = {
    BOD: {
      fullName: 'Biochemical Oxygen Demand',
      unit: 'mg/L',
      refLimit: '<= 3.0 mg/L',
      standard: 'CPCB Class C / Bathing Water Criteria',
      description: 'Quantifies dissolved oxygen consumed by biological decomposition of organic matter.'
    },
    COD: {
      fullName: 'Chemical Oxygen Demand',
      unit: 'mg/L',
      refLimit: '<= 250.0 mg/L',
      standard: 'EPA / CPCB General Effluent Guidelines',
      description: 'Measures total chemically oxidizable matter, indicating organic and industrial loading.'
    },
    TSS: {
      fullName: 'Total Suspended Solids',
      unit: 'mg/L',
      refLimit: '<= 100.0 mg/L',
      standard: 'CPCB Environmental Protection Criteria',
      description: 'Measures particles suspended in water that reduce light penetration and clarity.'
    },
    pH: {
      fullName: 'pH (Hydrogen Ion Potential)',
      unit: 'pH units',
      refLimit: '6.5 - 8.5',
      standard: 'CPCB Designated Best Use Class C / IS 2296',
      description: 'Indicates acidity or alkalinity of the water body to support aquatic life.'
    },
    Faecal_Coliform: {
      fullName: 'Faecal Coliform',
      unit: 'MPN/100mL',
      refLimit: '<= 500 desirable (max 2500)',
      standard: 'CPCB Class B / Primary Water Quality Standard',
      description: 'Biological indicator bacteria of warm-blooded origin assessing microbial safety.'
    }
  };

  // Initial Load of Location & Stations
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([getPlaceById(placeId), getPlaceStations(placeId)])
      .then(([locRes, stationsRes]) => {
        if (!mounted) return;
        if (locRes && locRes.place) {
          setPlace(locRes.place);
        } else {
          setError(`Location '${placeId}' could not be found.`);
        }

        if (stationsRes && stationsRes.stations) {
          setStations(stationsRes.stations);
          if (stationsRes.stations.length > 0) {
            // Default to first station or all stations
            setSelectedStationId(stationsRes.stations[0].station_id);
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('[PlaceDetails] Load error:', err);
          setError(err.response?.data?.error || `Failed to load details for ${placeId}.`);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [placeId]);

  // Load Water Quality for current location and selected station
  const fetchWaterQuality = async (stationId = selectedStationId) => {
    try {
      setRefreshing(true);
      const res = await getPlaceWaterQuality(placeId, stationId || null);
      if (res && res.water_quality) {
        setWaterQuality(res.water_quality);
      }
    } catch (err) {
      console.error('[PlaceDetails] Water quality fetch error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load Historical Trends when activeParam, selectedStationId, or historyRange changes
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getPlaceHistory(placeId, {
        parameter: activeParam,
        station_id: selectedStationId || null,
        range: historyRange
      });
      if (res && res.history) {
        setHistoryData(res.history);
      }
    } catch (err) {
      console.error('[PlaceDetails] History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      fetchWaterQuality(selectedStationId);
    }
  }, [placeId, selectedStationId]);

  useEffect(() => {
    if (placeId) {
      fetchHistory();
    }
  }, [placeId, selectedStationId, activeParam, historyRange]);

  const selectedStationObj = stations.find((s) => s.station_id === selectedStationId);

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '40px 24px', maxWidth: '1560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 40 }}>
          Loading monitoring station data for {placeId}...
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="page-container" style={{ padding: '40px 24px', maxWidth: '1560px', margin: '0 auto' }}>
        <div
          style={{
            padding: '30px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            textAlign: 'center',
            color: 'var(--danger)'
          }}
        >
          <AlertCircle size={36} style={{ marginBottom: 12 }} />
          <h2 style={{ margin: '0 0 8px 0' }}>Location Not Found</h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem' }}>{error || 'The requested Andhra Pradesh location could not be located.'}</p>
          <button
            onClick={() => navigate('/places')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Andhra Pradesh Places
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link
          to="/places"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={16} />
          <span>Back to Andhra Pradesh Locations</span>
        </Link>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchWaterQuality(selectedStationId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <a
            href={exportPlaceCsvUrl(placeId, selectedStationId || null)}
            download
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Hero Location Header */}
      <div
        style={{
          padding: '24px 28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-subtle)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {place.district_name} District
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Andhra Pradesh, India
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {place.city_name}
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '900px', lineHeight: 1.5 }}>
              {place.description}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Monitoring Stations
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {stations.length}
              </div>
            </div>

            <div
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                CPCB / APPCB Source
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> Verified Active
              </div>
            </div>
          </div>
        </div>

        {/* Station Selector Bar */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Building2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Sampling Station:
            </span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                minWidth: '280px'
              }}
            >
              {stations.map((s) => (
                <option key={s.station_id} value={s.station_id}>
                  {s.station_name} ({s.station_id})
                </option>
              ))}
            </select>
          </div>

          {selectedStationObj && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>Water Body: <strong>{selectedStationObj.water_body_name}</strong></span>
              <span>•</span>
              <span>Coordinates: <strong>{selectedStationObj.latitude.toFixed(4)}°N, {selectedStationObj.longitude.toFixed(4)}°E</strong></span>
              <span>•</span>
              <span>Type: <strong>{selectedStationObj.sample_type}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Prominent 5 Parameter Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Official Surface Water Quality Parameters
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Latest measured values evaluated against CPCB Designated Best Use / Primary Surface Water Quality Standards.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16
          }}
        >
          {['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'].map((param) => {
            const data = waterQuality ? waterQuality[param] : null;
            const meta = parameterMeta[param];

            const isAvailable = data && data.is_available;
            const formattedDate = data?.sample_date
              ? new Date(data.sample_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : null;

            return (
              <div
                key={param}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-color)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Parameter Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                      {param}
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {meta.fullName}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  {isAvailable ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor:
                          data.compliance_class === 'success'
                            ? 'var(--success-bg)'
                            : data.compliance_class === 'warning'
                            ? 'var(--warning-bg)'
                            : 'var(--danger-bg)',
                        color:
                          data.compliance_class === 'success'
                            ? 'var(--success)'
                            : data.compliance_class === 'warning'
                            ? 'var(--warning)'
                            : 'var(--danger)',
                        border: `1px solid ${
                          data.compliance_class === 'success'
                            ? 'var(--success-border)'
                            : data.compliance_class === 'warning'
                            ? 'var(--warning-border)'
                            : 'var(--danger-border)'
                        }`
                      }}
                    >
                      {data.compliance_status}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      Data Not Available
                    </span>
                  )}
                </div>

                {/* Main Value Display */}
                <div style={{ margin: '4px 0' }}>
                  {isAvailable ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {data.value}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {data.unit}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        color: 'var(--text-muted)',
                        fontSize: '0.88rem',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Info size={16} />
                      <span>Data Not Available (Pending Station Sampling)</span>
                    </div>
                  )}
                </div>

                {/* Sub details: Sample Date & Standard */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sampling Date:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formattedDate || '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Standard Limit:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {meta.refLimit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Water Quality Details Table (Section 7) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '22px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Water Quality Details Table
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Summary record populated strictly from official monitoring records. Missing parameters are identified explicitly.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Parameter</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Latest Value</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Unit</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sample Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Regulatory Reference</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'].map((param, idx) => {
                const data = waterQuality ? waterQuality[param] : null;
                const meta = parameterMeta[param];
                const isAvailable = data && data.is_available;

                return (
                  <tr
                    key={param}
                    style={{
                      borderBottom: idx < 4 ? '1px solid var(--border-subtle)' : 'none',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-surface-subtle)'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{param}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{meta.fullName}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: isAvailable ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {isAvailable ? data.value : 'Data Not Available'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {isAvailable ? data.unit : meta.unit}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {isAvailable && data.sample_date
                        ? new Date(data.sample_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {meta.refLimit} ({meta.standard})
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isAvailable ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              data.compliance_class === 'success'
                                ? 'var(--success-bg)'
                                : data.compliance_class === 'warning'
                                ? 'var(--warning-bg)'
                                : 'var(--danger-bg)',
                            color:
                              data.compliance_class === 'success'
                                ? 'var(--success)'
                                : data.compliance_class === 'warning'
                                ? 'var(--warning)'
                                : 'var(--danger)',
                            border: `1px solid ${
                              data.compliance_class === 'success'
                                ? 'var(--success-border)'
                                : data.compliance_class === 'warning'
                                ? 'var(--warning-border)'
                                : 'var(--danger-border)'
                            }`
                          }}
                        >
                          {data.compliance_status}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Data Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Water Quality Analysis (Section 8) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChartIcon size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Historical Water Quality Analysis & Time-Series Trends
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Empirical historical sampling timeline for {place.city_name}. Gaps reflect real periods between official monitoring rounds.
            </p>
          </div>

          {/* Date Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-app)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1 Year' },
              { id: 'all', label: 'All History' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setHistoryRange(r.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: historyRange === r.id ? 'var(--primary)' : 'transparent',
                  color: historyRange === r.id ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter Selector Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['BOD', 'COD', 'TSS', 'pH', 'Faecal_Coliform'].map((param) => {
            const isSelected = activeParam === param;
            return (
              <button
                key={param}
                onClick={() => setActiveParam(param)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-app)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{param}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({parameterMeta[param].unit})</span>
              </button>
            );
          })}
        </div>

        {/* Recharts Timeline */}
        <div style={{ width: '100%', height: 320, position: 'relative' }}>
          {historyLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Loading historical readings...
            </div>
          ) : historyData.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <Info size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No historical readings found for {activeParam} under this station.</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>This parameter may not be sampled at this specific station.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="paramFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="formatted_date" stroke={chartTheme.axis} fontSize={12} tickLine={false} />
                <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} unit={` ${parameterMeta[activeParam].unit}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: 8,
                    color: chartTheme.tooltipText
                  }}
                  formatter={(val) => [`${val} ${parameterMeta[activeParam].unit}`, `${activeParam}`]}
                  labelFormatter={(label) => `Sampling Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#paramFill)"
                  connectNulls={false}
                  dot={{ r: 4, fill: 'var(--primary)', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart Explanatory Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} />
          <span>
            Data points connect actual validated government sampling rounds. Gaps reflect inter-campaign sampling intervals without synthetic interpolation.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailsPage;

