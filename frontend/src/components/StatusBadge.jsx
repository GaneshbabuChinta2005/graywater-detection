import React from 'react';

export const StatusBadge = ({ label, size = 'sm', className = '' }) => {
  const norm = String(label || '').trim();
  const lower = norm.toLowerCase();

  let badgeStyle = {
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
    dot: '#1D4ED8'
  };

  // 1. Formal Institutional Status Badges
  if (
    lower.includes('compliant') ||
    lower.includes('permit') && !lower.includes('defer') ||
    lower.includes('safe') ||
    lower.includes('allow') ||
    lower.includes('normal') ||
    lower.includes('connected') ||
    lower.includes('ok') ||
    lower.includes('loaded') ||
    lower.includes('fresh') ||
    lower.includes('indoor')
  ) {
    if (lower.includes('permitted reuse') || lower.includes('indoor reuse') || lower.includes('permitted')) {
      // PERMITTED REUSE (Blue)
      badgeStyle = {
        bg: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE',
        dot: '#1D4ED8'
      };
    } else {
      // COMPLIANT / SAFE / NORMAL (Forest Green)
      badgeStyle = {
        bg: '#F0FDF4',
        text: '#15803D',
        border: '#BBF7D0',
        dot: '#15803D'
      };
    }
  } else if (
    lower.includes('defer') ||
    lower.includes('monsoon') ||
    lower.includes('warning') ||
    lower.includes('advisory') ||
    lower.includes('review') ||
    lower.includes('stagnant') ||
    lower.includes('bio') ||
    lower.includes('elevated') ||
    lower.includes('idle') ||
    lower.includes('intermediate')
  ) {
    // DEFERRED - MONSOON / ADVISORY (Gold / Saffron Amber)
    badgeStyle = {
      bg: '#FFFBEB',
      text: '#D97706',
      border: '#FDE68A',
      dot: '#D97706'
    };
  } else if (
    lower.includes('violation') ||
    lower.includes('sewer') ||
    lower.includes('override') ||
    lower.includes('critical') ||
    lower.includes('fail') ||
    lower.includes('high_risk') ||
    lower.includes('breach') ||
    lower.includes('anomaly') ||
    lower.includes('disconnected') ||
    lower.includes('unloaded')
  ) {
    // VIOLATION - SEWER OVERRIDE / CRITICAL (Red)
    badgeStyle = {
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FECACA',
      dot: '#B91C1C'
    };
  } else if (lower.includes('irrigation') || lower.includes('store') || lower.includes('class')) {
    badgeStyle = {
      bg: '#F0FDF4',
      text: '#0F766E',
      border: '#99F6E4',
      dot: '#0F766E'
    };
  } else if (lower.includes('shap') || lower.includes('model') || lower.includes('statutory') || lower.includes('tree')) {
    badgeStyle = {
      bg: '#EEF2FF',
      text: '#4338CA',
      border: '#C7D2FE',
      dot: '#4338CA'
    };
  }

  const padding = size === 'lg' ? '4px 12px' : size === 'md' ? '3px 10px' : '2px 8px';
  const fontSize = size === 'lg' ? '0.78rem' : size === 'md' ? '0.75rem' : '0.7rem';
  const dotSize = size === 'lg' ? 6 : 5;

  return (
    <span
      className={`status-pill-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: 9999,
        backgroundColor: badgeStyle.bg,
        color: badgeStyle.text,
        border: `1px solid ${badgeStyle.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: badgeStyle.dot,
          flexShrink: 0
        }}
      />
      {norm}
    </span>
  );
};

export default StatusBadge;
