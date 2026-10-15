import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  badge = null,
  accentColor = 'var(--primary)',
  onClick = null
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 140
      }}
      onClick={onClick}
    >
      {/* Subtle Top Accent Line */}
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

      {/* Card Header: Title & Icon */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: String(value || '').length > 15 ? '1.15rem' : String(value || '').length > 11 ? '1.35rem' : '1.65rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflow: 'hidden'
            }}
          >
            {value !== undefined && value !== null ? value : '--'}
          </span>
          {unit && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Subtitle & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitle || '—'}
        </span>
        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
