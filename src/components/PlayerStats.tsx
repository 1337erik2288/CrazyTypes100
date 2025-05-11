import React from 'react';
import './PlayerStats.css';
import { PlayerProgress, calculateLevelProgress } from '../services/playerService';

interface PlayerStatsProps {
  playerProgress: PlayerProgress;
  onOpenShop?: () => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerProgress, onOpenShop }) => {
  const progressPercentage = calculateLevelProgress(playerProgress);
  
  return (
    <div className="player-stats">
      <div className="player-level">
        <span className="level-label">Уровень {playerProgress.level}</span>
      </div>
      
      <div className="xp-container">
        <div className="xp-bar">
          <div 
            className="xp-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
          <span className="xp-text">
            {playerProgress.experience} XP
            {playerProgress.level < 10 && (
              <> / Следующий уровень: {progressPercentage}%</>
            )}
          </span>
        </div>
      </div>
      
      <div className="gold-container" onClick={onOpenShop} style={{ cursor: onOpenShop ? 'pointer' : 'default' }}>
        <span className="gold-icon">💰</span>
        <span className="gold-amount">{playerProgress.gold}</span>
        {onOpenShop && <span className="shop-hint">Магазин</span>}
      </div>
    </div>
  );
};

export default PlayerStats;