import React from 'react';
import './TypingInterface.css';

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
  const getCharacterClass = (wordChar: string, inputChar: string, index: number) => {
    if (index >= userInput.length) return '';
    return wordChar === inputChar ? 'correct' : 'incorrect';
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
      <textarea
        value={userInput}
        onChange={onInputChange}
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