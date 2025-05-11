import React from 'react';
import { OverallPlayerStats } from '../../services/overallStatsService';
// Assuming OverallStatPoint is (or should be) exported from overallStatsService.ts
// If OverallStatPoint is not defined or exported, you might need to define it here or use 'any' as a temporary measure.
import { LevelStatEntry } from '../../services/overallStatsService'; // Changed OverallStatPoint to LevelStatEntry
import { Line } from 'react-chartjs-2'; // This is for the first chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip, // This Tooltip is from chart.js, for the first chart
  Legend,  // This Legend is from chart.js, for the first chart
} from 'chart.js';
import './OverallStatsModal.css';
// Alias imports from recharts to avoid naming conflicts
import {
  LineChart,
  Line as RechartsLine, // Aliased
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Aliased
  Legend as RechartsLegend,   // Aliased
  ResponsiveContainer
} from 'recharts'; // Added import for RechartsLine, RechartsTooltip, RechartsLegend

// Убедитесь, что OverallStatPoint импортирован или определен здесь, если overallStatsService.ts не используется
// import { OverallStatPoint } from '../../services/overallStatsService'; // Example - this line is now active above

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip, // This is the chart.js Tooltip
  Legend   // This is the chart.js Legend
);

interface Props {
  stats: OverallPlayerStats;
  onClose: () => void;
}

// Define a more specific type for Recharts payload items
interface CustomTooltipPayloadItem {
  name: string;
  value: number | string; // Recharts values can be numbers or strings
  color?: string;
  // payload is the original data object for this point (LevelStatEntry in this case)
  // Assuming levelId might be part of LevelStatEntry if the service is updated
  payload: LevelStatEntry & { levelId?: string };
}

// Кастомный компонент для Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: CustomTooltipPayloadItem[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    const originalDataPoint = payload[0].payload; // This is LevelStatEntry (potentially with levelId)
    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`Дата: ${new Date(label as string | number).toLocaleDateString()}`}</p>
        {payload.map((pld: CustomTooltipPayloadItem, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}`}
          </p>
        ))}
        {/* Отображаем уровень - This will only render if levelId is present in originalDataPoint */}
        {originalDataPoint && originalDataPoint.levelId && <p className="intro">{`Уровень: ${originalDataPoint.levelId}`}</p>}
      </div>
    );
  }
  return null;
};

const OverallStatsModal: React.FC<Props> = ({ stats, onClose }) => { // Changed OverallStatsModalProps to Props
  const data = {
    labels: stats.progression.map((_: any, idx: number) => `#${idx + 1}`), // Added types for _ and idx
    datasets: [
      {
        label: 'Скорость (CPM)',
        data: stats.progression.map((entry: LevelStatEntry) => entry.speedCPM), // Changed OverallStatPoint to LevelStatEntry
        borderColor: '#1abc9c',
        fill: false,
      },
      {
        label: 'Точность (%)',
        data: stats.progression.map((entry: LevelStatEntry) => entry.accuracyPercent), // Changed OverallStatPoint to LevelStatEntry
        borderColor: '#e74c3c',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Это важно, контейнер должен иметь размеры
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Прогрессия игрока',
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        ticks: {
          color: '#ccc', // Цвет тиков на оси X
        },
        grid: {
          color: 'rgba(204, 204, 204, 0.2)', // Цвет сетки для оси X
        },
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          color: '#ccc', // Цвет тиков на оси Y
        },
        grid: {
          color: 'rgba(204, 204, 204, 0.2)', // Цвет сетки для оси Y
        },
      },
    },
  };

  // Helper function for formatting Recharts X-axis ticks
  const formatRechartsXAxisTick = (tick: any): string => {
    if (tick === undefined || tick === null) {
      return '';
    }
    try {
      const dateValue = Number(tick);
      if (isNaN(dateValue)) {
        return String(tick);
      }
      return new Date(dateValue).toLocaleDateString();
    } catch (e) {
      return String(tick);
    }
  };

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Общая статистика</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Средняя скорость</span>
            <span className="stat-value">{stats.averageSpeedCPM} CPM</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Средняя точность</span>
            <span className="stat-value">{stats.averageAccuracyPercent}%</span>
          </div>
        </div>
        <div className="progress-visualization">
          <h4>Прогрессия по уровням</h4>
          {stats.progression && stats.progression.length > 0 ? (
            <Line data={data} options={options} />
          ) : (
            <p style={{ textAlign: 'center', color: '#ccc' }}>Нет данных для отображения прогрессии.</p>
          )}
        </div>
        <button className="close-modal-button" onClick={onClose}>
          Закрыть
        </button>
        <h4>История результатов:</h4>
        {stats.progression && stats.progression.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.progression}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(tick) => formatRechartsXAxisTick(tick)} />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <RechartsLegend />
              <RechartsLine type="monotone" dataKey="speedCPM" stroke="#8884d8" name="Скорость (зн./мин)" />
              <RechartsLine type="monotone" dataKey="accuracyPercent" stroke="#82ca9d" name="Точность (%)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Нет данных для отображения истории.</p>
        )}
      </div>
    </div>
  );
};

export default OverallStatsModal;