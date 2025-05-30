import { LevelConfig, ContentType } from '../types'; // Убедитесь, что импорты корректны

// Старый массив levels удален.
// Enum ContentType и интерфейс LevelConfig также удалены, так как они теперь в src/types.ts

// Опционально: можно создать объединенный массив всех уровней для каких-либо общих нужд
// import { russianLevels } from './russianLevels';
// import { englishLevels } from './englishLevels';
// import { codeLevels } from './codeLevels';
// import { mathLevels } from './mathLevels';

// export const allLevels: LevelConfig[] = [
//   ...russianLevels,
//   ...englishLevels,
//   ...codeLevels,
//   ...mathLevels,
// ];

// Или оставьте файл пустым, если не нужен общий экспорт