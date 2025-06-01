import { GamePlayConfig } from '../components/GamePlay';

export interface LevelResource {
  id: number;
  name: string;
  description: string;
  content: string;
  difficulty: string;
  diffClass: string;
  config: GamePlayConfig;
}

export const levelResources: LevelResource[] = [
  {
    id: 1, // Убедитесь, что ID уникален, например, следующий по порядку
    name: 'Основы быстрого набора',
    description: 'Начальный уровень для освоения основ быстрого набора.',
    content: 'Комбинации клавиш',
    difficulty: 'Легко',
    diffClass: 'easy',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
      initialHealth: 100,
      healAmount: 0,
      regenerateAmount: 0,
      healOnMistake: 0,
      language: 'key-combos',
      monsterDamage: 0,
      attackInterval: 0
    }
  },
  {
    id: 2,
    name: 'Простые слова',
    description: 'Уровень для тренировки набора простых слов.',
    content: 'Простые слова',
    difficulty: 'Легко',
    diffClass: 'easy',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
      initialHealth: 150,
      healAmount: 0,
      regenerateAmount: 1,
      healOnMistake: 2,
      language: 'simple-words',
      monsterDamage: 2,
      attackInterval: 6000
    }
  },
  {
    id: 3,
    name: 'Фразы и сложные слова',
    description: 'Уровень для тренировки набора сложных слов и фраз.',
    content: 'Фразы и сложные слова',
    difficulty: 'Средне',
    diffClass: 'medium',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
      initialHealth: 200,
      healAmount: 0,
      regenerateAmount: 2,
      healOnMistake: 4,
      language: 'phrases',
      monsterDamage: 3,
      attackInterval: 5000
    }
  },
  {
    id: 4,
    name: 'Числа и математика',
    description: 'Уровень для тренировки набора чисел и математических выражений.',
    content: 'Числа и математика',
    difficulty: 'Средне',
    diffClass: 'medium',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
      initialHealth: 250,
      healAmount: 0,
      regenerateAmount: 3,
      healOnMistake: 5,
      language: 'math',
      monsterDamage: 5,
      attackInterval: 4500
    }
  },
  {
    id: 5,
    name: 'Кодовые строки',
    description: 'Уровень для тренировки набора строк кода.',
    content: 'Кодовые строки',
    difficulty: 'Сложно',
    diffClass: 'hard',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
      monsterImage: '/src/image/monster/DALL·E Cartoon March 18 2025.png',
      initialHealth: 300,
      healAmount: 0,
      regenerateAmount: 5,
      healOnMistake: 10,
      language: 'code',
      monsterDamage: 6,
      attackInterval: 4000
    }
  },
  {
    id: 6,
    name: 'Сложные тексты',
    description: 'Уровень для тренировки набора сложных текстов.',
    content: 'Сложные тексты',
    difficulty: 'Сложно',
    diffClass: 'hard',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png',
      initialHealth: 350,
      healAmount: 0,
      regenerateAmount: 6,
      healOnMistake: 10,
      language: 'paragraphs',
      monsterDamage: 7,
      attackInterval: 3500
    }
  },
  {
    id: 7,
    name: 'Финальная битва',
    description: 'Финальный уровень со смешанным содержанием.',
    content: 'Смешанный режим',
    difficulty: 'Сложно',
    diffClass: 'hard',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
      initialHealth: 500,
      healAmount: 0,
      regenerateAmount: 7,
      healOnMistake: 15,
      language: 'mixed',
      monsterDamage: 8,
      attackInterval: 3000
    }
  },
  {
    id: 8, // Убедитесь, что ID уникален, например, следующий по порядку
    name: 'test',
    description: 'test',
    content: 'Фразы и сложные слова',
    difficulty: 'test',
    diffClass: 'hard',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
      initialHealth: 1000,
      healAmount: 0,
      regenerateAmount: 10,
      healOnMistake: 10,
      language: 'phrases',
      monsterDamage: 0,
      attackInterval: 3000
    }
  },
  { // Новый уровень для тренировочной комнаты
    id: 9, // Используйте следующий доступный ID
    name: 'Тренировочная комната',
    description: 'Обучение слепому набору текста и правильному расположению пальцев.',
    content: 'Клавиатурный тренажер',
    difficulty: 'Обучение', // Или любой другой подходящий
    diffClass: 'training', // Можно добавить новый класс для стилизации карточки уровня
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg', // Подберите подходящий фон
      monsterImage: '', // Монстр не нужен
      initialHealth: 0, // Здоровье монстра не нужно
      healAmount: 0,
      regenerateAmount: 0,
      healOnMistake: 0,
      language: 'keyboard-training', // Уникальный идентификатор типа уровня
      monsterDamage: 0, // Урон монстра не нужен
      attackInterval: 0 // Интервал атаки не нужен
      // Можно добавить специфичные для тренажера параметры, если нужно
    }
  }
];
