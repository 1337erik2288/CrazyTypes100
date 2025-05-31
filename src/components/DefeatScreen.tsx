import React from 'react';
import './DefeatScreen.css'; // Мы создадим этот файл дальше

interface DefeatScreenProps {
  onRestart: () => void;
  onLevelComplete: () => void; // Заменено onReturnToMenu на onLevelComplete
}

const DefeatScreen: React.FC<DefeatScreenProps> = ({ onRestart, onLevelComplete }) => { // Обновлено для использования onLevelComplete
  return (
    <div className="defeat-screen">
      <h2>Поражение</h2>
      <p>К сожалению, монстр оказался сильнее в этот раз.</p>
      <div className="defeat-buttons">
        <button onClick={onRestart} className="restart-button-defeat">
          Попробовать снова
        </button>
        <button onClick={onLevelComplete} className="menu-button-defeat"> // Обновлено для использования onLevelComplete
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default DefeatScreen;