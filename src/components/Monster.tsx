import React from 'react';

interface MonsterProps {
  imagePath: string;
  isDefeated: boolean;
}

const Monster: React.FC<MonsterProps> = ({ imagePath, isDefeated }) => {
  return (
    <div className={`monster ${isDefeated ? 'defeated' : ''}`}>
      <img 
        src={imagePath} 
        alt="Monster" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '10px'
        }}
      />
    </div>
  );
};

export default Monster;