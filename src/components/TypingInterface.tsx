import React from 'react';

interface TypingInterfaceProps {
  currentWord: string;
  userInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
      <div className="word-display">
        {currentWord.split('').map((char, index) => (
          <span key={index} className={getCharacterClass(char, userInput[index], index)}>
            {char}
          </span>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={onInputChange}
        className="typing-input"
        placeholder="Type the word..."
        autoFocus
      />
    </div>
  );
};

export default TypingInterface;