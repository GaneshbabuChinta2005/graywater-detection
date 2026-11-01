import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  subtitle = '',
  icon: Icon,
  badge = null,
<<<<<<< HEAD
  accentColor = 'var(--primary)',
=======
  accentColor = '#0F2942',
>>>>>>> myrepo/main
  onClick = null
}) => {
  return (
    <div
      className="card"
      style={{
<<<<<<< HEAD
        padding: '20px',
=======
        padding: '18px 20px',
>>>>>>> myrepo/main
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
<<<<<<< HEAD
        minHeight: 140
      }}
      onClick={onClick}
    >
      {/* Subtle Top Accent Line */}
=======
        minHeight: 135,
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}
      onClick={onClick}
    >
      {/* Top Government Accent Border Strip */}
>>>>>>> myrepo/main
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

<<<<<<< HEAD
      {/* Card Header: Title & Icon */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
=======
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
>>>>>>> myrepo/main
            {title}
          </span>
          {Icon && (
            <div
              style={{
<<<<<<< HEAD
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
=======
                width: 30,
                height: 30,
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
>>>>>>> myrepo/main
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
<<<<<<< HEAD
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: String(value || '').length > 15 ? '1.15rem' : String(value || '').length > 11 ? '1.35rem' : '1.65rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
=======
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: String(value || '').length > 15 ? '1.15rem' : String(value || '').length > 11 ? '1.35rem' : '1.55rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#0F172A',
>>>>>>> myrepo/main
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflow: 'hidden'
            }}
          >
            {value !== undefined && value !== null ? value : '--'}
          </span>
          {unit && (
<<<<<<< HEAD
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>
=======
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, flexShrink: 0 }}>
>>>>>>> myrepo/main
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Subtitle & Badge */}
<<<<<<< HEAD
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
=======
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
>>>>>>> myrepo/main
          {subtitle || '—'}
        </span>
        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
