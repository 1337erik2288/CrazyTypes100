import React from 'react';

type Language = 'en' | 'ru';

interface TypingInterfaceProps {
  currentWord: string;
  userInput: string;
  language: Language;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLanguageToggle: () => void;
}

const TypingInterface: React.FC<TypingInterfaceProps> = ({
  currentWord,
  userInput,
  language,
  onInputChange,
  onLanguageToggle
}) => {
  const getCharacterClass = (wordChar: string, inputChar: string, index: number) => {
    if (index >= userInput.length) return '';
    return wordChar === inputChar ? 'correct' : 'incorrect';
  };

  return (
    <div className="typing-container">
      <div className="controls">
        <button onClick={onLanguageToggle}>
          {language === 'en' ? 'Switch to Russian' : 'Switch to English'}
        </button>
      </div>
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
        placeholder={language === 'en' ? "Type the word..." : "Введите слово..."}
        autoFocus
      />
    </div>
  );
};

export default TypingInterface;