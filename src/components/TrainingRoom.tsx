import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'simple-keyboard/build/css/index.css';
import { getWordsByLanguage } from '../services/wordsService'; // Use getWordsByLanguage
import { GamePlayConfig } from './GamePlay';
import './TrainingRoom.css';
import KeyboardPanel from './KeyboardPanel'; // Removed KeyboardPanelProps from import

interface TrainingRoomProps {
  onReturnToMenu: () => void;
  config: GamePlayConfig;
}

const ROLLING_WINDOW_SECONDS = 3;

const charToButtonMap: { [key: string]: string } = {
  ' ': '{space}',
  '\n': '{enter}',
  '\t': '{tab}'
};

const TrainingRoom: React.FC<TrainingRoomProps> = ({ onReturnToMenu, config }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<'en' | 'ru'>('en');

  const [averageWpm, setAverageWpm] = useState<number>(0);
  const totalCorrectCharsInSessionRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());

  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const charsInLastSecondForRollingWpmRef = useRef<number>(0);
  const charHistoryForRollingWpmRef = useRef<number[]>([]);

  const [keyToHighlight, setKeyToHighlight] = useState<string | null>(null);
  const [isErrorActive, setIsErrorActive] = useState<boolean>(false); // Новое состояние для ошибки

  const currentTextToType = words[currentWordIndex] || '';

  const handleLanguageToggle = () => { // Define handleLanguageToggle here
    setLanguage(prev => (prev === 'en' ? 'ru' : 'en'));
  };

  // Расчет средней WPM за сессию (обновляется каждую секунду)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const elapsedMilliseconds = currentTime - sessionStartTimeRef.current;
      
      if (elapsedMilliseconds <= 0 || totalCorrectCharsInSessionRef.current === 0) {
        setAverageWpm(0);
        return;
      }
      const elapsedSeconds = elapsedMilliseconds / 1000;
      const calculatedAverageWpm = (totalCorrectCharsInSessionRef.current * 12) / elapsedSeconds;
      setAverageWpm(Math.round(calculatedAverageWpm * 10) / 10); 
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Расчет текущей (мгновенной) WPM на основе скользящего окна (обновляется каждую секунду)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newCharsThisTick = charsInLastSecondForRollingWpmRef.current;
      charHistoryForRollingWpmRef.current.push(newCharsThisTick);
      if (charHistoryForRollingWpmRef.current.length > ROLLING_WINDOW_SECONDS) {
        charHistoryForRollingWpmRef.current.shift();
      }
      const totalCharsInWindow = charHistoryForRollingWpmRef.current.reduce((sum, count) => sum + count, 0);
      const effectiveSecondsInWindow = charHistoryForRollingWpmRef.current.length;

      if (effectiveSecondsInWindow === 0 || totalCharsInWindow === 0) {
        setCurrentWpm(0);
      } else {
        const calculatedCurrentWpm = (totalCharsInWindow * 12) / effectiveSecondsInWindow;
        setCurrentWpm(Math.round(calculatedCurrentWpm * 10) / 10); 
      }
      
      charsInLastSecondForRollingWpmRef.current = 0;

    }, 1000); 

    return () => clearInterval(intervalId);
  }, []);


  const fetchWords = useCallback(async (selectedLanguage: 'en' | 'ru') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newWords = await getWordsByLanguage(selectedLanguage, 'keyboard-training');
      setWords(newWords);
      setCurrentWordIndex(0);
      setUserInput('');
    } catch (error) {
      console.error(`Failed to fetch words for ${selectedLanguage} in training room:`, error);
      setWords(["error", "loading", "words", "try", "later"]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language]); // Added language to dependencies

  useEffect(() => {
    fetchWords(language);
    inputRef.current?.focus();
    sessionStartTimeRef.current = Date.now();
    totalCorrectCharsInSessionRef.current = 0;
    charsInLastSecondForRollingWpmRef.current = 0;
    charHistoryForRollingWpmRef.current = [];
    setAverageWpm(0);
    setCurrentWpm(0);
  }, [language]); // Removed fetchWords from dependencies

  useEffect(() => {
    if (words.length > 0 && currentWordIndex >= words.length - 5 && !isLoading) {
      // Potentially fetch more words if implementing infinite scroll for words
      // For now, fetchWords(language) reloads the list, so this might not be needed
      // or needs to be adapted to append words if that's the desired behavior.
    }
  }, [currentWordIndex, words.length, isLoading, language, fetchWords]);

  const advanceToNextWord = useCallback(() => {
    setUserInput('');
    setCurrentWordIndex(prevIndex => prevIndex + 1);
    inputRef.current?.focus();
  }, [setCurrentWordIndex, setUserInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const prevValue = userInput;
    let errorOccurred = false;

    if (currentTextToType) {
      // Проверка на ошибку при вводе нового символа
      if (newValue.length > prevValue.length) {
        const typedCharIndex = newValue.length - 1;
        if (typedCharIndex < currentTextToType.length) {
          if (newValue[typedCharIndex] !== currentTextToType[typedCharIndex]) {
            errorOccurred = true;
          } else {
            totalCorrectCharsInSessionRef.current += 1; 
            charsInLastSecondForRollingWpmRef.current += 1; 
          }
        }
      } else if (newValue.length < prevValue.length) {
        // Ошибка сбрасывается при стирании
        errorOccurred = false;
      } else {
        // Если длина не изменилась, проверяем текущий ввод на ошибки
        for (let i = 0; i < newValue.length; i++) {
          if (i < currentTextToType.length && newValue[i] !== currentTextToType[i]) {
            errorOccurred = true;
            break;
          }
        }
      }
    }
    setIsErrorActive(errorOccurred);
    setUserInput(newValue);

    if (currentTextToType && newValue === currentTextToType && !errorOccurred) {
      advanceToNextWord();
    }
  };

  // Аналогичные изменения нужно внести в handleVirtualKeyboardInputChange, если она используется для ввода
  // const handleVirtualKeyboardInputChange = (newInput: string) => {
  //   const prevValue = userInput;
  //   let errorOccurred = false;

  //   if (currentTextToType) {
  //     if (newInput.length > prevValue.length) {
  //       const typedCharIndex = newInput.length - 1;
  //       if (typedCharIndex < currentTextToType.length) {
  //         if (newInput[typedCharIndex] !== currentTextToType[typedCharIndex]) {
  //           errorOccurred = true;
  //         } else {
  //           totalCorrectCharsInSessionRef.current += 1;
  //           charsInLastSecondForRollingWpmRef.current += 1;
  //         }
  //       }
  //     } else if (newInput.length < prevValue.length) {
  //       errorOccurred = false;
  //     } else {
  //       for (let i = 0; i < newInput.length; i++) {
  //         if (i < currentTextToType.length && newInput[i] !== currentTextToType[i]) {
  //           errorOccurred = true;
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   setIsErrorActive(errorOccurred);
  //   setUserInput(newInput);

  //   if (currentTextToType && newInput === currentTextToType && !errorOccurred) {
  //     advanceToNextWord();
  //   }
  // };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (currentTextToType && userInput.trim() !== '' && userInput.trim() !== currentTextToType.trim()) {
        console.log("Attempt to proceed (space/enter) with incorrect input.");
      }
    }
  };
  
  useEffect(() => {
    const nextCharIndex = userInput.length;
    let nextButton: string | null = null;

    if (nextCharIndex < currentTextToType.length) {
      const nextChar = currentTextToType[nextCharIndex];
      nextButton = charToButtonMap[nextChar.toLowerCase()] || 
                   charToButtonMap[nextChar.toUpperCase()] || 
                   (nextChar.match(/^[a-zA-Zа-яА-ЯёЁ0-9]$/) ? nextChar.toLowerCase() : nextChar);
    }
    setKeyToHighlight(nextButton);
  }, [userInput, currentTextToType, words]);

  const getHighlightedText = () => {
    let correctPart = '';
    let incorrectPart = '';
    let trailingIncorrectInput = '';
    let remainingPart = '';

    const target = currentTextToType;
    const input = userInput;

    for (let i = 0; i < target.length; i++) {
      if (i < input.length) {
        if (input[i] === target[i]) {
          correctPart += target[i];
        } else {
          incorrectPart = target.substring(i);
          break;
        }
      } else {
        remainingPart = target.substring(i);
        break;
      }
    }

    if (input.length > target.length && correctPart === target) {
      trailingIncorrectInput = input.substring(target.length);
      incorrectPart = '';
      remainingPart = '';
    } else if (input.length > correctPart.length && correctPart.length < target.length) {
      const afterCorrectInput = input.substring(correctPart.length);
      const afterCorrectTarget = target.substring(correctPart.length);

      incorrectPart = '';
      const commonLength = Math.min(afterCorrectInput.length, afterCorrectTarget.length);
      for (let i = 0; i < commonLength; i++) {
        incorrectPart += afterCorrectTarget[i];
      }
      incorrectPart += afterCorrectTarget.substring(commonLength);

      if (afterCorrectInput.length > afterCorrectTarget.length) {
        trailingIncorrectInput = afterCorrectInput.substring(afterCorrectTarget.length);
      }

      remainingPart = '';
    }

    return (
      <>
        <span className="correct-text">{correctPart}</span>
        <span className="incorrect-text">{incorrectPart + trailingIncorrectInput}</span>
        <span>{remainingPart}</span>
      </>
    );
  };

  return (
    <div className="training-room-container" style={{ backgroundImage: `url(${config.backgroundImage})` }}>
      <div className="training-room-content">
        <div className="wpm-display">
          <div className="wpm-counter average-wpm">
            Средняя: {averageWpm.toFixed(1)} WPM 
          </div>
          <div className="wpm-counter current-wpm">
            Текущая: {currentWpm.toFixed(1)} WPM
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="text-input-field"
          placeholder="Начните печатать здесь..."
          autoFocus
        />
        <div className="text-display-area">
          {isLoading && words.length === 0 ? <p>Загрузка слов...</p> : getHighlightedText()}
        </div>

        <button onClick={handleLanguageToggle} className="language-toggle-btn">
          {language === 'en' ? 'Сменить на Русский' : 'Сменить на Английский'}
        </button>

        <button onClick={onReturnToMenu} className="return-to-menu-btn">
          Выход в меню
        </button>
      </div>
      <div className="keyboard-section">
        <KeyboardPanel 
          input={userInput} 
          layoutType={language === 'en' ? 'latin' : 'cyrillic'} 
          highlightKey={keyToHighlight}
          highlightErrorKey={isErrorActive} // Передаем состояние ошибки
          // onInputChange={handleVirtualKeyboardInputChange} // Раскомментируйте, если используете виртуальный ввод
        />
      </div>
    </div>
  );
};

export default TrainingRoom;
