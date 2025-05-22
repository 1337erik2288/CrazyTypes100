import { Level } from '../components/LevelSelect';
import { db } from '../firebase'; // Импорт db, auth удален
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Импорт функций Firestore
import { UserDocument } from '../types/firestoreTypes'; // Импорт типа UserDocument

// Обновляем интерфейс PlayerProgress, чтобы он соответствовал UserDocument
// или можно напрямую использовать UserDocument в функциях, возвращающих прогресс.
// Для последовательности, расширим PlayerProgress.
export interface PlayerProgress {
  experience: number;
  gold: number;
  level: number;
  completedLevels: string[];
  levelStats?: {
    [levelId: string]: {
      speed: number;
      accuracy: number;
      date: number;
    };
  };
  inventory: string[]; // Добавлено из UserDocument
  equippedGear: { [slot: string]: string }; // Добавлено из UserDocument
  currentHealth: number; // Добавлено из UserDocument
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
  levelStats: {},
  inventory: [], // Инициализация нового поля
  equippedGear: {}, // Инициализация нового поля
  // currentHealth будет инициализирован в getInitialPlayerProgress на основе getMaxPlayerHealth для уровня 1
  currentHealth: 0 // Временное значение, будет установлено в getInitialPlayerProgress
};

// Export a function that returns a copy of the default progress
export const getInitialPlayerProgress = (): PlayerProgress => {
  const initialProgress = { ...DEFAULT_PLAYER_PROGRESS };
  // Рассчитываем начальное здоровье на основе базового уровня (1)
  initialProgress.currentHealth = BASE_PLAYER_HEALTH + ((initialProgress.level -1 ) * HEALTH_PER_LEVEL);
  return initialProgress;
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



// Базовое здоровье игрока
const BASE_PLAYER_HEALTH = 100;
const HEALTH_PER_LEVEL = 10;
const BASE_PLAYER_DAMAGE = 10; // <--- Новый базовый урон игрока

// Удаляем старые функции, работавшие с localStorage или вызывавшие старые версии
// export const getPlayerLevel = (): number => { ... };
// export const getMaxPlayerHealth = (): number => { ... };
// export const getPlayerBaseDamage = (): number => { ... }; // Эта функция возвращает константу, ее можно оставить, если она не дублируется
// export const getPlayerHealth = (): number => { ... };
// export const setPlayerHealth = (health: number): void => { ... };
// export const damagePlayer = (damage: number): number => { ... };
// export const healPlayerToMax = (): void => { ... };

// Убедитесь, что это ЕДИНСТВЕННЫЕ объявления этих функций в файле.
// Старые, localStorage-версии должны быть удалены или закомментированы.

// Get player progress from Firestore
export const getPlayerProgress = async (userId: string): Promise<PlayerProgress> => {
  if (!userId) {
    console.warn("getPlayerProgress: userId is not provided. Returning initial progress.");
    return getInitialPlayerProgress();
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserDocument;
      const initialDefaults = getInitialPlayerProgress();
      return {
        experience: data.experience ?? initialDefaults.experience,
        gold: data.gold ?? initialDefaults.gold,
        level: data.level ?? initialDefaults.level,
        completedLevels: data.completedLevels ?? initialDefaults.completedLevels,
        levelStats: data.levelStats ?? initialDefaults.levelStats,
        inventory: data.inventory ?? initialDefaults.inventory,
        equippedGear: data.equippedGear ?? initialDefaults.equippedGear,
        currentHealth: data.currentHealth ?? initialDefaults.currentHealth,
      };
    } else {
      console.log(`No progress found for user ${userId}, creating new one.`);
      const initialProgress = getInitialPlayerProgress();
      await setDoc(userDocRef, initialProgress);
      return initialProgress;
    }
  } catch (error) {
    console.error('Error fetching player progress:', error);
    return getInitialPlayerProgress();
  }
};

// Save player progress to Firestore
export const savePlayerProgress = async (userId: string, progress: PlayerProgress): Promise<void> => {
  if (!userId) {
    console.error("savePlayerProgress: userId is not provided.");
    return;
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    await setDoc(userDocRef, progress, { merge: true });
  } catch (error) {
    console.error('Error saving player progress:', error);
  }
};

