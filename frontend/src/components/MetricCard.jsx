import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  badge = null,
  accentColor = 'var(--cyan-400)',
  onClick = null
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {/* Subtle Accent Glow Bar on top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subtitle && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
        {badge}
      </div>
    </div>
  );
};

export default MetricCard;
