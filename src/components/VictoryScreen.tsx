import React from 'react';
import { LevelReward } from '../services/playerService';

interface GameStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number;
  endTime: number | null;
}

interface VictoryScreenProps {
  gameStats: GameStats;
  onRestart: () => void;
  onReturnToMenu: () => void;
  rewards?: LevelReward;
  isFirstCompletion?: boolean;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ gameStats, onRestart, onReturnToMenu, rewards, isFirstCompletion = false }) => {
  return (
    <div className="victory-screen">
      <h2>Victory!</h2>
      <p>You defeated the monster!</p>
      <div className="stats">
        <p>Time: {((gameStats.endTime || Date.now()) - gameStats.startTime) / 1000} seconds</p>
        <p>Total characters: {gameStats.totalChars}</p>
        <p>Correct characters: {gameStats.correctChars}</p>
        <p>Mistakes: {gameStats.incorrectChars}</p>
        <p>Accuracy: {((gameStats.correctChars / gameStats.totalChars) * 100).toFixed(1)}%</p>
        <p>Speed: {Math.round((gameStats.totalChars / ((gameStats.endTime || Date.now()) - gameStats.startTime)) * 60000)} CPM</p>
        
        {isFirstCompletion && rewards && (
          <div className="rewards">
            <p className="reward-title">Rewards Earned:</p>
            <p className="xp-reward">+{rewards.experience} XP</p>
            <p className="gold-reward">+{rewards.gold} Gold</p>
          </div>
        )}
      </div>
      <div className="victory-buttons">
        <button onClick={onRestart} className="restart-button">
          Play Again
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;