// ... existing code ...

// Define the ContentType enum that's missing
export enum ContentType {
  KeyCombos = 'key-combos',
  SimpleWords = 'simple-words',
  Phrases = 'phrases',
  Math = 'math',
  Code = 'code',
  Paragraphs = 'paragraphs',
  Mixed = 'mixed'
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  monsterHealth: number;
  monsterRegeneration: number;
  monsterHealOnMistake: number;
  damageAmount: number;
  requiredWPM: number;
  background: string;
  monsterImage: string;
  contentType: ContentType;
  monsterDamage: number; // Урон, наносимый монстром игроку
  attackInterval: number; // Add this property to fix the TypeScript errors
  // ... existing code ...
}

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: 'Основы быстрого набора',
    description: 'Начальный уровень для освоения основ быстрого набора',
    monsterHealth: 100,
    monsterRegeneration: 0,
    monsterHealOnMistake: 0,
    damageAmount: 5,
    requiredWPM: 20,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design.png',
    contentType: ContentType.KeyCombos,
    monsterDamage: 0, // Первый уровень без урона
    attackInterval: 0 // Нет атак
  },
  {
    id: 2,
    name: 'Простые слова',
    description: 'Уровень с простыми словами для набора',
    monsterHealth: 150,
    monsterRegeneration: 1,
    monsterHealOnMistake: 2,
    damageAmount: 4,
    requiredWPM: 30,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
    contentType: ContentType.SimpleWords,
    monsterDamage: 1, // Второй уровень с минимальным уроном
    attackInterval: 6000 // Атака каждые 6 секунд
  },
  // Для третьего уровня
  {
    id: 3,
    name: 'Фразы и сложные слова',
    description: 'Уровень с фразами и сложными словами',
    monsterHealth: 200,
    monsterRegeneration: 2,
    monsterHealOnMistake: 4,
    damageAmount: 3,
    requiredWPM: 40,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
    contentType: ContentType.Phrases,
    monsterDamage: 2, // Уменьшаем урон с 3 до 2
    attackInterval: 5000 // Атака каждые 5 секунд
  },
  // Для четвертого уровня
  {
    id: 4,
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
    attackInterval: 4500 // Проверьте, что это значение корректно
  },
  {
    id: 5,
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
    attackInterval: 4000 // Атака каждые 4 секунды
  },
  {
    id: 6,
    name: 'Сложные тексты',
    description: 'Уровень со сложными текстами для набора',
    monsterHealth: 350,
    monsterRegeneration: 6,
    monsterHealOnMistake: 10,
    damageAmount: 2,
    requiredWPM: 55,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
    monsterImage: '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png',
    contentType: ContentType.Paragraphs,
    monsterDamage: 5,
    attackInterval: 3500 // Атака каждые 3.5 секунды
  },
  {
    id: 7,
    name: 'Финальная битва',
    description: 'Финальный уровень с разнообразным контентом',
    monsterHealth: 500,
    monsterRegeneration: 7,
    monsterHealOnMistake: 15,
    damageAmount: 1,
    requiredWPM: 60,
    background: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design.png',
    contentType: ContentType.Mixed,
    monsterDamage: 8, // Финальный уровень с максимальным уроном
    attackInterval: 2500 // Атака каждые 2.5 секунды
  }
]

// Remove the duplicated interface definition below
/*
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  monsterHealth: number;
  monsterRegeneration: number;
  monsterHealOnMistake: number;
  damageAmount: number;
  requiredWPM: number;
  background: string;
  monsterImage: string;
  contentType: ContentType;
  monsterDamage: number; // Урон, наносимый монстром игроку
  // ... existing code ...
}
*/