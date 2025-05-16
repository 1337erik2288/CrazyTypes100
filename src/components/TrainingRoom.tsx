import React, { useState, useEffect, useCallback } from 'react';
import './TrainingRoom.css'; // Стили будут созданы ниже

// Заглушка для компонента виртуальной клавиатуры
// Вам нужно будет создать этот компонент или использовать готовую библиотеку
// Props:
// - highlightedKey: string | null - символ клавиши для подсветки
// - fingerPlacement: any - данные для отображения правильного расположения пальцев (если реализуете)
const VirtualKeyboard: React.FC<{ highlightedKey: string | null; fingerPlacement: any }> = ({ highlightedKey }) => {
  // Этот компонент будет отображать клавиатуру, подсвечивать клавиши
  // и, возможно, показывать правильное расположение пальцев.
  return (
    <div className="virtual-keyboard">
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
        (Здесь будет виртуальная клавиатура)
      </p>
      {highlightedKey && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Нажмите: {highlightedKey.toUpperCase()}</p>}
      {/* 
        Примерная структура для ряда клавиш:
        <div className="keyboard-row">
          <div className={`key ${highlightedKey === 'q' ? 'highlight' : ''}`}>Q</div>
          // ... другие клавиши
        </div>
      */}
    </div>
  );
};

interface TrainingRoomProps {
  onReturnToMenu: () => void;
  // Можно добавить другие props, если они понадобятся из конфига уровня
}

const TrainingRoom: React.FC<TrainingRoomProps> = ({ onReturnToMenu }) => {
  const [currentWord, setCurrentWord] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [nextKeyToPress, setNextKeyToPress] = useState<string | null>(null);
  // TODO: Добавить состояние для информации о расположении пальцев, если будете реализовывать

  const wordsToPractice = ["привет", "мир", "клавиатура", "тренировка", "скорость", "набор", "текст", "пальцы", "обучение"];

  const loadNewWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * wordsToPractice.length);
    setCurrentWord(wordsToPractice[randomIndex]);
    setUserInput("");
  }, [wordsToPractice]); // wordsToPractice можно вынести в константы вне компонента, если они не меняются

  useEffect(() => {
    loadNewWord(); // Загружаем первое слово при монтировании компонента
  }, [loadNewWord]);

  useEffect(() => {
    if (userInput.length < currentWord.length) {
      setNextKeyToPress(currentWord[userInput.length]);
    } else {
      setNextKeyToPress(null);
    }
  }, [currentWord, userInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = event.target.value;
    setUserInput(typedValue);

    // Проверка на полное совпадение слова для автоматического перехода или кнопки "Далее"
    if (typedValue === currentWord && currentWord.length > 0) {
      // Можно автоматически загружать новое слово или показать кнопку "Далее"
      // loadNewWord(); // Например, авто-переход
    }
  };

  return (
    <div className="training-room-container">
      <button onClick={onReturnToMenu} className="menu-button">Вернуться в меню</button>
      <h2>Тренировка набора текста</h2>
      
      <div className="word-display-container">
        <div className="word-display">
          {currentWord.split('').map((char, index) => (
            <span
              key={index}
              className={`
                char-display
                ${index < userInput.length && userInput[index] === char ? 'correct' : ''}
                ${index < userInput.length && userInput[index] !== char ? 'incorrect' : ''}
                ${index === userInput.length && currentWord.length > 0 ? 'current' : ''}
              `}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="text-input-field"
        placeholder="Начните печатать здесь..."
        autoFocus
      />

      {userInput.length === currentWord.length && userInput === currentWord && currentWord.length > 0 && (
        <button onClick={loadNewWord} className="next-word-button">Следующее слово</button>
      )}

      <VirtualKeyboard 
        highlightedKey={nextKeyToPress} 
        fingerPlacement={null /* Передайте сюда данные о расположении пальцев */} 
      />
    </div>
  );
};

export default TrainingRoom;