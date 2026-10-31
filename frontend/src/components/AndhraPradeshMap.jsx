import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Eye, CheckCircle2, AlertCircle, Building2, Calendar, Waves } from 'lucide-react';

/**
 * Interactive SVG Map of Andhra Pradesh
 * Mathematically maps geographic coordinates (Lat 12.6°N - 19.3°N, Lon 76.5°E - 85.0°E)
 * Displays the 10 predefined monitoring locations with interactive pin selection,
 * popups, station counts, and routing to location details.
 */
export const AndhraPradeshMap = ({ locations = [], selectedLocationId = null, onSelectLocation }) => {
  const navigate = useNavigate();
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [activePin, setActivePin] = useState(selectedLocationId);

  // Coordinate boundary limits for Andhra Pradesh
  const minLon = 76.6;
  const maxLon = 84.8;
  const minLat = 12.6;
  const maxLat = 19.2;

  const svgWidth = 840;
  const svgHeight = 520;
  const padding = 45;

  const project = (lat, lon) => {
    const x = padding + ((lon - minLon) / (maxLon - minLon)) * (svgWidth - 2 * padding);
    const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (svgHeight - 2 * padding);
    return { x, y };
  };

  const handlePinClick = (loc) => {
    setActivePin(loc.location_id);
    if (onSelectLocation) onSelectLocation(loc.location_id);
  };

  const activeLocData = locations.find(l => l.location_id === (activePin || hoveredLocation));

  return (
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
      {/* Map Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Geographic Monitoring Map (Andhra Pradesh)
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time geospatial distribution of 10 CPCB/APPCB surface water sampling regions.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            <span>Data Verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
            <span>River / Coastal Basin</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 320px)', gap: 24, alignItems: 'start' }}>
        {/* SVG Map Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '440px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: '100%', userSelect: 'none' }}
          >
            {/* Background Grid Lines */}
            <defs>
              <pattern id="apMapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
              <linearGradient id="apCoastGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#apMapGrid)" />

            {/* Stylized Outline of Andhra Pradesh */}
            <path
              d="M 120 280 
                 C 140 220, 190 200, 240 230
                 C 290 250, 360 210, 420 220
                 C 480 230, 540 180, 580 150
                 C 630 110, 710 60, 780 40
                 C 790 60, 770 100, 730 140
                 C 690 180, 640 220, 600 270
                 C 550 330, 490 380, 440 430
                 C 400 470, 350 490, 310 490
                 C 270 490, 240 450, 220 400
                 C 180 390, 140 370, 110 320 Z"
              fill="url(#apCoastGradient)"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              strokeOpacity="0.6"
            />

            {/* Major River Flow Indicative Paths (Godavari & Krishna) */}
            {/* Godavari */}
            <path
              d="M 460 170 Q 520 180 580 220 T 630 260"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            {/* Krishna */}
            <path
              d="M 280 290 Q 360 270 430 290 T 520 330"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            {/* Tungabhadra */}
            <path
              d="M 150 280 Q 210 270 270 290"
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />

            {/* Bay of Bengal Annotation */}
            <text x="680" y="360" fill="var(--text-muted)" fontSize="13" fontWeight="600" opacity="0.6" letterSpacing="2">
              BAY OF BENGAL
            </text>

            {/* Interactive Location Markers */}
            {locations.map((loc) => {
              const { x, y } = project(loc.latitude, loc.longitude);
              const isSelected = (activePin || selectedLocationId) === loc.location_id;
              const isHovered = hoveredLocation === loc.location_id;

              return (
                <g
                  key={loc.location_id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  onClick={() => handlePinClick(loc)}
                  onMouseEnter={() => setHoveredLocation(loc.location_id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Outer pulse when active */}
                  {(isSelected || isHovered) && (
                    <circle
                      r="16"
                      fill="var(--primary)"
                      opacity="0.25"
                      style={{ animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    r={isSelected ? 9 : isHovered ? 8 : 6.5}
                    fill={isSelected ? 'var(--primary)' : 'var(--bg-surface)'}
                    stroke={isSelected ? '#FFFFFF' : 'var(--primary)'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                  />

                  {/* Inner dot */}
                  <circle
                    r="2.5"
                    fill={isSelected ? '#FFFFFF' : 'var(--primary)'}
                  />

                  {/* City Label */}
                  <text
                    x="12"
                    y="4"
                    fill="var(--text-primary)"
                    fontSize={isSelected ? '12' : '11'}
                    fontWeight={isSelected ? '700' : '600'}
                    filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.25))"
                  >
                    {loc.city_name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected City Info Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            height: '100%'
          }}
        >
          {activeLocData ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-subtle)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {activeLocData.district_name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--success)'
                    }}
                  >
                    <CheckCircle2 size={13} /> Active Monitoring
                  </span>
                </div>
                <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeLocData.city_name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {activeLocData.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Building2 size={13} />
                    <span>Stations</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {activeLocData.station_count || 2} Active
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Calendar size={13} />
                    <span>Latest Sample</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                    {activeLocData.latest_sample_date
                      ? new Date(activeLocData.latest_sample_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                      : 'Recent'}
                  </div>
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <MapPin size={14} style={{ color: 'var(--primary)' }} />
                <span>
                  Lat: <strong>{activeLocData.latitude.toFixed(4)}°N</strong> | Lon: <strong>{activeLocData.longitude.toFixed(4)}°E</strong>
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate(`/places/${activeLocData.location_id}`)}
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
              >
                <Eye size={16} />
                <span>View Water Quality Details</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MapPin size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>Hover or click any location pin on the map to inspect regional data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AndhraPradeshMap;

