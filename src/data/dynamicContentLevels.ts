import { LevelConfig, ContentType, Language } from '../types';
import { mixedChallenges } from './mixed-challenges';

// Функция для получения случайного элемента из массива
const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const dynamicContentLevels: LevelConfig[] = [
  {
    id: 51,
    name: 'Dynamic Challenge 1',
    description: 'First level with dynamically changing content.',
    monsterHealth: 100,
    monsterRegeneration: 1,
    monsterHealOnMistake: 5,
    damageAmount: 10,
    monsterDamage: 5,
    attackInterval: 3000,
    backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
    contentType: ContentType.DYNAMIC_CONTENT_TRACK,
    language: Language.EN,
    levelContent: [
      getRandomElement(mixedChallenges.code),
      getRandomElement(mixedChallenges.complexWords),
      getRandomElement(mixedChallenges.mathExpressions),
      getRandomElement(mixedChallenges.paragraphs)
    ],
    difficulty: 'Easy',
    experienceReward: 100,
    goldReward: 10
  },
  {
    id: 52,
    name: 'Dynamic Challenge 2',
    description: 'Second level, slightly harder.',
    monsterHealth: 120,
    monsterRegeneration: 1,
    monsterHealOnMistake: 4,
    damageAmount: 12,
    monsterDamage: 6,
    attackInterval: 2800,
    backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Design.png',
    contentType: ContentType.DYNAMIC_CONTENT_TRACK,
    language: Language.EN,
    levelContent: [
      getRandomElement(mixedChallenges.code),
      getRandomElement(mixedChallenges.complexWords),
      getRandomElement(mixedChallenges.mathExpressions),
      getRandomElement(mixedChallenges.paragraphs)
    ],
    difficulty: 'Medium',
    experienceReward: 120,
    goldReward: 12
  },
  {
    id: 53,
    name: 'Dynamic Challenge 3',
    description: 'Third level, the challenge increases.',
    monsterHealth: 150,
    monsterRegeneration: 2,
    monsterHealOnMistake: 3,
    damageAmount: 15,
    monsterDamage: 7,
    attackInterval: 2500,
    backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
    monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
    contentType: ContentType.DYNAMIC_CONTENT_TRACK,
    language: Language.EN,
    levelContent: [
      getRandomElement(mixedChallenges.code),
      getRandomElement(mixedChallenges.complexWords),
      getRandomElement(mixedChallenges.mathExpressions),
      getRandomElement(mixedChallenges.paragraphs)
    ],
    difficulty: 'Hard',
    experienceReward: 150,
    goldReward: 15
  },
  {
    id: 54,
    name: 'Dynamic Challenge 4',
    description: 'Fourth level, getting tough!',
    monsterHealth: 180,
    monsterRegeneration: 2,
    monsterHealOnMistake: 2,
    damageAmount: 18,
    monsterDamage: 8,
    attackInterval: 2200,
    backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
    monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
    contentType: ContentType.DYNAMIC_CONTENT_TRACK,
    language: Language.EN,
    levelContent: [
      getRandomElement(mixedChallenges.code),
      getRandomElement(mixedChallenges.complexWords),
      getRandomElement(mixedChallenges.mathExpressions),
      getRandomElement(mixedChallenges.paragraphs)
    ],
    difficulty: 'Very Hard',
    experienceReward: 180,
    goldReward: 18
  },
  {
    id: 55,
    name: 'Dynamic Challenge 5',
    description: 'Final dynamic challenge, master it!',
    monsterHealth: 220,
    monsterRegeneration: 3,
    monsterHealOnMistake: 1,
    damageAmount: 20,
    monsterDamage: 10,
    attackInterval: 2000,
    backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
    monsterImage: '/src/image/monster/DALL·E Cartoon March 18 2025.png',
    contentType: ContentType.DYNAMIC_CONTENT_TRACK,
    language: Language.EN,
    levelContent: [
      getRandomElement(mixedChallenges.code),
      getRandomElement(mixedChallenges.complexWords),
      getRandomElement(mixedChallenges.mathExpressions),
      getRandomElement(mixedChallenges.paragraphs)
    ],
    difficulty: 'Expert',
    experienceReward: 220,
    goldReward: 22
  }
];