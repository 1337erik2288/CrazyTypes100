import React, { useState, useEffect, useCallback, useRef } from 'react';
// import Keyboard from 'simple-keyboard'; // Импортируем клавиатуру - REMOVE THIS LINE
import 'simple-keyboard/build/css/index.css'; // Импортируем стили клавиатуры
import { getAdditionalWords } from '../services/wordsService';
import { GamePlayConfig } from './GamePlay';
import './TrainingRoom.css';
import KeyboardPanel from './KeyboardPanel';

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

  // Для средней скорости за сессию
  const [averageWpm, setAverageWpm] = useState<number>(0);
  const totalCorrectCharsInSessionRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Для текущей (мгновенной) скорости на основе скользящего окна
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const charsInLastSecondForRollingWpmRef = useRef<number>(0);
  const charHistoryForRollingWpmRef = useRef<number[]>([]);

  // Добавляем состояние для клавиши, которую нужно подсветить
  const [keyToHighlight, setKeyToHighlight] = useState<string | null>(null);

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
      charHistoryForRollingWpmRef.current.push(newCharsThisTick);
      if (charHistoryForRollingWpmRef.current.length > ROLLING_WINDOW_SECONDS) {
        charHistoryForRollingWpmRef.current.shift();
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
  }, []); 

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

  // Обновляем эту функцию, чтобы она вызывалась из KeyboardPanel
  const handleVirtualKeyboardInputChange = (newInput: string) => {
    const prevValue = userInput;

    if (currentTextToType && newInput.length > prevValue.length) {
      const typedCharIndex = newInput.length - 1;
      if (typedCharIndex < currentTextToType.length && newInput[typedCharIndex] === currentTextToType[typedCharIndex]) {
        totalCorrectCharsInSessionRef.current += 1; 
        charsInLastSecondForRollingWpmRef.current += 1; 
      }
    }
    setUserInput(newInput);

    if (currentTextToType && newInput === currentTextToType) {
      advanceToNextWord();
    }
  };

  // Эта функция остается для физической клавиатуры
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // Логика подсчета WPM и перехода к следующему слову теперь может быть общей
    // или дублироваться/выноситься в отдельную функцию, если нужно различать источник ввода.
    // Для простоты, пока оставим ее здесь, но KeyboardPanel будет вызывать handleVirtualKeyboardInputChange
    const prevValue = userInput;

    if (currentTextToType && newValue.length > prevValue.length) {
      const typedCharIndex = newValue.length - 1;
      if (typedCharIndex < currentTextToType.length && newValue[typedCharIndex] === currentTextToType[typedCharIndex]) {
        totalCorrectCharsInSessionRef.current += 1; 
        charsInLastSecondForRollingWpmRef.current += 1; 
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
  
  
  // Обновляем логику подсветки следующей клавиши, чтобы она устанавливала состояние keyToHighlight
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
  }, [userInput, currentTextToType, words]); // Убрали keyboardRef.current из зависимостей

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

      incorrectPart = ''; // Переинициализация для построения заново
      const commonLength = Math.min(afterCorrectInput.length, afterCorrectTarget.length);
      for (let i = 0; i < commonLength; i++) {
        incorrectPart += afterCorrectTarget[i];
      }
      incorrectPart += afterCorrectTarget.substring(commonLength); // Добавляем остальную часть некорректной части цели

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
        {/* Поле ввода текста */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="text-input-field" // У вас здесь "text-input-field", ранее мы использовали "training-room-input"
          placeholder="Начните печатать здесь..."
          autoFocus
          // disabled={isLoading && words.length === 0} // Раскомментируйте, если нужно
        />
        {/* Область отображения текста для набора */}
        <div className="text-display-area">
          {isLoading && words.length === 0 ? <p>Загрузка слов...</p> : getHighlightedText()}
        </div>

        <button onClick={onReturnToMenu} className="return-to-menu-btn">
          Выход в меню
        </button>
      </div>
      {/* Заменяем старый контейнер клавиатуры на компонент KeyboardPanel */}
      {/* <div ref={keyboardContainerRef} className="simple-keyboard-container"></div> */}
      <KeyboardPanel
        input={userInput}
        onInputChange={handleVirtualKeyboardInputChange}
        layoutType="latin" // Always use English layout
        highlightKey={keyToHighlight}
      />
    </div>
  );
};

export default TrainingRoom;
