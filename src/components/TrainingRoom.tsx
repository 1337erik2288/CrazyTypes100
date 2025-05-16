import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAdditionalWords } from '../services/wordsService';
import { GamePlayConfig } from './GamePlay';
import './TrainingRoom.css';

interface TrainingRoomProps {
  onReturnToMenu: () => void;
  config: GamePlayConfig;
}

const ROLLING_WINDOW_SECONDS = 3; // Определяет, за сколько последних секунд усредняется текущая WPM

const TrainingRoom: React.FC<TrainingRoomProps> = ({ onReturnToMenu, config }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Для средней скорости за сессию
  const [averageWpm, setAverageWpm] = useState<number>(0);
  const totalCorrectCharsInSessionRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Для текущей (мгновенной) скорости на основе скользящего окна
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const charsInLastSecondForRollingWpmRef = useRef<number>(0); // Символы, набранные за последнюю секунду для скользящего окна
  const charHistoryForRollingWpmRef = useRef<number[]>([]); // История количества символов за последние ROLLING_WINDOW_SECONDS

  const currentTextToType = words[currentWordIndex] || '';

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
      setAverageWpm(Math.round(calculatedAverageWpm * 10) / 10); // Округление до десятых
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Расчет текущей (мгновенной) WPM на основе скользящего окна (обновляется каждую секунду)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newCharsThisTick = charsInLastSecondForRollingWpmRef.current;
      
      // Добавляем количество символов за последнюю секунду в историю
      charHistoryForRollingWpmRef.current.push(newCharsThisTick);
      
      // Поддерживаем размер окна
      if (charHistoryForRollingWpmRef.current.length > ROLLING_WINDOW_SECONDS) {
        charHistoryForRollingWpmRef.current.shift(); // Удаляем самый старый элемент
      }
      
      const totalCharsInWindow = charHistoryForRollingWpmRef.current.reduce((sum, count) => sum + count, 0);
      const effectiveSecondsInWindow = charHistoryForRollingWpmRef.current.length;

      if (effectiveSecondsInWindow === 0 || totalCharsInWindow === 0) {
        setCurrentWpm(0);
      } else {
        // WPM = (Total Chars in Window / 5) / (Effective Seconds in Window / 60)
        // WPM = (totalCharsInWindow * 12) / effectiveSecondsInWindow
        const calculatedCurrentWpm = (totalCharsInWindow * 12) / effectiveSecondsInWindow;
        setCurrentWpm(Math.round(calculatedCurrentWpm * 10) / 10); // Округление до десятых
      }
      
      // Сбрасываем счетчик символов для следующей секунды
      charsInLastSecondForRollingWpmRef.current = 0;

    }, 1000); // Обновляем текущую WPM каждую секунду

    return () => clearInterval(intervalId);
  }, []);


  const fetchWords = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newWords = await getAdditionalWords('keyboard-training');
      setWords(prevWords => [...prevWords, ...newWords.filter(nw => !prevWords.includes(nw))]); // Добавляем только новые слова
    } catch (error) {
      console.error("Failed to fetch words for training room:", error);
      if (words.length === 0) { // Добавляем слова по умолчанию, если первоначальная загрузка не удалась
        setWords(["ошибка", "загрузки", "слов", "попробуйте", "позже"]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, words.length]);

  useEffect(() => {
    fetchWords();
    inputRef.current?.focus();
    // Сброс счетчиков и времени при монтировании/перезаходе
    sessionStartTimeRef.current = Date.now();
    totalCorrectCharsInSessionRef.current = 0;
    
    charsInLastSecondForRollingWpmRef.current = 0;
    charHistoryForRollingWpmRef.current = []; // Очищаем историю
    
    setAverageWpm(0);
    setCurrentWpm(0);
  }, []); // fetchWords будет вызван один раз при монтировании, т.к. его зависимости (isLoading, words.length) не меняются от этого useEffect

  useEffect(() => {
    if (words.length > 0 && currentWordIndex >= words.length - 3 && !isLoading) {
      fetchWords();
    }
  }, [currentWordIndex, words.length, fetchWords, isLoading]);

  const advanceToNextWord = useCallback(() => {
    setUserInput('');
    setCurrentWordIndex(prevIndex => prevIndex + 1);
    inputRef.current?.focus();
  }, [setCurrentWordIndex, setUserInput]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const prevValue = userInput;

    if (currentTextToType && newValue.length > prevValue.length) {
      const typedCharIndex = newValue.length - 1;
      if (typedCharIndex < currentTextToType.length && newValue[typedCharIndex] === currentTextToType[typedCharIndex]) {
        totalCorrectCharsInSessionRef.current += 1; 
        charsInLastSecondForRollingWpmRef.current += 1; // Считаем символы для текущего секундного тика
      }
    }

    setUserInput(newValue);

    if (currentTextToType && newValue === currentTextToType) {
      advanceToNextWord();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Предотвращаем стандартное поведение (например, пробел не должен вводиться, если слово уже завершено)
      
      // Если пользователь нажал пробел/Enter, а слово введено неверно или не до конца
      if (currentTextToType && userInput.trim() !== '' && userInput.trim() !== currentTextToType.trim()) {
        console.log("Попытка перейти (пробел/Enter) при неверном вводе.");
        // Здесь можно добавить логику для обработки такой ситуации, например, встряхивание поля ввода или очистку.
        // setUserInput(''); // Например, очистить поле при ошибке и нажатии пробела
      }
      // Если слово уже было правильно введено, advanceToNextWord уже был вызван из handleInputChange.
      // Дополнительных действий здесь не требуется.
    }
  };
  
  const getHighlightedText = () => {
    let correctPart = '';
    let incorrectPart = '';
    let remainingPart = currentTextToType;

    for (let i = 0; i < currentTextToType.length; i++) {
      if (i < userInput.length) {
        if (userInput[i] === currentTextToType[i]) {
          correctPart += currentTextToType[i];
        } else {
          incorrectPart = currentTextToType.substring(i);
          break;
        }
      } else {
        remainingPart = currentTextToType.substring(i);
        break;
      }
    }
    
    // Эта часть логики обрабатывает случай, когда пользователь ввел больше символов, чем в целевом слове
    let trailingIncorrectInput = '';
    if (userInput.length > currentTextToType.length && correctPart === currentTextToType) {
      trailingIncorrectInput = userInput.substring(currentTextToType.length);
      incorrectPart = ''; // Если все целевое слово введено верно, то оно не может быть "неправильной частью"
      remainingPart = '';
    } else if (userInput.length > correctPart.length && correctPart.length < currentTextToType.length) {
      // Пользователь начал делать ошибки до конца слова или ввел больше символов с ошибками
      const userTypedAfterCorrect = userInput.substring(correctPart.length);
      const remainingTargetAfterCorrect = currentTextToType.substring(correctPart.length);
      let commonLength = Math.min(userTypedAfterCorrect.length, remainingTargetAfterCorrect.length);
      let displayIncorrectTarget = '';
      for(let i=0; i < commonLength; i++) {
        if(userTypedAfterCorrect[i] !== remainingTargetAfterCorrect[i]) {
           displayIncorrectTarget += remainingTargetAfterCorrect[i];
        } else {
           // This case is tricky, means user typed correctly into what should be incorrect part
           // For simplicity, we might just show the target's incorrect part
           displayIncorrectTarget += remainingTargetAfterCorrect[i];
        }
      }
      incorrectPart = displayIncorrectTarget + remainingTargetAfterCorrect.substring(commonLength);
      remainingPart = ''; // Все, что дальше - это либо часть incorrectPart, либо уже нерелевантно
      if(userTypedAfterCorrect.length > remainingTargetAfterCorrect.length) {
        trailingIncorrectInput = userTypedAfterCorrect.substring(remainingTargetAfterCorrect.length);
      }
    }


    return (
      <>
        <span className="correct-text">{correctPart}</span>
        {/* Отображаем красным ту часть целевого слова, где ошибка, ИЛИ лишние введенные символы */}
        <span className="incorrect-text">{incorrectPart || trailingIncorrectInput}</span>
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
        <div className="text-display-area">
          {isLoading && words.length === 0 ? <p>Загрузка слов...</p> : getHighlightedText()}
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
        <button onClick={onReturnToMenu} className="return-to-menu-btn">
          Выход в меню
        </button>
      </div>
    </div>
  );
};

export default TrainingRoom;