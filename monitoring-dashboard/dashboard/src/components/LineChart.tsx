// ============================================================
// Dashboard Monitoring — Real-Time Line Chart Component
// ============================================================

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { COLORS, MAX_CHART_POINTS } from '../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface SeriesData {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
}

interface LineChartProps {
  labels: string[];
  series: SeriesData[];
  title?: string;
  yLabel?: string;
  height?: number;
  showLegend?: boolean;
  thresholdLines?: { value: number; label: string; color: string }[];
}

/**
 * Real-time time-series line chart with multi-series overlay support.
 * Optimized for high-frequency updates with ring buffer (max 500 points).
 */
export function LineChart({
  labels,
  series,
  title,
  yLabel,
  height = 200,
  showLegend = true,
  thresholdLines,
}: LineChartProps) {
  // Ensure we don't render more than MAX_CHART_POINTS
  const displayLabels = labels.slice(-MAX_CHART_POINTS);

  const datasets = series.map((s) => ({
    label: s.label,
    data: s.data.slice(-MAX_CHART_POINTS),
    borderColor: s.color || COLORS.chartPrimary,
    backgroundColor: s.fill
      ? `${s.color || COLORS.chartPrimary}20`
      : 'transparent',
    borderWidth: 2,
    pointRadius: 0,
    pointHitRadius: 6,
    tension: 0.3,
    fill: !!s.fill,
  }));

  // Add threshold lines as additional datasets with flat line
  if (thresholdLines) {
    thresholdLines.forEach((t) => {
      datasets.push({
        label: `${t.label} (${t.value})`,
        data: Array(displayLabels.length).fill(t.value),
        borderColor: t.color,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      } as any);
    });
  }

  const data = {
    labels: displayLabels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 200, // Smooth but fast for real-time
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: COLORS.chartText,
          boxWidth: 12,
          padding: 8,
          font: { size: 10 },
        },
      },
      title: title
        ? {
            display: true,
            text: title,
            color: COLORS.chartText,
            font: { size: 12, weight: '600' as const },
            padding: { bottom: 8 },
          }
        : undefined,
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: COLORS.chartGrid,
          display: false,
        },
        ticks: {
          color: COLORS.chartText,
          maxTicksLimit: 8,
          font: { size: 9 },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: COLORS.chartGrid,
        },
        ticks: {
          color: COLORS.chartText,
          font: { size: 9 },
          maxTicksLimit: 6,
        },
        title: yLabel
          ? {
              display: true,
              text: yLabel,
              color: COLORS.chartText,
              font: { size: 9 },
            }
          : undefined,
      },
    },
  };

  return (
    <div style={{ width: '100%', height }}>
      <Line data={data} options={options} />
    </div>
  );
}
