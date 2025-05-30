import { getPlayerProgress, savePlayerProgress, PlayerProgress } from './playerService'; // Убедитесь, что путь корректен
// import { LevelResult } from '../types'; // LevelResult может остаться, если используется для структуры значения в levelStats

// Удалите или закомментируйте локальные PROGRESS_KEY, getPlayerProgress, savePlayerProgress, если они дублируют функционал playerService.ts
// const PROGRESS_KEY = 'playerProgressData'; // Пример

// export function getPlayerProgress(): PlayerProgress { ... } // Удалить, если это для основного прогресса
// export function savePlayerProgress(progress: PlayerProgress) { ... } // Удалить

export function saveLevelResult(levelId: string, speed: number, accuracy: number, errorChars: string[]) {
  const progress: PlayerProgress = getPlayerProgress(); // Используем из playerService

  if (!progress.levelStats) {
    progress.levelStats = {};
  }

  // Получаем существующие ошибки для данного уровня, если они есть
  const existingErrorChars = progress.levelStats[levelId]?.errorChars || [];
  // Объединяем существующие ошибки с новыми, избегая дубликатов, если это необходимо
  // В данном случае просто конкатенируем, предполагая, что каждый символ ошибки важен
  const updatedErrorChars = existingErrorChars.concat(errorChars);

  // Структура { speed, accuracy, date, errorChars } соответствует обновленному PlayerProgress
  progress.levelStats[levelId] = { 
    speed, 
    accuracy, 
    date: Date.now(), 
    errorChars: updatedErrorChars // Используем обновленный массив ошибок
  };

  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }
  savePlayerProgress(progress); // Используем из playerService
}