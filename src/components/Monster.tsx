import React, { useState, useRef, useCallback } from 'react';
import './Monster.css';

interface MonsterProps {
  imagePath: string;
  isDefeated: boolean;
  takingDamage?: boolean;
  className?: string; // Добавляем этот prop для поддержки классов анимации
}

const Monster: React.FC<MonsterProps> = ({ imagePath, isDefeated, takingDamage, className }) => {
  return (
    <div className={`monster ${isDefeated ? 'defeated' : ''} ${takingDamage ? 'damage-animation' : ''} ${className || ''}`}>
      <img src={imagePath} alt="Monster" />
    </div>
  );
};

export default Monster;