import { useTheme } from '../context/ThemeContext';

/**
 * Returns resolved color values for Recharts SVG props that cannot read CSS vars.
 * Calibrated specifically for Government Portal institutional light readability.
 */
export const useChartTheme = () => {
  const { isDark } = useTheme();

  return {
    // Grid & axis lines — Crisp Slate Gridlines
    gridStroke:      isDark ? '#334155' : '#E2E8F0',
    axisStroke:      isDark ? '#475569' : '#94A3B8',
    // Tick labels — High-contrast slate charcoal
    tickFill:        isDark ? '#CBD5E1' : '#475569',
    tickFillPrimary: isDark ? '#F8FAFC' : '#0F172A',
    // Tooltip popup — Clean solid container
    tooltipBg:       isDark ? '#1E293B' : '#FFFFFF',
    tooltipBorder:   isDark ? '#475569' : '#CBD5E1',
    tooltipText:     isDark ? '#F8FAFC' : '#0F172A',
    // Reference lines / annotations
    refLineStroke:   isDark ? '#F59E0B' : '#D97706',
    refLabelFill:    isDark ? '#F59E0B' : '#B45309',
    // Data line colors (Official Government & CPCB palette)
    colorPrimary:    isDark ? '#38BDF8' : '#0F2942',   // Navy Blue / Primary
    colorWarning:    isDark ? '#F59E0B' : '#D97706',   // Saffron / Turbidity
    colorDanger:     isDark ? '#EF4444' : '#B91C1C',   // CPCB Red / COD Violation
    colorPurple:     isDark ? '#818CF8' : '#4338CA',   // Indigo / Tank Level
    colorInfo:       isDark ? '#60A5FA' : '#1D4ED8',   // Royal Blue / Flow
    colorSuccess:    isDark ? '#22C55E' : '#15803D',   // Forest Green / Verified Compliance
    // Gradient fill opacities (area charts)
    gradientOpacity: isDark ? 0.22 : 0.18,
  };
};
