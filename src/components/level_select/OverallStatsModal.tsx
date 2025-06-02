import React from "react"; // Removed useEffect, useState, useMemo
// import { getOverallStats } from "../../services/overallStatsService"; // Удалить или закомментировать
import { OverallPlayerStats } from '../../services/overallStatsService';
import { LevelStatEntry } from '../../services/overallStatsService';
// import { Line } from 'react-chartjs-2'; // Удалить или закомментировать
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
import {
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import KeyboardHeatmapStats from '../stats/KeyboardHeatmapStats';
import { CommonErrorStat } from "../../services/overallStatsService"; // Добавлен импорт

// interface Props { // Удалить или закомментировать
//   stats: OverallPlayerStats;
//   onClose: () => void;
// }

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

type OverallStatsModalProps = {
  // isOpen?: boolean; // Удалить или закомментировать
  onClose: () => void;
  stats: OverallPlayerStats;
};

const OverallStatsModal: React.FC<OverallStatsModalProps> = ({ /* isOpen, */ onClose, stats }) => {
  if (!stats) {
    return null;
  }
  const formatRechartsXAxisTick = (tick: any) => {
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

  // Data for Russian error characters bar chart
  const russianErrorChartData = stats.mostCommonRussianErrors?.map((err: CommonErrorStat) => ({
    name: `"${err.char}"`, // Изменено здесь
    ошибок: err.count,
  }));

  // Data for English error characters bar chart
  const englishErrorChartData = stats.mostCommonEnglishErrors?.map((err: CommonErrorStat) => ({
    name: `"${err.char}"`, // Изменено здесь
    errors: err.count,
  }));

  // Подготовка данных для тепловой карты - БОЛЬШЕ НЕ НУЖНА ЗДЕСЬ В ТАКОМ ВИДЕ
  // const russianErrorStats = useMemo(() => {
  // const englishErrorStats = useMemo(() => {

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}> 
        <h2>Общая статистика</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Средняя скорость</span>
            <span className="stat-value">{stats.averageSpeedCPM} зн/мин</span> {/* Изменено CPM на зн/мин */}
          </div>
          <div className="stat-item">
            <span className="stat-label">Средняя точность</span>
            <span className="stat-value">{stats.averageAccuracyPercent}%</span>
          </div>
        </div>
        <div className="progress-visualization">
          <h4>Прогрессия по уровням</h4>
          {stats.progression && stats.progression.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.progression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatRechartsXAxisTick} />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <RechartsLegend />
                <RechartsLine type="monotone" dataKey="speedCPM" stroke="#8884d8" name="Скорость (зн./мин)" />
                <RechartsLine type="monotone" dataKey="accuracyPercent" stroke="#82ca9d" name="Точность (%)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: '#ccc' }}>Нет данных для отображения прогрессии.</p>
          )}
        </div>
        {/* Section for Russian errors */}
        <h4>Частые ошибки (Русский, Топ 5)</h4>
        {stats.mostCommonRussianErrors && stats.mostCommonRussianErrors.length > 0 && russianErrorChartData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={russianErrorChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <RechartsLegend />
              <Bar dataKey="ошибок" fill="#dc3545" name="Кол-во ошибок (Рус)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#ccc' }}>Нет данных о частых русских ошибках.</p>
        )}
        {/* Keyboard heatmap for Russian */}
        {/* {stats.mostCommonRussianErrors && stats.mostCommonRussianErrors.length > 0 && ( // <--- ИЗМЕНЕНО УСЛОВИЕ И ПРОП */} 
        {stats.russianCharErrorCounts && Object.keys(stats.russianCharErrorCounts).length > 0 && (
          <KeyboardHeatmapStats errorCharCounts={stats.russianCharErrorCounts} selectedLayout="russian" />
        )}
        {/* Section for English errors */}
        <h4>Частые ошибки (Английский, Топ 5)</h4>
        {stats.mostCommonEnglishErrors && stats.mostCommonEnglishErrors.length > 0 && englishErrorChartData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={englishErrorChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <RechartsLegend />
              <Bar dataKey="errors" fill="#007bff" name="Кол-во ошибок (Англ)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#ccc' }}>Нет данных о частых английских ошибках.</p>
        )}
        {/* Keyboard heatmap for English */}
        {/* {stats.mostCommonEnglishErrors && stats.mostCommonEnglishErrors.length > 0 && ( // <--- ИЗМЕНЕНО УСЛОВИЕ И ПРОП */} 
        {stats.englishCharErrorCounts && Object.keys(stats.englishCharErrorCounts).length > 0 && (
          <KeyboardHeatmapStats errorCharCounts={stats.englishCharErrorCounts} selectedLayout="english" />
        )}
        <button onClick={onClose} className="stats-modal-close-btn">Закрыть</button>
      </div>
    </div>
  );
};

export default OverallStatsModal;

// type CommonErrorStat = { char: string; count: number }; // <--- REMOVE THIS LINE