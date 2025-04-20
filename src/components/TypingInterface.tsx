import React, { useEffect, useState } from 'react';
import './TypingInterface.css';
import { mathExpressions } from '../data/math-expressions';

interface TypingInterfaceProps {
  currentWord: string;
  userInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTimerComplete?: () => void;
  onTimerSuccess?: () => void;
  bonusPercent?: number;
}

const TypingInterface: React.FC<TypingInterfaceProps> = ({
  currentWord,
  userInput,
  onInputChange,
  onTimerComplete,
  onTimerSuccess,
  bonusPercent = 0
}) => {
  const [timeAllowed, setTimeAllowed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  // Проверяем, является ли текущее слово математическим выражением
  const isMathExpression = currentWord.includes('=?');
  
  // Если это математическое выражение, находим ожидаемый ответ
  let expectedAnswer = '';
  if (isMathExpression) {
    const matchingExpression = mathExpressions.expressions.find(expr => expr.display === currentWord);
    if (matchingExpression) {
      expectedAnswer = matchingExpression.answer;
    }
  }
  
  // Функция для расчета времени на ввод слова
  const calculateTimeAllowed = (word: string) => {
    let time = 0;
    const textToCheck = isMathExpression ? expectedAnswer : word;
    
    // Теперь за каждый символ начисляется 0.45 секунд
    time = textToCheck.length * 0.45;
    
    return Math.max(time, 1); // Минимум 1 секунда на ввод
  };
  
  const getCharacterClass = (wordChar: string, inputChar: string, index: number) => {
    // Для математических выражений не показываем подсветку символов в выражении
    if (isMathExpression) return '';
    
    if (index >= userInput.length) return '';
    return wordChar === inputChar ? 'correct' : 'incorrect';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Для математических выражений проверяем ввод посимвольно
    if (isMathExpression) {
      // Проверяем, что каждый введенный символ соответствует ожидаемому ответу
      const isValidInput = value.split('').every((char, index) => {
        return index < expectedAnswer.length && char === expectedAnswer[index];
      });
      
      // Если ввод валидный, передаем его дальше
      if (isValidInput) {
        onInputChange(e);
      }
    } else {
      onInputChange(e);
    }
    
    // Проверяем, завершен ли ввод слова
    const compareWith = isMathExpression ? expectedAnswer : currentWord;
    if (value === compareWith && timerActive && !timerCompleted) {
      setTimerActive(false);
      if (onTimerSuccess) onTimerSuccess();
    }
  };
  
  // Эффект для инициализации таймера при изменении слова
  useEffect(() => {
    if (currentWord) {
      const time = calculateTimeAllowed(currentWord);
      setTimeAllowed(time);
      setTimeRemaining(time);
      setTimerActive(true);
      setTimerCompleted(false);
    }
  }, [currentWord]);
  
  // Эффект для обратного отсчета таймера
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            setTimerActive(false);
            setTimerCompleted(true);
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeRemaining, onTimerComplete]);

  return (
    <div className="typing-container">
      <div className="word-display-container">
        <div className={`word-display ${currentWord.includes('\n') ? 'code-display' : ''}`}>
          {currentWord.split('').map((char, index) => (
            <span key={index} className={`${getCharacterClass(char, userInput[index], index)} ${char === ' ' ? 'space-char' : ''}`}>
              {char === ' ' ? '·' : char}
            </span>
          ))}
        </div>
        {timerActive && (
          <div className="timer-container">
            <div 
              className="timer-circle" 
              style={{
                background: `conic-gradient(#4caf50 ${(timeRemaining / timeAllowed) * 100}%, transparent 0%)`
              }}
            >
              <span className="timer-text">{bonusPercent > 0 ? `+${bonusPercent}%` : '0%'}</span>
            </div>
          </div>
        )}
      </div>
      {isMathExpression && (
        <div className="math-hint">Введите только ответ</div>
      )}
      <textarea
        value={userInput}
        onChange={handleInputChange}
        className="typing-input"
        placeholder="Type the code..."
        autoFocus
        rows={currentWord.split('\n').length}
        spellCheck="false"
      />
    </div>
  );
};

export default TypingInterface;