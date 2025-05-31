import { LevelConfig, ContentType, Language } from '../types';

export const russianLevels: LevelConfig[] = [
  {
    id: 1, // ID можно будет пересмотреть, чтобы они были уникальны в рамках трека или глобально
    name: 'Основы быстрого набора (RU)',
    description: 'Начальный уровень для освоения основ быстрого набора на русском',
    monsterHealth: 100,
    monsterRegeneration: 0,
    monsterHealOnMistake: 0,
    damageAmount: 5,
    requiredWPM: 20,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design.png',
    contentType: ContentType.RussianLetterCombinations, // Изменено на RussianLetterCombinations
    monsterDamage: 0,
    attackInterval: 0,
    language: Language.RU,
  },
  {
    id: 2,
    name: 'Простые слова (RU)',
    description: 'Уровень с простыми русскими словами для набора',
    monsterHealth: 150,
    monsterRegeneration: 1,
    monsterHealOnMistake: 2,
    damageAmount: 4,
    requiredWPM: 30,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
    contentType: ContentType.SimpleWords, // Этот тип может быть общим, уточните
    monsterDamage: 1,
    attackInterval: 6000,
    language: Language.RU,
  },
  // Добавьте сюда остальные уровни для русского трека (до 10)
  // Например, уровень с Phrases, Paragraphs, Mixed, адаптированные для русского языка
];