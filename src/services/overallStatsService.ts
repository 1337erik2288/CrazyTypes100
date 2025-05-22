export interface LevelStatEntry {
  timestamp: number;
  speedCPM: number;
  accuracyPercent: number;
}

export interface OverallPlayerStats {
  averageSpeedCPM: number;
  averageAccuracyPercent: number;
  progression: LevelStatEntry[];
}

// Удаляем STORAGE_KEY, loadStats, saveStats и addLevelStat, так как они больше не нужны.
// const STORAGE_KEY = 'overall_player_stats';

// function loadStats(): LevelStatEntry[] {
//   const raw = localStorage.getItem(STORAGE_KEY);
//   return raw ? JSON.parse(raw) : [];
// }

// function saveStats(stats: LevelStatEntry[]) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
// }

// export function addLevelStat(speedCPM: number, accuracyPercent: number) {
//   const stats = loadStats();
//   stats.push({ timestamp: Date.now(), speedCPM, accuracyPercent });
//   saveStats(stats);
// }

// Добавляем импорт getPlayerProgress из playerService
import { getPlayerProgress } from './playerService'; // getPlayerProgress теперь асинхронный
// import { UserDocument } from '../types/firestoreTypes'; // Удален неиспользуемый импорт

export interface LevelStatEntry {
  timestamp: number;
  speedCPM: number;
  accuracyPercent: number;
}

export interface OverallPlayerStats {
  averageSpeedCPM: number;
  averageAccuracyPercent: number;
  progression: LevelStatEntry[];
}

// getOverallStats теперь асинхронная и принимает userId
export async function getOverallStats(userId: string): Promise<OverallPlayerStats> {
  // playerProgress теперь получается асинхронно
  const playerProgress = await getPlayerProgress(userId); // Этот вызов корректен для рефакторинга. Убедитесь, что playerService.ts экспортирует getPlayerProgress с userId.
  const progressionEntries: LevelStatEntry[] = [];

  if (playerProgress.levelStats) {
    for (const levelId in playerProgress.levelStats) {
      // Убедимся, что свойство принадлежит объекту, а не его прототипу
      if (playerProgress.levelStats.hasOwnProperty(levelId)) {
        const stat = playerProgress.levelStats[levelId];
        // Проверяем, что stat и его поля существуют и имеют правильные типы
        if (stat && typeof stat.date === 'number' && typeof stat.speed === 'number' && typeof stat.accuracy === 'number') {
          progressionEntries.push({
            timestamp: stat.date,
            speedCPM: stat.speed, // Предполагаем, что stat.speed это и есть CPM
            accuracyPercent: stat.accuracy, // Предполагаем, что stat.accuracy это проценты
          });
        }
      }
    }
  }

  // Сортируем записи по времени для корректного отображения прогрессии
  progressionEntries.sort((a, b) => a.timestamp - b.timestamp);

  const totalEntries = progressionEntries.length;
  let sumSpeedCPM = 0;
  let sumAccuracyPercent = 0;

  for (const entry of progressionEntries) {
    sumSpeedCPM += entry.speedCPM;
    sumAccuracyPercent += entry.accuracyPercent;
  }

  const averageSpeedCPM = totalEntries > 0 ? Math.round(sumSpeedCPM / totalEntries) : 0;
  // Округляем среднюю точность до одного знака после запятой
  const averageAccuracyPercent = totalEntries > 0 ? Math.round((sumAccuracyPercent / totalEntries) * 10) / 10 : 0;

  return {
    averageSpeedCPM,
    averageAccuracyPercent,
    progression: progressionEntries,
  };
}