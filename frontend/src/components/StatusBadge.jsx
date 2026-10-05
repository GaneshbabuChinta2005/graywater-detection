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
    norm.includes('fresh')
  ) {
    badgeClass = 'badge-success';
  } else if (
    norm.includes('bio') ||
    norm.includes('defer') ||
    norm.includes('review') ||
    norm.includes('warning') ||
    norm.includes('advisory') ||
    norm.includes('stagnant')
  ) {
    badgeClass = 'badge-warning';
  } else if (
    norm.includes('sewer') ||
    norm.includes('bypass') ||
    norm.includes('anomaly') ||
    norm.includes('critical') ||
    norm.includes('high_risk') ||
    norm.includes('fail') ||
    norm.includes('disconnected')
  ) {
    badgeClass = 'badge-danger';
  } else if (norm.includes('irrigation') || norm.includes('store')) {
    badgeClass = 'badge-info';
  } else if (norm.includes('shap') || norm.includes('model')) {
    badgeClass = 'badge-purple';
  }

  const padding = size === 'lg' ? '6px 14px' : '4px 10px';
  const fontSize = size === 'lg' ? '0.85rem' : '0.75rem';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ padding, fontSize }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
