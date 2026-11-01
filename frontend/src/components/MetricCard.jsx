import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  badge = null,
  accentColor = '#0F2942',
  onClick = null
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 135,
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}
      onClick={onClick}
    >
      {/* Top Government Accent Border Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: accentColor
        }}
      />

      {/* Card Header: Title & Official Icon */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1.2
            }}
          >
            {title}
          </span>
          {Icon && (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon size={16} />
            </div>
          )}
        </div>

        {/* Primary Value Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: String(value || '').length > 15 ? '1.15rem' : String(value || '').length > 11 ? '1.35rem' : '1.55rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflow: 'hidden'
            }}
          >
            {value !== undefined && value !== null ? value : '--'}
          </span>
          {unit && (
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, flexShrink: 0 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Subtitle & Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginTop: 'auto',
          paddingTop: 8,
          borderTop: '1px solid #F1F5F9'
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            color: '#64748B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {subtitle || '—'}
        </span>
        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
