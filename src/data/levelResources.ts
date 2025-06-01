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



const backgroundImages = [
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg'
];

const monsterImages = [
  '/src/image/monster/Cartoon Monster Design 3.png',
  '/src/image/monster/Cartoon Monster Design.jpg',
  '/src/image/monster/Cartoon Monster Design.png',
  '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
  '/src/image/monster/Cartoon Style Monster Photoroom.png',
  '/src/image/monster/DALL·E Cartoon March 18 2025.png',
  '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png'
];

export const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  return backgroundImages[randomIndex];
};

export const getRandomMonsterImage = () => {
  const randomIndex = Math.floor(Math.random() * monsterImages.length);
  return monsterImages[randomIndex];
};
