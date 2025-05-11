import React from 'react';
import './Monster.css';

interface MonsterProps {
  imagePath: string;
  isDefeated: boolean;
  takingDamage?: boolean;
  className?: string; // Добавляем этот проп для поддержки классов анимации
}

const Monster: React.FC<MonsterProps> = ({ imagePath, isDefeated, takingDamage, className }) => {
  return (
    <div className={`monster ${isDefeated ? 'defeated' : ''} ${takingDamage ? 'damage-animation' : ''} ${className || ''}`}>
      <img src={imagePath} alt="Монстр" />
    </div>
  );
};

export default Monster;