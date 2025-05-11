import React from 'react';
import { OverallPlayerStats } from '../../services/overallStatsService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './OverallStatsModal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  stats: OverallPlayerStats;
  onClose: () => void;
}

const OverallStatsModal: React.FC<Props> = ({ stats, onClose }) => {
  const data = {
    labels: stats.progression.map((_, idx) => `#${idx + 1}`),
    datasets: [
      {
        label: 'Скорость (CPM)',
        data: stats.progression.map((entry) => entry.speedCPM),
        borderColor: '#1abc9c',
        fill: false,
      },
      {
        label: 'Точность (%)',
        data: stats.progression.map((entry) => entry.accuracyPercent),
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

  return (
    <div className="stats-modal-overlay" onClick={onClose}> {/* Закрытие по клику на оверлей */}
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}> {/* Предотвращаем закрытие при клике на сам контент */}
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
      </div>
    </div>
  );
};

export default OverallStatsModal;