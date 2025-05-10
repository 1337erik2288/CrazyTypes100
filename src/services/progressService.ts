import { getPlayerProgress, savePlayerProgress, PlayerProgress } from './playerService'; // Убедитесь, что путь корректен
// import { LevelResult } from '../types'; // LevelResult может остаться, если используется для структуры значения в levelStats

// Удалите или закомментируйте локальные PROGRESS_KEY, getPlayerProgress, savePlayerProgress, если они дублируют функционал playerService.ts
// const PROGRESS_KEY = 'playerProgressData'; // Пример

// export function getPlayerProgress(): PlayerProgress { ... } // Удалить, если это для основного прогресса
// export function savePlayerProgress(progress: PlayerProgress) { ... } // Удалить

export function saveLevelResult(levelId: string, speed: number, accuracy: number) {
  const progress: PlayerProgress = getPlayerProgress(); // Используем из playerService

  if (!progress.levelStats) {
    progress.levelStats = {};
  }
  // Структура { speed, accuracy, date } соответствует обновленному PlayerProgress
  progress.levelStats[levelId] = { speed, accuracy, date: Date.now() };

  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }
  savePlayerProgress(progress); // Используем из playerService
}