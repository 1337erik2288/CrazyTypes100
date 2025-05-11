import React from 'react';
import './DefeatScreen.css'; // Мы создадим этот файл дальше

interface DefeatScreenProps {
  onRestart: () => void;
  onReturnToMenu: () => void;
}

const DefeatScreen: React.FC<DefeatScreenProps> = ({ onRestart, onReturnToMenu }) => {
  return (
    <div className="defeat-screen">
      <h2>Поражение</h2>
      <p>К сожалению, монстр оказался сильнее в этот раз.</p>
      <div className="defeat-buttons">
        <button onClick={onRestart} className="restart-button-defeat">
          Попробовать снова
        </button>
        <button onClick={onReturnToMenu} className="menu-button-defeat">
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default DefeatScreen;