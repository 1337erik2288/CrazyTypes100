import { LevelConfig, ContentType } from '../types';

export const mathLevels: LevelConfig[] = [
  {
    id: 4, // Используем существующий ID или новый, если нужно
    name: 'Числа и математика',
    description: 'Уровень с числами и математическими выражениями',
    monsterHealth: 250,
    monsterRegeneration: 3,
    monsterHealOnMistake: 5,
    damageAmount: 3,
    requiredWPM: 45,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
    contentType: ContentType.Math,
    monsterDamage: 3,
    attackInterval: 4500,
  },
  // Добавьте сюда остальные уровни для математического трека (до 10)
];