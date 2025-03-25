import React, { useState, useEffect, useCallback } from 'react';
import './GamePlay.css';
import Monster from './Monster';
import HealthBar from './HealthBar';
import VictoryScreen from './VictoryScreen';
import TypingInterface from './TypingInterface';
import BackgroundManager from './BackgroundManager';
import EquipmentStats from './EquipmentStats';
import { getAdditionalWords } from '../services/wordsService';
import { getRandomCodeLine } from '../services/codeService';
import { LevelReward } from '../services/playerService';
import { getPlayerEquipment, applyEquipmentEffects } from '../services/equipmentService';
import { mathExpressions } from '../data/math-expressions';

interface Monster {
  health: number;
  imagePath: string;
  isDefeated: boolean;
}

interface GameStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number;
  endTime: number | null;
}

export type Language = 'en' | 'ru' | 'code' | 'key-combos' | 'simple-words' | 'phrases' | 'math' | 'paragraphs' | 'mixed';

export interface GamePlayConfig {
  backgroundImage: string;
  monsterImage: string;
  initialHealth: number;
  healAmount: number;
  regenerateAmount: number;
  damageAmount: number;
  healOnMistake: number;
  language: Language;
}

interface GamePlayProps {
  config: GamePlayConfig;
  onRestart: () => void;
  onReturnToMenu: () => void;
  onLevelComplete: () => void;
  rewards?: LevelReward;
  isFirstCompletion?: boolean;
}

const GamePlay: React.FC<GamePlayProps> = ({ config, onRestart, onReturnToMenu, onLevelComplete, rewards, isFirstCompletion = false }) => {
  // Apply equipment effects to the game configuration
  const [playerEquipment, setPlayerEquipment] = useState(() => getPlayerEquipment());
  
  const [gameConfig, setGameConfig] = useState(() => {
    return applyEquipmentEffects(config, playerEquipment.equipped);
  });
  
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [monster, setMonster] = useState<Monster>(() => ({
    health: gameConfig.initialHealth,
    imagePath: gameConfig.monsterImage,
    isDefeated: false
  }));
  const [gameStats, setGameStats] = useState<GameStats>(() => ({
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    startTime: Date.now(),
    endTime: null
  }));

  const generateNewWord = useCallback(() => {
    if (config.language === 'code') {
      getRandomCodeLine('javascript').then((codeLine: string) => {
        setCurrentWord(codeLine);
        setUserInput('');
      });
    } else if (config.language === 'math') {
      // Специальная обработка для математических выражений
      getAdditionalWords(config.language).then(newWords => {
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          
          // Проверяем, является ли это выражением или числом
          const useExpressions = Math.random() > 0.5;
          if (!useExpressions) {
            // Если это число, просто отображаем его
            setCurrentWord(newWord);
          } else {
            // Если это выражение, находим соответствующее отображение
            const matchingExpression = mathExpressions.expressions.find(expr => expr.answer === newWord);
            if (matchingExpression) {
              // Устанавливаем отображаемое выражение, но пользователь будет вводить только ответ
              setCurrentWord(matchingExpression.display);
            } else {
              // Если не нашли соответствия, просто отображаем число
              setCurrentWord(newWord);
            }
          }
          setUserInput('');
        }
      });
    } else {
      getAdditionalWords(config.language).then(newWords => {
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          setCurrentWord(newWord);
          setUserInput('');
        }
      });
    }
  }, [config.language]);

  const restartGame = () => {
    setMonster({
      health: config.initialHealth,
      imagePath: config.monsterImage,
      isDefeated: false
    });
    setShowVictory(false);
    setGameStats({
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      startTime: Date.now(),
      endTime: null
    });
    generateNewWord();
    onRestart();
  };

  useEffect(() => {
    generateNewWord();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    
    // Проверяем, является ли текущее слово математическим выражением
    const isMathExpression = config.language === 'math' && currentWord.includes('=?');
    
    // Если это математическое выражение, находим ожидаемый ответ
    let expectedAnswer = currentWord;
    if (isMathExpression) {
      const matchingExpression = mathExpressions.expressions.find(expr => expr.display === currentWord);
      if (matchingExpression) {
        expectedAnswer = matchingExpression.answer;
      }
    }
    
    if (lastCharIndex >= 0) {
      // Для математических выражений проверяем ввод относительно ответа, а не отображаемого выражения
      const compareWith = isMathExpression ? expectedAnswer : currentWord;
      
      // Проверяем, не выходит ли индекс за пределы длины ответа
      if (lastCharIndex < compareWith.length) {
        const isCorrect = value[lastCharIndex] === compareWith[lastCharIndex];
        
        if (!isCorrect) {
          setUserInput(value.slice(0, -1));
          
          setGameStats(prev => ({
            ...prev,
            incorrectChars: prev.incorrectChars + 1,
            totalChars: prev.totalChars + 1
          }));
          
          setMonster(prev => {
            const newHealth = Math.min(config.initialHealth, prev.health + config.healOnMistake);
            return { ...prev, health: newHealth };
          });
          return;
        }
        
        setGameStats(prev => ({
          ...prev,
          correctChars: prev.correctChars + 1,
          totalChars: prev.totalChars + 1
        }));

        setMonster(prev => {
          const newHealth = Math.max(0, prev.health - config.damageAmount);
          const isDefeated = newHealth === 0;
          if (isDefeated) {
            setShowVictory(true);
            setGameStats(prev => ({ ...prev, endTime: Date.now() }));
            onLevelComplete();
          }
          const monsterElement = document.querySelector('.monster') as HTMLElement;
          if (monsterElement) {
            monsterElement.classList.remove('damage-animation');
            void monsterElement.offsetWidth;
            monsterElement.classList.add('damage-animation');
          }
          return { ...prev, health: newHealth, isDefeated };
        });
        
        setUserInput(value);
        
        // Для математических выражений проверяем, совпадает ли ввод с ответом
        if ((isMathExpression && value === expectedAnswer) || 
            (!isMathExpression && value === currentWord)) {
          if (!monster.isDefeated) {
            generateNewWord();
          }
        }
      }
    }
  };

  return (
    <>
      <BackgroundManager imagePath={config.backgroundImage} />
      <div className="game-container">
        <button className="menu-button" onClick={onReturnToMenu}>Вернуться в меню</button>
        
        <div className="monster-container">
          <Monster 
            imagePath={monster.imagePath}
            isDefeated={monster.isDefeated}
          />
          <HealthBar 
            health={monster.health}
            initialHealth={config.initialHealth}
            canHeal={true}
            healAmount={config.healAmount}
            canRegenerate={true}
            regenerateAmount={config.regenerateAmount}
            isDefeated={monster.isDefeated}
            onHealthChange={(newHealth) => setMonster(prev => ({ ...prev, health: newHealth }))}
          />
        </div>

        {showVictory ? (
          <VictoryScreen 
            gameStats={gameStats} 
            onRestart={restartGame} 
            onReturnToMenu={onReturnToMenu} 
            rewards={rewards}
            isFirstCompletion={isFirstCompletion}
          />
        ) : (
          <>
            <TypingInterface
              currentWord={currentWord}
              userInput={userInput}
              onInputChange={handleInputChange}
            />
            <div className="equipment-stats-bottom">
              <EquipmentStats 
                equipment={playerEquipment.equipped} 
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GamePlay;