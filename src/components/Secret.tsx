import React, { useState, useEffect } from 'react';

interface CasinoProps {
  onClose: () => void;
  onWin: (amount: number) => void;
}

const Casino: React.FC<CasinoProps> = ({ onClose, onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState([0, 0, 0]);
  const [result, setResult] = useState<string | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const monsterImages = [
    '/src/image/monster/Cartoon Monster Design 3.png',
    '/src/image/monster/Cartoon Monster Design.png',
    '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
    '/src/image/monster/Cartoon Style Monster Photoroom.png',
    '/src/image/monster/DALL·E Cartoon March 18 2025.png',
    '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png'
  ];

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    setWinAmount(0);
    
    let newSlots = [0, 0, 0];
    const animationDuration = 2000;
    const intervalTime = 100;
    let iterations = animationDuration / intervalTime;
    let count = 0;

    const spinInterval = setInterval(() => {
      newSlots = [
        Math.floor(Math.random() * monsterImages.length),
        Math.floor(Math.random() * monsterImages.length),
        Math.floor(Math.random() * monsterImages.length)
      ];
      setSlots([...newSlots]);
      count++;
      if (count >= iterations) {
        clearInterval(spinInterval);
        setSpinning(false);
        checkWin(newSlots);
      }
    }, intervalTime);
  };

  const checkWin = (newSlots: number[]) => {
    if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
      const amount = Math.floor(Math.random() * (150 - 30 + 1)) + 30;
      setResult('Jackpot! 🎉');
      setWinAmount(amount);
      onWin(amount);
    } else if (newSlots[0] === newSlots[1] || newSlots[1] === newSlots[2] || newSlots[0] === newSlots[2]) {
      setResult('Almost! Try again!');
    } else {
      setResult('Try again!');
    }
  };

  return (
    <div className="casino-overlay">
      <div className="casino-container">
        <div className="casino-header">
          <h2>Monster Casino</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="slot-machine">
          <div className="slots-container">
            {slots.map((slotIndex, index) => (
              <div key={index} className="slot">
                <img src={monsterImages[slotIndex]} alt={`Monster ${slotIndex}`} className={spinning ? 'spinning' : ''} />
              </div>
            ))}
          </div>
        </div>
        <button className="spin-button" onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning...' : 'Spin!'}
        </button>
        {result && (
          <div className={`casino-result ${winAmount > 0 ? 'win' : ''}`}>
            <p>{result}</p>
            {winAmount > 0 && <p className="win-amount">+{winAmount} gold</p>}
          </div>
        )}
        <p className="casino-rules">Match 3 monsters: Win 30-150 gold</p>
      </div>
    </div>
  );
};

export default Casino;
