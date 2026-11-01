import React from 'react';

/**
 * Official Institutional Seals & Emblems (Government of Andhra Pradesh & CPCB)
 * Scalable high-fidelity SVG components adhering to National Portal visual standards.
 */
export const EmblemOfIndia = ({ size = 42, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Official State Emblem of Andhra Pradesh / Government of India"
    >
      {/* Outer Golden/Bronze Ring with Ornamental Beading */}
      <circle cx="50" cy="50" r="47" stroke="#D97706" strokeWidth="2.5" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="43.5" stroke="#0F2942" strokeWidth="1" strokeDasharray="2 2" />
      
      {/* Sun Rays / Radiance Ring */}
      <circle cx="50" cy="50" r="39" stroke="#D97706" strokeWidth="0.8" opacity="0.7" />

      {/* Poorna Kumbham / Kalash Base (AP State Insignia Motif) */}
      <path
        d="M 36 68 C 36 64, 42 62, 50 62 C 58 62, 64 64, 64 68 L 61 74 C 58 77, 42 77, 39 74 Z"
        fill="#D97706"
        stroke="#92400E"
        strokeWidth="1"
      />
      
      {/* Ashoka Chakra Centerpiece with 24 Spokes */}
      <circle cx="50" cy="50" r="12" stroke="#1E3A8A" strokeWidth="1.8" fill="#F8FAFC" />
      <circle cx="50" cy="50" r="2.5" fill="#1E3A8A" />
      {/* 24 Spokes rendered radially */}
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="38"
          x2="50"
          y2="62"
          stroke="#1E3A8A"
          strokeWidth="0.8"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}

      {/* Ashoka Stambh / Triple Lions Top Stylization */}
      <path
        d="M 44 38 C 42 34, 43 24, 48 20 C 50 18, 52 18, 54 20 C 58 24, 59 34, 57 38 Z"
        fill="#0F2942"
      />
      {/* Left Lion Head profile */}
      <path
        d="M 37 36 C 35 32, 36 26, 42 24 C 44 26, 43 32, 43 36 Z"
        fill="#1E3A8A"
        opacity="0.9"
      />
      {/* Right Lion Head profile */}
      <path
        d="M 63 36 C 65 32, 64 26, 58 24 C 56 26, 57 32, 57 36 Z"
        fill="#1E3A8A"
        opacity="0.9"
      />

      {/* Satyameva Jayate / Government Banner Ribbon */}
      <path
        d="M 28 80 L 50 82 L 72 80 L 68 86 L 50 85 L 32 86 Z"
        fill="#0F2942"
      />
      <circle cx="50" cy="83.5" r="1.2" fill="#D97706" />

      {/* Subtle Tricolor Micro-Accent at bottom */}
      <rect x="36" y="88" width="8" height="2" rx="1" fill="#FF9933" />
      <rect x="46" y="88" width="8" height="2" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
      <rect x="56" y="88" width="8" height="2" rx="1" fill="#138808" />
    </svg>
  );
};

export const CpcbSeal = ({ size = 38, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Central Pollution Control Board / State Pollution Control Board Water Monitoring Seal"
    >
      <circle cx="50" cy="50" r="46" fill="#F0FDF4" stroke="#15803D" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" stroke="#15803D" strokeWidth="0.8" strokeDasharray="3 2" />
      
      {/* Water Droplet Symbol with Integrated Leaf */}
      <path
        d="M 50 22 C 50 22, 68 44, 68 56 C 68 66, 60 74, 50 74 C 40 74, 32 66, 32 56 C 32 44, 50 22, 50 22 Z"
        fill="#0284C7"
        opacity="0.9"
      />
      {/* Green Bio Shield within Droplet */}
      <path
        d="M 50 36 C 50 36, 61 50, 61 58 C 61 64, 56 69, 50 69 C 44 69, 39 64, 39 58 C 39 50, 50 36, 50 36 Z"
        fill="#15803D"
      />
      {/* Purity checkmark */}
      <path
        d="M 44 57 L 48 61 L 57 51"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EmblemOfIndia;

