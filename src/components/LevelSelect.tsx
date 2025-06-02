import React from 'react';
import './LevelSelect.css';
import PlayerStats from './PlayerStats';
import { PlayerProgress } from '../services/playerService'; // Импортируем обновленный тип
import OverallStatsModal from './level_select/OverallStatsModal';
import { getOverallStats, OverallPlayerStats } from '../services/overallStatsService';
import { useState } from 'react';
// import { GamePlayConfig } from './GamePlay'; // <--- УДАЛИТЬ ЭТОТ ИМПОРТ
import { LevelConfig, ContentType, Language } from '../types'; // Убедимся, что LevelConfig и Language импортированы

// Удалить следующие определения, так как они перенесены или будут заменены
// export type Language = 'en' | 'ru' | 'code' | 'key-combos' | 'simple-words' | 'phrases' | 'math' | 'paragraphs' | 'mixed' | 'keyboard-training';

// interface Level {
//   id: number;
//   name: string;
//   config: GamePlayConfig;
// }

// const levels: Level[] = [ ... ]; // <-- УДАЛИТЬ ВЕСЬ МАССИВ levels

interface LevelSelectProps {
  levelsToDisplay?: LevelConfig[];
  onLevelSelect?: (level: LevelConfig) => void;
  onTrackSelect?: (track: ContentType) => void; // <-- СДЕЛАНО ОПЦИОНАЛЬНЫМ
  completedLevels: string[];
  playerProgress: PlayerProgress;
  onOpenShop: () => void;
  onBackToTrackSelect?: () => void;
}

// Определяем trainingRoomLevelConfig здесь для примера
const trainingRoomLevelConfig: LevelConfig = {
  id: 0,
  name: 'Тренировочная комната',
  description: 'Оттачивайте свои навыки!',
  language: Language.EN,
  contentType: ContentType.KeyCombos,
  monsterHealth: 0,
  monsterRegeneration: 0,
  monsterHealOnMistake: 0,
  damageAmount: 0,
  backgroundImage: '',
  monsterImage: '',
  monsterDamage: 0, // Added missing property
  attackInterval: 0, // Added missing property
  levelContent: [],
  timeLimit: 0,
  experienceReward: 0,
  goldReward: 0,
  isSpecial: true
};

const LevelSelect: React.FC<LevelSelectProps> = ({ 
  levelsToDisplay, 
  onLevelSelect, 
  onTrackSelect, 
  completedLevels, 
  playerProgress, 
  onOpenShop,
  onBackToTrackSelect
}) => {
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [overallStats, setOverallStats] = useState<OverallPlayerStats | null>(null);

  const handleOpenOverallStats = () => {
    setOverallStats(getOverallStats());
    setShowStatsModal(true);
  };

  return (
    <div className="level-select">
      <h1>{levelsToDisplay ? 'Выберите уровень' : 'Выберите испытание'}</h1>

      {levelsToDisplay && onBackToTrackSelect && (
        <button onClick={onBackToTrackSelect} className="back-button">
          Назад к выбору трека
        </button>
      )}

      <div className="top-section-wrapper">
        <PlayerStats
          playerProgress={playerProgress}
          onOpenShop={onOpenShop}
          onOpenOverallStats={handleOpenOverallStats} 
        />
        
        {!levelsToDisplay && onLevelSelect && (
          <div className="training-room-shortcut-card">
            <div className="level-title">{trainingRoomLevelConfig.name}</div>
            <div className="training-icon-small">🏋️</div>
            <div className="level-content-small">{trainingRoomLevelConfig.description}</div>
            <button
              className="level-start-btn training-start-btn"
              onClick={() => onLevelSelect(trainingRoomLevelConfig)} 
            >
              Тренироваться
            </button>
          </div>
        )}
      </div>

      {showStatsModal && overallStats && (
        <OverallStatsModal stats={overallStats} onClose={() => setShowStatsModal(false)} />
      )}
      
      {levelsToDisplay && onLevelSelect ? (
        <div className="level-path-rect">
          {levelsToDisplay.map((level) => {
            const isCompleted = completedLevels.includes(level.id.toString());
            const stats = playerProgress.levelStats?.[level.id.toString()];
            return (
              <div key={level.id} className={`level-card-rect ${isCompleted ? 'completed' : ''}`}>
                <div className="level-title">{level.name}</div>
                {level.difficulty && (
                  <div className={`level-difficulty ${level.difficulty.toLowerCase()}`}>
                    Сложность: {level.difficulty}
                  </div>
                )}
                <div className="level-content">Описание: {level.description}</div>
                <div className="level-stats">
                  {stats ? (
                    <>
                      <div>Скорость: <b>{stats.speed.toFixed(2)} зн./мин</b></div>
                      <div>Точность: <b>{stats.accuracy.toFixed(2)}%</b></div>
                      {stats.errorChars && stats.errorChars.length > 0 && (
                        <div>Ошибки: <b>{stats.errorChars.join(', ')}</b></div>
                      )}
                    </>
                  ) : (
                    <div>Нет данных</div>
                  )}
                </div>
                <button
                  className="level-start-btn"
                  onClick={() => onLevelSelect(level)} 
                >
                  Начать
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="track-selection">
          <h2>Выберите трек:</h2>
          <div className="track-buttons">
            {onTrackSelect && (
              <>
                <button onClick={() => onTrackSelect(ContentType.RUSSIAN_TRACK)} className="track-button russian-track">
                  <span className="track-title">Русский язык</span>
                  <span className="track-description">Практикуйте набор текста на русском языке.</span>
                </button>
                <button onClick={() => onTrackSelect(ContentType.ENGLISH_TRACK)} className="track-button english-track">
                  <span className="track-title">Английский язык</span>
                  <span className="track-description">Совершенствуйте свои навыки набора текста на английском.</span>
                </button>
                <button onClick={() => onTrackSelect(ContentType.CODE_TRACK)} className="track-button code-track">
                  <span className="track-title">Программирование</span>
                  <span className="track-description">Набирайте фрагменты кода на различных языках.</span>
                </button>
                <button onClick={() => onTrackSelect(ContentType.MATH_TRACK)} className="track-button math-track">
                  <span className="track-title">Математика</span>
                  <span className="track-description">Практикуйтесь в наборе математических выражений.</span>
                </button>
                <button onClick={() => onTrackSelect(ContentType.DYNAMIC_CONTENT_TRACK)} className="track-button dynamic-content-track">
                  <span className="track-title">Меняющийся контент</span>
                  <span className="track-description">Уровни с динамически изменяющимся содержимым.</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelect;
