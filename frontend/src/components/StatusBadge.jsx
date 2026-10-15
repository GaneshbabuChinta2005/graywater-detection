import React from 'react';

export const StatusBadge = ({ label, type = 'default', size = 'sm' }) => {
  const norm = String(label || '').toLowerCase();

  let badgeClass = 'badge-info';
  if (
    norm.includes('safe') ||
    norm.includes('indoor') ||
    norm.includes('allow') ||
    norm.includes('normal') ||
    norm.includes('connected') ||
    norm.includes('ok') ||
    norm.includes('fresh') ||
    norm.includes('loaded')
  ) {
    badgeClass = 'badge-success';
  } else if (
    norm.includes('bio') ||
    norm.includes('defer') ||
    norm.includes('review') ||
    norm.includes('warning') ||
    norm.includes('advisory') ||
    norm.includes('stagnant') ||
    norm.includes('moderately') ||
    norm.includes('idle')
  ) {
    badgeClass = 'badge-warning';
  } else if (
    norm.includes('sewer') ||
    norm.includes('bypass') ||
    norm.includes('anomaly') ||
    norm.includes('critical') ||
    norm.includes('high_risk') ||
    norm.includes('fail') ||
    norm.includes('disconnected') ||
    norm.includes('unloaded')
  ) {
    badgeClass = 'badge-danger';
  } else if (norm.includes('irrigation') || norm.includes('store')) {
    badgeClass = 'badge-info';
  } else if (norm.includes('shap') || norm.includes('model') || norm.includes('tree')) {
    badgeClass = 'badge-purple';
  }

  const padding = size === 'lg' ? '5px 12px' : '3px 8px';
  const fontSize = size === 'lg' ? '0.8125rem' : '0.72rem';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{
        padding,
        fontSize,
        whiteSpace: 'nowrap',
        fontWeight: 600,
        letterSpacing: '0.02em'
      }}
    >
      <span
        style={{
          width: size === 'lg' ? 6 : 5,
          height: size === 'lg' ? 6 : 5,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          flexShrink: 0
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
