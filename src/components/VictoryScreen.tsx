import React, { useEffect } from 'react'; // Восстановлен useEffect
import './VictoryScreen.css';
import { LevelReward, calculatePlayerRating } from '../services/playerService';
import { saveLevelResult } from '../services/progressService'; // Восстановлен импорт

interface GameStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number;
  endTime: number | null;
  errorChars?: string[];
}

interface VictoryScreenProps {
  gameStats: GameStats;
  onRestart: () => void;
  onLevelComplete: () => void;
  rewards?: LevelReward;
  isFirstCompletion?: boolean;
  speed: number; // Пропс восстановлен
  accuracy: number; // Пропс восстановлен
  levelId: number; // Пропс восстановлен
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  onRestart,
  onLevelComplete,
  rewards,
  isFirstCompletion,
  speed, // Пропс восстановлен
  accuracy, // Пропс восстановлен
  gameStats,
  levelId // Пропс восстановлен
}) => {
  useEffect(() => {
    if (levelId !== undefined && levelId !== null) {
      saveLevelResult(levelId.toString(), speed, accuracy, gameStats.errorChars || []);
    }
  }, [levelId, speed, accuracy, gameStats.errorChars]); // Восстановлен useEffect

  return (
    <div className="victory-screen">
      <h2>Победа!</h2>
      <p>Вы одолели монстра!</p>
      <div className="stats">
        <p>Время: {((gameStats.endTime || Date.now()) - gameStats.startTime) / 1000} секунд</p>
        <p>Всего символов: {gameStats.totalChars}</p>
        <p>Правильных символов: {gameStats.correctChars}</p>
        <p>Ошибок: {gameStats.incorrectChars}</p>
        {gameStats.errorChars && gameStats.errorChars.length > 0 && (
          <p>Символы с ошибками: {gameStats.errorChars.join(', ')}</p>
        )}
        <p>Точность: {((gameStats.correctChars / gameStats.totalChars) * 100).toFixed(1)}%</p>
        <p>Скорость: {Math.round((gameStats.totalChars / ((gameStats.endTime || Date.now()) - gameStats.startTime)) * 60000)} зн/мин</p>
        <p>Рейтинг: {Math.round(calculatePlayerRating(
          Math.round((gameStats.totalChars / ((gameStats.endTime || Date.now()) - gameStats.startTime)) * 60000),
          ((gameStats.correctChars / gameStats.totalChars) * 100)
        ))}</p>
        {isFirstCompletion && rewards && (
          <div className="rewards">
            <p className="reward-title">Полученные награды:</p>
            <p className="xp-reward">+{rewards.experience} XP</p>
            <p className="gold-reward">+{rewards.gold} Золота</p>
          </div>
        )}
      </div>
      <div className="victory-buttons">
        <button onClick={onRestart} className="restart-button">
          Играть снова
        </button>
        <button onClick={onLevelComplete} className="return-button"> 
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;