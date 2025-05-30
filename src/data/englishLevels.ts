import { LevelConfig, ContentType, Language } from '../types';

export const englishLevels: LevelConfig[] = [
  {
    id: 11, // Пример нового ID для английского трека
    name: 'Basic Typing (EN)',
    description: 'Beginner level for basic English typing skills',
    monsterHealth: 100,
    monsterRegeneration: 0,
    monsterHealOnMistake: 0,
    damageAmount: 5,
    requiredWPM: 20,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg', // Другой фон для разнообразия
    monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
    contentType: ContentType.KeyCombos, // Этот тип может быть общим, уточните
    monsterDamage: 0,
    attackInterval: 0,
    language: Language.EN,
  },
  {
    id: 12,
    name: 'Simple Words (EN)',
    description: 'Level with simple English words',
    monsterHealth: 150,
    monsterRegeneration: 1,
    monsterHealOnMistake: 2,
    damageAmount: 4,
    requiredWPM: 30,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
    contentType: ContentType.SimpleWords, // Этот тип может быть общим, уточните
    monsterDamage: 1,
    attackInterval: 6000,
    language: Language.EN,
  },
  // Добавьте сюда остальные уровни для английского трека (до 10)
];