import React from 'react';
import { GamePlayConfig } from './GamePlay';
import PlayerStats from './PlayerStats';
import { PlayerProgress } from '../services/playerService';

export type Language = 'en' | 'ru' | 'code';

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
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
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
      monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
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
      monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
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
      monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
      initialHealth: 200,
      healAmount: 0,
      regenerateAmount: 0,
      damageAmount: 3,
      healOnMistake: 8,
      language: 'ru'
    }
  },
  {
    id: 5,
    name: 'Code Challenge',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/monster/DALL·E Cartoon March 18 2025.png',
      initialHealth: 250,
      healAmount: 0,
      regenerateAmount: 0,
      damageAmount: 2,
      healOnMistake: 10,
      language: 'code'
    }
  }
];

interface LevelSelectProps {
  onLevelSelect: (config: GamePlayConfig, levelId: number) => void;
  completedLevels: number[];
  playerProgress: PlayerProgress;
  onOpenShop: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onLevelSelect, completedLevels, playerProgress, onOpenShop }) => {
  // Sort levels by ID to ensure correct order
  const sortedLevels = [...levels].sort((a, b) => a.id - b.id);
  
  return (
    <div className="level-select">
      <h1>Choose Your Challenge</h1>
      <PlayerStats playerProgress={playerProgress} onOpenShop={onOpenShop} />
      <div className="level-path">
        {sortedLevels.map((level) => (
          <div key={level.id} className="level-node">
            <div className="level-connector" />
            <button
              className={`level-circle ${level.config.language === 'ru' ? 'russian' : (level.config.language === 'code' ? 'code' : 'english')} ${completedLevels.includes(level.id) ? 'completed' : ''}`}
              data-language={level.config.language}
              onClick={() => onLevelSelect(level.config, level.id)}
            >
              <span className="level-number">{level.id}</span>
              <span className="level-name">{level.name}</span>
              <span className="level-difficulty">
                {level.name.toLowerCase().includes('hard') ? '★★★' : '★★'}
              </span>
              {completedLevels.includes(level.id) && (
                <span className="level-completed-indicator">✓</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
export { levels };
export type { Level };