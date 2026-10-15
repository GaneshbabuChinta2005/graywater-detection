import { useTheme } from '../context/ThemeContext';

/**
 * Returns resolved color values for Recharts SVG props that cannot read CSS vars.
 * All chart components should use this hook instead of hardcoded hex values.
 */
export const useChartTheme = () => {
  const { isDark } = useTheme();

  return {
    // Grid & axis lines
    gridStroke:      isDark ? '#2A2F3E' : '#E2E8F0',
    axisStroke:      isDark ? '#2A2F3E' : '#E2E8F0',
    // Tick labels
    tickFill:        isDark ? '#8B95A6' : '#64748B',
    tickFillPrimary: isDark ? '#E8EDF3' : '#17212F',
    // Tooltip popup
    tooltipBg:       isDark ? '#1A1D27' : '#FFFFFF',
    tooltipBorder:   isDark ? '#2A2F3E' : '#E2E8F0',
    tooltipText:     isDark ? '#E8EDF3' : '#17212F',
    // Reference lines / annotations
    refLineStroke:   isDark ? '#FBBF24' : '#B45309',
    refLabelFill:    isDark ? '#FBBF24' : '#B45309',
    // Data line colors (semantic)
    colorPrimary:    isDark ? '#2DD4BF' : '#0F766E',   // pH
    colorWarning:    isDark ? '#FBBF24' : '#B45309',   // Turbidity
    colorDanger:     isDark ? '#F87171' : '#B91C1C',   // COD / anomaly
    colorPurple:     isDark ? '#A78BFA' : '#7C3AED',   // Tank
    colorInfo:       isDark ? '#60A5FA' : '#2563EB',   // Flow
    colorSuccess:    isDark ? '#34D399' : '#15803D',   // safe
    // Gradient fill opacities (area charts)
    gradientOpacity: isDark ? 0.18 : 0.25,
  };
};
