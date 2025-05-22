// Определения типов для коллекций Firestore

/**
 * Документ пользователя в коллекции 'users'.
 * ID документа равен uid пользователя из Firebase Authentication.
 */
export interface UserDocument {
  gold: number;
  experience: number;
  level: number;
  completedLevels: string[]; // Массив ID пройденных уровней
  levelStats: {
    [levelId: string]: {
      speed: number; // Скорость набора (например, зн/мин)
      accuracy: number; // Точность (в процентах, 0-100)
      date: number; // Timestamp завершения уровня
    };
  };
  inventory: string[]; // Массив ID предметов в инвентаре
  equippedGear: {
    [slot: string]: string; // Карта слотов к ID надетых предметов (например, 'weapon': 'swordId123')
  };
  currentHealth: number;
  // ... и другие специфичные для игрока данные.
  // Например:
  // maxHealth?: number;
  // lastLogin?: number;
  // achievements?: string[];
}

/**
 * Документ уровня в коллекции 'levels'.
 */
export interface LevelDocument {
  id: string; // Уникальный идентификатор уровня (может совпадать с ID из вашего локального списка уровней)
  name: string;
  description: string;
  challenges: string[]; // Массив текстов для набора на этом уровне
  monsterData?: { // Опциональные данные о монстре, если они отличаются от стандартных или требуют доп. полей
    name?: string;
    baseHealth?: number;
    // ... другие специфичные для монстра уровня данные
  };
  imageUrl?: string; // Ссылка на изображение из Firebase Storage (для фона уровня или монстра)
  requiredWPM?: number;
  rewards?: { // Награды за первое прохождение
    gold: number;
    experience: number;
  };
  // ... и другие специфичные для уровня данные.
}

/**
 * Документ предмета снаряжения в коллекции 'equipment'.
 */
export interface EquipmentDocument {
  id: string; // Уникальный идентификатор предмета
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | string; // Тип предмета (оружие, броня, аксессуар и т.д.)
  stats: { // Характеристики, которые дает предмет
    playerDamageBonus?: number;
    playerHealBonus?: number;
    monsterDamageReduction?: number;
    monsterHealReduction?: number;
    monsterRegenReduction?: number;
    // ... другие возможные статы
  };
  cost: number; // Стоимость предмета в игровой валюте (например, золото)
  description: string;
  imageUrl?: string; // Ссылка на изображение предмета из Firebase Storage
  requiredLevel?: number; // Минимальный уровень для использования предмета
  // ... и другие специфичные для предмета данные.
}