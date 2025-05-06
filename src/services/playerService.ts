import { Level } from '../components/LevelSelect';

export interface PlayerProgress {
  experience: number;
  gold: number;
  level: number;
  completedLevels: number[];
}

export interface LevelReward {
  experience: number;
  gold: number;
}

// Default values for a new player
const DEFAULT_PLAYER_PROGRESS: PlayerProgress = {
  experience: 0,
  gold: 0,
  level: 1,
  completedLevels: [],
};

// Experience required for each level
const XP_REQUIREMENTS = [
  0,      // Level 1 (starting level)
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1350,   // Level 7
  1750,   // Level 8
  2200,   // Level 9
  2700,   // Level 10
];

// Calculate rewards based on level ID
export const calculateLevelReward = (level: Level): LevelReward => {
  // Фиксированные награды для каждого уровня согласно требованиям
  const goldRewards = {
    1: 30,  // Уровень 1 - 30 золота
    2: 60,  // Уровень 2 - 60 золота
    3: 100, // Уровень 3 - 100 золота
    4: 140, // Уровень 4 - 140 золота
    5: 180, // Уровень 5 - 180 золота
    6: 240, // Уровень 6 - 240 золота
    7: 300  // Уровень 7 - 300 золота
  };
  
  // Опыт рассчитываем пропорционально золоту
  const gold = goldRewards[level.id as keyof typeof goldRewards] || 50;
  const experience = gold * 2;
  
  return {
    experience: experience,
    gold: gold,
  };
};

// Get player progress from localStorage
export const getPlayerProgress = (): PlayerProgress => {
  const savedProgress = localStorage.getItem('playerProgress');
  if (savedProgress) {
    try {
      return JSON.parse(savedProgress);
    } catch (error) {
      console.error('Error parsing player progress:', error);
    }
  }
  return { ...DEFAULT_PLAYER_PROGRESS };
};

// Save player progress to localStorage
export const savePlayerProgress = (progress: PlayerProgress): void => {
  localStorage.setItem('playerProgress', JSON.stringify(progress));
};

// Add experience and gold to player progress
export const addRewards = (experience: number, gold: number): PlayerProgress => {
  const progress = getPlayerProgress();
  
  // Add rewards
  progress.experience += experience;
  progress.gold += gold;
  
  // Check for level up
  while (
    progress.level < XP_REQUIREMENTS.length && 
    progress.experience >= XP_REQUIREMENTS[progress.level]
  ) {
    progress.level++;
  }
  
  // Save updated progress
  savePlayerProgress(progress);
  
  return progress;
};

// Calculate progress percentage to next level
export const calculateLevelProgress = (progress: PlayerProgress): number => {
  if (progress.level >= XP_REQUIREMENTS.length) {
    return 100; // Max level reached
  }
  
  const currentLevelXP = XP_REQUIREMENTS[progress.level - 1] || 0;
  const nextLevelXP = XP_REQUIREMENTS[progress.level];
  const xpForCurrentLevel = progress.experience - currentLevelXP;
  const xpRequiredForNextLevel = nextLevelXP - currentLevelXP;
  
  return Math.min(100, Math.floor((xpForCurrentLevel / xpRequiredForNextLevel) * 100));
};

// Calculate player rating based on typing speed and accuracy
export const calculatePlayerRating = (speed: number, accuracy: number): number => {
  // Rating formula: (Speed × 0.7) + (Accuracy × 0.3)
  return (speed * 0.7) + (accuracy * 0.3);
};

// Базовое здоровье игрока
const BASE_PLAYER_HEALTH = 100;
const HEALTH_PER_LEVEL = 10;

// Получение текущего уровня игрока
export const getPlayerLevel = (): number => {
  const playerProgress = getPlayerProgress();
  return playerProgress.level;
};

// Получение максимального здоровья игрока на основе его уровня
export const getMaxPlayerHealth = (): number => {
  const playerLevel = getPlayerLevel();
  return BASE_PLAYER_HEALTH + (playerLevel * HEALTH_PER_LEVEL);
};

// Получение текущего здоровья игрока
export const getPlayerHealth = (): number => {
  // Get current health from storage or return max health if not set
  const savedHealth = localStorage.getItem('playerHealth');
  if (savedHealth) {
    return parseInt(savedHealth, 10);
  }
  return getMaxPlayerHealth();
};

// Установка здоровья игрока
export const setPlayerHealth = (health: number): void => {
  localStorage.setItem('playerHealth', health.toString());
};

// Нанесение урона игроку
export const damagePlayer = (damage: number): number => {
  const currentHealth = getPlayerHealth();
  const newHealth = Math.max(0, currentHealth - damage);
  setPlayerHealth(newHealth);
  return newHealth;
};

// Восстановление здоровья игрока до максимума
export const healPlayerToMax = (): void => {
  setPlayerHealth(getMaxPlayerHealth());
};