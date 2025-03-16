import React from 'react';
import { GamePlayConfig } from './GamePlay';

interface Level {
  id: number;
  name: string;
  config: GamePlayConfig;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Easy English',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/IMG_0263.JPG',
      initialHealth: 150,
      healAmount: 5,
      regenerateAmount: 1,
      damageAmount: 4,
      healOnMistake: 5,
      language: 'en'
    }
  },
  {
    id: 2,
    name: 'Hard English',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
      monsterImage: '/src/image/SVOyMINIOn.webp',
      initialHealth: 200,
      healAmount: 0,
      regenerateAmount: 0,
      damageAmount: 3,
      healOnMistake: 8,
      language: 'en'
    }
  },
  {
    id: 3,
    name: 'Easy Russian',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/photo_2023-04-21_13-34-14.jpg',
      initialHealth: 150,
      healAmount: 5,
      regenerateAmount: 1,
      damageAmount: 4,
      healOnMistake: 5,
      language: 'ru'
    }
  },
  {
    id: 4,
    name: 'Hard Russian',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/photo_2024-12-19_14-46-01.jpg',
      initialHealth: 200,
      healAmount: 0,
      regenerateAmount: 0,
      damageAmount: 3,
      healOnMistake: 8,
      language: 'ru'
    }
  }
];

interface LevelSelectProps {
  onLevelSelect: (config: GamePlayConfig) => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onLevelSelect }) => {
  return (
    <div className="level-select">
      <h1>Select Level</h1>
      <div className="level-grid">
        {levels.map((level) => (
          <button
            key={level.id}
            className="level-button"
            onClick={() => onLevelSelect(level.config)}
          >
            {level.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
export { levels };
export type { Level };