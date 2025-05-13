import React from 'react';
import './LevelSelect.css';
import { GamePlayConfig } from './GamePlay';
import PlayerStats from './PlayerStats';
import { PlayerProgress } from '../services/playerService'; // Импортируем обновленный тип
import OverallStatsModal from './level_select/OverallStatsModal';
import { getOverallStats } from '../services/overallStatsService';
import { useState } from 'react';
import { levelResources } from '../data/levelResources';

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
      // damageAmount: 5, // <--- Удалено
      healOnMistake: 0,
      language: 'key-combos',
      monsterDamage: 0, 
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
      // damageAmount: 4, // <--- Удалено
      healOnMistake: 2,
      language: 'simple-words',
      monsterDamage: 2,
      attackInterval: 6000
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
      // damageAmount: 3, // <--- Удалено
      healOnMistake: 4,
      language: 'phrases',
      monsterDamage: 3,
      attackInterval: 5000
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
      // damageAmount: 3, // <--- Удалено
      healOnMistake: 5,
      language: 'math',
      monsterDamage: 5,
      attackInterval: 4500
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
      // damageAmount: 2, // <--- Удалено
      healOnMistake: 10,
      language: 'code',
      monsterDamage: 6,
      attackInterval: 4000
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
      // damageAmount: 2, // <--- Удалено
      healOnMistake: 10,
      language: 'paragraphs',
      monsterDamage: 7,
      attackInterval: 3500
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
      // damageAmount: 1, // <--- Удалено
      healOnMistake: 15,
      language: 'mixed',
      monsterDamage: 8,
      attackInterval: 3000
    }
  }
];

interface LevelSelectProps {
  onLevelSelect: (config: GamePlayConfig, levelId: number) => void;
  completedLevels: string[]; // Было number[]
  playerProgress: PlayerProgress;
  onOpenShop: () => void;
}

const levelDescriptions: Record<number, { difficulty: string; content: string; diffClass: string }> = {
  1: { difficulty: 'Легко', content: 'Комбинации клавиш', diffClass: 'easy' },
  2: { difficulty: 'Легко', content: 'Простые слова', diffClass: 'easy' },
  3: { difficulty: 'Средне', content: 'Фразы и сложные слова', diffClass: 'medium' },
  4: { difficulty: 'Средне', content: 'Числа и математика', diffClass: 'medium' },
  5: { difficulty: 'Сложно', content: 'Кодовые строки', diffClass: 'hard' },
  6: { difficulty: 'Сложно', content: 'Сложные тексты', diffClass: 'hard' },
  7: { difficulty: 'Сложно', content: 'Смешанный режим', diffClass: 'hard' }
};

const LevelSelect: React.FC<LevelSelectProps> = ({ onLevelSelect, completedLevels, playerProgress, onOpenShop }) => {
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [overallStats, setOverallStats] = useState<any | null>(null); // TODO: Replace 'any' with the actual type of overallStats

  // Sort levels by ID to ensure correct order
  // Сортировка по id
  const sortedLevels = [...levelResources].sort((a, b) => a.id - b.id);

  return (
    <div className="level-select">
      <h1>Выберите испытание</h1>
      <PlayerStats playerProgress={playerProgress} onOpenShop={onOpenShop} />
      <button 
        onClick={() => { 
          setOverallStats(getOverallStats()); 
          setShowStatsModal(true); 
        }} 
        className="open-stats-btn"
      >
        Общая статистика
      </button>
      {showStatsModal && overallStats && ( /* Added null check for overallStats */
        <OverallStatsModal stats={overallStats} onClose={() => setShowStatsModal(false)} />
      )}
      <div className="level-path-rect">
        {sortedLevels.map((level) => {
          const isCompleted = completedLevels.includes(level.id.toString());
          const stats = playerProgress.levelStats?.[level.id.toString()];
          return (
            <div key={level.id} className={`level-card-rect ${isCompleted ? 'completed' : ''}`}>
              <div className="level-title">{level.name}</div>
              <div className={`level-difficulty ${level.diffClass}`}>Сложность: <b>{level.difficulty}</b></div>
              <div className="level-content">Содержание: {level.content}</div>
              <div className="level-stats">
                {stats ? (
                  <>
                    <div>Скорость: <b>{stats.speed.toFixed(2)} зн./мин</b></div>
                    <div>Точность: <b>{stats.accuracy.toFixed(2)}%</b></div>
                  </>
                ) : (
                  <div>Нет данных</div>
                )}
              </div>
              <button
                className="level-start-btn"
                onClick={() => onLevelSelect(level.config, level.id)}
                disabled={level.id > Math.max(...completedLevels.map(id => parseInt(id, 10)), 0) + 1 && completedLevels.length > 0 || (completedLevels.length === 0 && level.id > 1) } // Логика disabled должна учитывать, что completedLevels теперь string[]
              >
                {isCompleted ? 'Повторить' : 'Начать'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelect;
export { levels };
export type { Level };