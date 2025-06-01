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
  // Code = 'code', // Заменяем общее значение
  Math = 'math',
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Rust = 'rust',
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
  RussianWords = 'russian-words',
  EnglishLetterCombinations = 'english-letter-combinations',
  EnglishSimpleWords = 'english-simple-words',
  EnglishComplexWords = 'english-complex-words',
  // Типы для треков (можно использовать для фильтрации или навигации)
  RUSSIAN_TRACK = 'russian_track',
  ENGLISH_TRACK = 'english_track',
  CODE_TRACK = 'code_track',
  MATH_TRACK = 'math_track',
}

// LevelConfigDetails удален

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  monsterHealth: number; // Сделано обязательным
  monsterRegeneration: number;
  monsterHealOnMistake: number;
  damageAmount: number;
  requiredWPM?: number;
  backgroundImage: string;
  monsterImage: string;
  contentType: ContentType;
  content?: string;
  difficulty?: string;
  diffClass?: string;
  monsterDamage: number;
  attackInterval: number;
  language: Language;
  levelContent?: string[];
  timeLimit?: number;
  experienceReward?: number;
  goldReward?: number;
  isSpecial?: boolean;
  // initialHealth, healAmount, regenerateAmount, healOnMistake удалены из LevelConfig
}