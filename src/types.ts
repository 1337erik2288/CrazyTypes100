export interface LevelResult {
  speed: number;
  accuracy: number;
  date: number;
  // Добавляем поле errorChars, если его еще нет, согласно предыдущим исправлениям
  errorChars?: { char: string, count: number }[]; 
}

export interface PlayerProgress {
  completedLevels: string[]; // Можно изменить на number[], если id уровней числовые
  levelStats: { [levelId: string]: LevelResult }; // Аналогично, ключ может быть number
}

export enum Language {
  RU = 'ru',
  EN = 'en',
  Code = 'code',
  Math = 'math',
}

// Объединенный ContentType
export enum ContentType {
  // Типы контента из levels.ts
  KeyCombos = 'key-combos',
  SimpleWords = 'simple-words',
  Phrases = 'phrases',
  Math = 'math',
  Code = 'code',
  Paragraphs = 'paragraphs',
  Mixed = 'mixed',
  RussianLetterCombinations = 'russian-letter-combinations',
  RussianSimpleWords = 'russian-simple-words',
  RussianComplexWords = 'russian-complex-words',
  EnglishLetterCombinations = 'english-letter-combinations',
  EnglishSimpleWords = 'english-simple-words',
  EnglishComplexWords = 'english-complex-words',
  // Типы для треков (можно использовать для фильтрации или навигации)
  RUSSIAN_TRACK = 'russian_track',
  ENGLISH_TRACK = 'english_track',
  CODE_TRACK = 'code_track',
  MATH_TRACK = 'math_track',
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  monsterHealth: number;
  monsterRegeneration: number;
  monsterHealOnMistake: number;
  damageAmount: number;
  requiredWPM?: number;
  background: string;
  monsterImage: string;
  contentType: ContentType;
  monsterDamage?: number;
  attackInterval?: number;
  language?: Language;
  levelContent?: string[]; // <-- Add this line (optional if not always present)
  timeLimit?: number;      // <-- Add this line (optional if not always present)
  experienceReward?: number;
  goldReward?: number;
  isSpecial?: boolean;
}