// Add experience and gold to player progress in Firestore
export const addRewards = async (userId: string, experience: number, gold: number): Promise<PlayerProgress> => {
  if (!userId) {
    console.error("addRewards: userId is not provided.");
    return getInitialPlayerProgress(); // Возвращаем начальный прогресс или обрабатываем ошибку иначе
  }
  // Используем await для получения прогресса и передаем userId
  const progress = await getPlayerProgress(userId);

  progress.experience += experience;
  progress.gold += gold;

  // Предполагаем, что XP_REQUIREMENTS - это массив или объект, доступный в этом скоупе
  // Например: const XP_REQUIREMENTS = [0, 100, 250, 500, ...]; // XP для уровней 1, 2, 3, 4...
  while (
    progress.level < XP_REQUIREMENTS.length && // Убедитесь, что XP_REQUIREMENTS определен и доступен
    progress.experience >= XP_REQUIREMENTS[progress.level]
  ) {
    progress.level++;
  }

  await savePlayerProgress(userId, progress);
  return progress;
};

// Calculate player rating based on typing speed and accuracy
// export const calculatePlayerRating = (speed: number, accuracy: number): number => { // ЭТО ДУБЛИКАТ - УДАЛЯЕМ
// Rating formula: (Speed × 0.7) + (Accuracy × 0.3)
export const calculatePlayerRating = (speed: number, accuracy: number): number => {
  return (speed * 0.7) + (accuracy * 0.3);
};

// Получение текущего уровня игрока из Firestore
export const getPlayerLevel = async (userId: string): Promise<number> => {
  if (!userId) return DEFAULT_PLAYER_PROGRESS.level;
  const playerProgress = await getPlayerProgress(userId);
  return playerProgress.level;
};

// Получение максимального здоровья игрока на основе его уровня из Firestore
export const getMaxPlayerHealth = async (userId: string): Promise<number> => {
  if (!userId) return BASE_PLAYER_HEALTH + (DEFAULT_PLAYER_PROGRESS.level -1) * HEALTH_PER_LEVEL;
  const playerLevel = await getPlayerLevel(userId);
  return BASE_PLAYER_HEALTH + ((playerLevel -1) * HEALTH_PER_LEVEL);
};

// Получение базового урона игрока
export const getPlayerBaseDamage = (): number => {
  // В будущем здесь можно будет учитывать бонусы от уровня или постоянных улучшений
  return BASE_PLAYER_DAMAGE;
};

// Получение текущего здоровья игрока
export const getPlayerHealth = async (userId: string): Promise<number> => {
  if (!userId) return await getMaxPlayerHealth(userId); // или дефолтное значение
  const playerProgress = await getPlayerProgress(userId);
  // Если currentHealth не определено в Firestore, возвращаем максимальное
  return playerProgress.currentHealth ?? await getMaxPlayerHealth(userId);
};

// Установка здоровья игрока в Firestore
export const setPlayerHealth = async (userId: string, health: number): Promise<void> => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, { currentHealth: health });
  } catch (error) {
    console.error('Error setting player health:', error);
    // Если документа нет, можно его создать с этим здоровьем
    const progress = getInitialPlayerProgress();
    progress.currentHealth = health;
    await savePlayerProgress(userId, progress);
  }
};

// Нанесение урона игроку и обновление в Firestore
export const damagePlayer = async (userId: string, damage: number): Promise<number> => {
  if (!userId) return 0; // или другое значение по умолчанию
  const currentHealth = await getPlayerHealth(userId);
  const newHealth = Math.max(0, currentHealth - damage);
  await setPlayerHealth(userId, newHealth);
  return newHealth;
};

// Восстановление здоровья игрока до максимума в Firestore
export const healPlayerToMax = async (userId: string): Promise<void> => {
  if (!userId) return;
  const maxHealth = await getMaxPlayerHealth(userId);
  await setPlayerHealth(userId, maxHealth);
};