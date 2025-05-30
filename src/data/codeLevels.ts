import { LevelConfig, ContentType } from '../types';

export const codeLevels: LevelConfig[] = [
  {
    id: 5, // Используем существующий ID или новый
    name: 'Кодовые строки',
    description: 'Уровень с кодовыми строками для набора',
    monsterHealth: 300,
    monsterRegeneration: 5,
    monsterHealOnMistake: 10,
    damageAmount: 2,
    requiredWPM: 50,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
    monsterImage: '/src/image/monster/DALL·E Cartoon March 18 2025.png',
    contentType: ContentType.Code,
    monsterDamage: 4,
    attackInterval: 4000,
  },
  // Добавьте сюда остальные уровни для трека с кодом (до 10)
];