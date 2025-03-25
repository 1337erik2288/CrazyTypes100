import React, { useState, useRef, useCallback } from 'react';
import './Monster.css';

interface MonsterProps {
  imagePath: string;
  isDefeated: boolean;
}

const Monster: React.FC<MonsterProps> = ({ imagePath, isDefeated }) => {
  const [clickCount, setClickCount] = useState(0);
  const lastClickTime = useRef<number>(0);
  const TRIPLE_CLICK_TIMEOUT = 500; // 500ms timeout for triple click

  const handleClick = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime.current <= TRIPLE_CLICK_TIMEOUT) {
      setClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 3) {
          console.log(`
    _______________
   < Есть секретный >
   < коровий уровень! >
    ---------------
           \   ^__^
            \  (oo)\_______
               (__)\       )\/\
                   ||----w |
                   ||     ||
          `);
          return 0;
        }
        return newCount;
      });
    } else {
      setClickCount(1);
    }
    lastClickTime.current = currentTime;
  }, []);

  return (
    <div 
      className={`monster ${isDefeated ? 'defeated' : ''}`}
      onClick={handleClick}
    >
      <img 
        src={imagePath} 
        alt="Monster" 
        style={{
          width: 'auto',
          height: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          opacity: isDefeated ? 0.5 : 1
        }}
      />
    </div>
  );
}

export default Monster;