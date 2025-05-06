import React from 'react';
import './LevelSelect.css';
import { GamePlayConfig } from './GamePlay';
import PlayerStats from './PlayerStats';
import { PlayerProgress } from '../services/playerService';

export type Language = 'en' | 'ru' | 'code' | 'key-combos' | 'simple-words' | 'phrases' | 'math' | 'paragraphs' | 'mixed';

interface Level {
  id: number;
  name: string;
  config: GamePlayConfig;
}

const levels: Level[] = [
  {
    id: 1,
    name: 'Основы быстрого набора',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
      initialHealth: 100,
      healAmount: 0,
      regenerateAmount: 0,
      damageAmount: 5,
      healOnMistake: 0,
      language: 'key-combos',
      monsterDamage: 0, // Первый уровень без урона
      attackInterval: 0
    }
  },
  {
    id: 2,
    name: 'Простые слова',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design 3.png',
      initialHealth: 150,
      healAmount: 0,
      regenerateAmount: 1,
      damageAmount: 4,
      healOnMistake: 2,
      language: 'simple-words',
      monsterDamage: 2,
      attackInterval: 6000  // Increase from 1000ms to 6000ms (6 seconds)
    }
  },
  {
    id: 3,
    name: 'Фразы и сложные слова',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
      initialHealth: 200,
      healAmount: 0,
      regenerateAmount: 2,
      damageAmount: 3,
      healOnMistake: 4,
      language: 'phrases',
      monsterDamage: 3,
      attackInterval: 5000  // Increase from 1000ms to 5000ms (5 seconds)
    }
  },
  {
    id: 4,
    name: 'Числа и математика',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Style Monster Photoroom.png',
      initialHealth: 250,
      healAmount: 0,
      regenerateAmount: 3,
      damageAmount: 3,
      healOnMistake: 5,
      language: 'math',
      monsterDamage: 5,
      attackInterval: 4500  // Increase from 1000ms to 4500ms (4.5 seconds)
    }
  },
  {
    id: 5,
    name: 'Кодовые строки',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
      monsterImage: '/src/image/monster/DALL·E Cartoon March 18 2025.png',
      initialHealth: 300,
      healAmount: 0,
      regenerateAmount: 5,
      damageAmount: 2,
      healOnMistake: 10,
      language: 'code',
      monsterDamage: 6,
      attackInterval: 4000  // Increase from 1000ms to 4000ms (4 seconds)
    }
  },
  {
    id: 6,
    name: 'Сложные тексты',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg',
      monsterImage: '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png',
      initialHealth: 350,
      healAmount: 0,
      regenerateAmount: 6,
      damageAmount: 2,
      healOnMistake: 10,
      language: 'paragraphs',
      monsterDamage: 7,
      attackInterval: 3500  // Increase from 1000ms to 3500ms (3.5 seconds)
    }
  },
  {
    id: 7,
    name: 'Финальная битва',
    config: {
      backgroundImage: '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
      monsterImage: '/src/image/monster/Cartoon Monster Design.png',
      initialHealth: 500,
      healAmount: 0,
      regenerateAmount: 7,
      damageAmount: 1,
      healOnMistake: 15,
      language: 'mixed',
      monsterDamage: 8,
      attackInterval: 3000  // Increase from 1000ms to 3000ms (3 seconds)
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