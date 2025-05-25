export interface LevelStatEntry {
  timestamp: number;
  speedCPM: number;
  accuracyPercent: number;
  errorChars?: string[];
}

export interface CommonErrorStat {
  char: string;
  count: number;
}

export interface OverallPlayerStats {
  averageSpeedCPM: number;
  averageAccuracyPercent: number;
  progression: LevelStatEntry[];
  mostCommonRussianErrors?: CommonErrorStat[]; 
  mostCommonEnglishErrors?: CommonErrorStat[]; 
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
import { getPlayerProgress } from './playerService';

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

// Helper function to check if a character is Russian
function isRussianChar(char: string): boolean {
  const charCode = char.charCodeAt(0);
  // Cyrillic Unicode block (excluding some non-letter characters)
  return (charCode >= 0x0400 && charCode <= 0x04FF);
}

// Helper function to check if a character is English
function isEnglishChar(char: string): boolean {
  const charCode = char.charCodeAt(0);
  // Basic Latin and Latin-1 Supplement (common English letters)
  return (charCode >= 0x0041 && charCode <= 0x005A) || (charCode >= 0x0061 && charCode <= 0x007A);
}

export function getOverallStats(): OverallPlayerStats {
  const playerProgress = getPlayerProgress();
  const progressionEntries: LevelStatEntry[] = [];
  const allRussianErrorChars: string[] = [];
  const allEnglishErrorChars: string[] = [];

  if (playerProgress.levelStats) {
    for (const levelId in playerProgress.levelStats) {
      if (playerProgress.levelStats.hasOwnProperty(levelId)) {
        const stat = playerProgress.levelStats[levelId];
        if (stat && typeof stat.date === 'number' && typeof stat.speed === 'number' && typeof stat.accuracy === 'number') {
          progressionEntries.push({
            timestamp: stat.date,
            speedCPM: stat.speed,
            accuracyPercent: stat.accuracy,
            errorChars: stat.errorChars,
          });
          if (stat.errorChars) {
            stat.errorChars.forEach(char => {
              if (isRussianChar(char)) {
                allRussianErrorChars.push(char);
              } else if (isEnglishChar(char)) {
                allEnglishErrorChars.push(char);
              }
              // Characters that are neither will be ignored for this specific breakdown
            });
          }
        }
      }
    }
  }

  progressionEntries.sort((a, b) => a.timestamp - b.timestamp);

  const totalEntries = progressionEntries.length;
  let sumSpeedCPM = 0;
  let sumAccuracyPercent = 0;

  for (const entry of progressionEntries) {
    sumSpeedCPM += entry.speedCPM;
    sumAccuracyPercent += entry.accuracyPercent;
  }

  const averageSpeedCPM = totalEntries > 0 ? Math.round(sumSpeedCPM / totalEntries) : 0;
  const averageAccuracyPercent = totalEntries > 0 ? Math.round((sumAccuracyPercent / totalEntries) * 10) / 10 : 0;

  // Calculate most common Russian errors
  const russianErrorCounts: { [char: string]: number } = {};
  allRussianErrorChars.forEach(char => {
    russianErrorCounts[char] = (russianErrorCounts[char] || 0) + 1;
  });
  const sortedRussianErrors = Object.entries(russianErrorCounts)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // Calculate most common English errors
  const englishErrorCounts: { [char: string]: number } = {};
  allEnglishErrorChars.forEach(char => {
    englishErrorCounts[char] = (englishErrorCounts[char] || 0) + 1;
  });
  const sortedEnglishErrors = Object.entries(englishErrorCounts)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  return {
    averageSpeedCPM,
    averageAccuracyPercent,
    progression: progressionEntries,
    mostCommonRussianErrors: sortedRussianErrors,
    mostCommonEnglishErrors: sortedEnglishErrors,
  };
}