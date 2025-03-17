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

// Calculate rewards based on level difficulty and language
export const calculateLevelReward = (level: Level): LevelReward => {
  let baseExperience = 50;
  let baseGold = 25;
  
  // Adjust for difficulty
  if (level.name.toLowerCase().includes('hard')) {
    baseExperience *= 1.5;
    baseGold *= 1.5;
  }
  
  // Adjust for language type
  if (level.config.language === 'ru') {
    baseExperience *= 1.2;
    baseGold *= 1.2;
  } else if (level.config.language === 'code') {
    baseExperience *= 1.5;
    baseGold *= 1.5;
  }
  
  return {
    experience: Math.round(baseExperience),
    gold: Math.round(baseGold),
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