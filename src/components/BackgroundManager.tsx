import React, { useState, useCallback, useRef } from 'react';

interface BackgroundManagerProps {
  imagePath: string;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ imagePath }) => {
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
    <div className="background">
      <img
        src={imagePath}
        alt="Background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'pointer'
        }}
        onClick={handleClick}
      />
    </div>
  );
};

export default BackgroundManager;