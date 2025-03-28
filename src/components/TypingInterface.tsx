import React from 'react';
import './TypingInterface.css';
import { mathExpressions } from '../data/math-expressions';

interface TypingInterfaceProps {
  currentWord: string;
  userInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TypingInterface: React.FC<TypingInterfaceProps> = ({
  currentWord,
  userInput,
  onInputChange
}) => {
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
  };

  return (
    <div className="typing-container">
      <div className={`word-display ${currentWord.includes('\n') ? 'code-display' : ''}`}>
        {currentWord.split('').map((char, index) => (
          <span key={index} className={`${getCharacterClass(char, userInput[index], index)} ${char === ' ' ? 'space-char' : ''}`}>
            {char === ' ' ? '·' : char}
          </span>
        ))}
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