import React from 'react';

interface MonsterProps {
  shape: string;
  color: string;
  isDefeated: boolean;
}

const Monster: React.FC<MonsterProps> = ({ shape, color, isDefeated }) => {
  return (
    <div className={`monster ${isDefeated ? 'defeated' : ''}`}
      style={{ 
        backgroundColor: color, 
        ...(shape === 'circle' ? { borderRadius: '50%' } :
          shape === 'triangle' ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } :
          shape === 'pentagon' ? { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' } :
          shape === 'hexagon' ? { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' } :
          { borderRadius: '0' })
      }}>
      <div className="eyes">
        <div className="eye"></div>
        <div className="eye"></div>
      </div>
    </div>
  );
};

export default Monster;