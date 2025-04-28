import React from 'react';
import './PlayerHealthBar.css';

interface PlayerHealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

const PlayerHealthBar: React.FC<PlayerHealthBarProps> = ({ currentHealth, maxHealth }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;
  
  // Определение цвета полосы здоровья в зависимости от процента
  let healthBarColor = 'green';
  if (healthPercentage < 30) {
    healthBarColor = 'red';
  } else if (healthPercentage < 60) {
    healthBarColor = 'orange';
  }

  return (
    <div className="player-health-container">
      <div className="player-health-label">Здоровье игрока:</div>
      <div className="player-health-bar">
        <div 
          className="player-health-fill" 
          style={{ 
            width: `${healthPercentage}%`, 
            backgroundColor: healthBarColor 
          }}
        />
        <div className="player-health-text">
          {`${Math.round(healthPercentage)}% | ${currentHealth}/${maxHealth}`}
        </div>
      </div>
    </div>
  );
};

export default PlayerHealthBar;