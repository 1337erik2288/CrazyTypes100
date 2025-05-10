import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import PlayerHealthBar from './PlayerHealthBar';
import { getPlayerHealth, getMaxPlayerHealth, damagePlayer, healPlayerToMax } from '../services/playerService';
import { saveLevelResult } from '../services/progressService';

interface Monster {
  health: number;
  maxHealth?: number;
  imagePath: string;
  isDefeated: boolean;
  takingDamage?: boolean;
}

interface GameStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number;
  endTime: number | null;
  speed?: number;      // Add this
  accuracy?: number;   // Add this
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
  monsterDamage?: number; // Урон, наносимый монстром игроку
  attackInterval?: number; // Интервал атаки монстра в миллисекундах
}

interface GamePlayProps {
  config: GamePlayConfig;
  onRestart: () => void;
  onReturnToMenu: () => void;
  onLevelComplete: () => void;
  rewards?: LevelReward;
  isFirstCompletion?: boolean;
  levelId: number | null; // <--- Added levelId
}

const GamePlay: React.FC<GamePlayProps> = ({
  config,
  onRestart,
  onReturnToMenu,
  onLevelComplete,
  rewards,
  isFirstCompletion = false,
  levelId // <--- Destructured levelId
}) => {
  // Apply equipment effects to the game configuration
  const [playerEquipment] = useState(() => getPlayerEquipment());
  
  const [gameConfig] = useState(() => {
    return applyEquipmentEffects(config, playerEquipment.equipped);
  });
  
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [monster, setMonster] = useState<Monster>(() => ({
    health: gameConfig.initialHealth,
    maxHealth: gameConfig.initialHealth,
    imagePath: gameConfig.monsterImage,
    isDefeated: false,
    takingDamage: false
  }));
  const [gameStats, setGameStats] = useState<GameStats>(() => ({
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    startTime: Date.now(),
    endTime: null
  }));
  
  const [currentDamage, setCurrentDamage] = useState(0);
  // Удаляем неиспользуемую переменную baseDamage
  const [bonusDamageActive, setBonusDamageActive] = useState(false);
  const [bonusDamagePercent, setBonusDamagePercent] = useState(0);

  // Добавляем состояния для здоровья игрока
  const [playerHealth, setPlayerHealth] = useState<number>(getPlayerHealth());
  const [maxPlayerHealth, setMaxPlayerHealth] = useState<number>(getMaxPlayerHealth());
  const [playerDamageAnimation, setPlayerDamageAnimation] = useState<boolean>(false);
  const [showAttackWarning, setShowAttackWarning] = useState<boolean>(false);
  
  // Таймер для нанесения урона игроку
  const monsterAttackInterval = useRef<NodeJS.Timeout | null>(null);

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
      maxHealth: config.initialHealth,
      imagePath: config.monsterImage,
      isDefeated: false,
      takingDamage: false
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
    
    // Восстанавливаем здоровье игрока до максимума при начале нового уровня
    healPlayerToMax();
    setPlayerHealth(getPlayerHealth());
    setMaxPlayerHealth(getMaxPlayerHealth());
    
    // Очищаем предыдущий таймер, если он существует
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
      monsterAttackInterval.current = null;
    }
    
    // Добавляем отладочный вывод для проверки параметров уровня
    console.log('Уровень:', config);
    console.log('Урон монстра:', config.monsterDamage);
    console.log('Интервал атаки:', config.attackInterval);
    
    // Запускаем таймер атаки монстра, если уровень предусматривает урон
    if (config.monsterDamage && config.monsterDamage > 0 && config.attackInterval && config.attackInterval > 0) {
      // Добавляем задержку перед первой атакой (7 секунд)
      const initialDelay = 7000; 
      
      // Показываем предупреждение за 2 секунды до первой атаки
      setTimeout(() => {
        setShowAttackWarning(true);
        
        // Скрываем предупреждение через 2 секунды
        setTimeout(() => {
          setShowAttackWarning(false);
        }, 2000);
      }, initialDelay - 2000);
      
      // Таймер для первой атаки с задержкой
      const initialAttackTimer = setTimeout(() => {
        // Запускаем регулярные атаки после первой задержки
        monsterAttackInterval.current = setInterval(() => {
          // Монстр атакует только если не побежден
          if (!monster.isDefeated) {
            // Ограничиваем урон монстра до максимум 10 единиц за атаку
            const actualDamage = Math.min(config.monsterDamage || 0, 10);
            
            console.log('Монстр атакует! Урон:', actualDamage);
            
            const newHealth = damagePlayer(actualDamage);
            console.log('Новое здоровье игрока:', newHealth);
            
            setPlayerHealth(newHealth);
            setPlayerDamageAnimation(true);
            
            // Сбрасываем анимацию получения урона
            setTimeout(() => {
              setPlayerDamageAnimation(false);
            }, 300);
            
            // Проверяем, не проиграл ли игрок
            if (newHealth <= 0) {
              // Игрок проиграл
              handleDefeat();
            }
          }
        }, config.attackInterval);
      }, initialDelay);
      
      // Очистка таймера начальной задержки при размонтировании
      return () => {
        clearTimeout(initialAttackTimer);
        if (monsterAttackInterval.current) {
          clearInterval(monsterAttackInterval.current);
        }
      };
    }
    
    return () => {
      // Очищаем таймер атаки монстра при размонтировании компонента
      if (monsterAttackInterval.current) {
        clearInterval(monsterAttackInterval.current);
      }
    };
  }, [config, monster.isDefeated]);
  
  // Функция обработки поражения игрока
  const handleDefeat = () => {
    // Останавливаем таймер атаки монстра
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
    
    // Показываем экран поражения или возвращаемся в меню
    onReturnToMenu();
  };

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
          
          // Рассчитываем урон с учетом накопительного бонуса за своевременный ввод
          const damageToApply = bonusDamageActive 
            ? config.damageAmount * (1 + bonusDamagePercent / 100) 
            : config.damageAmount;
          
          // Показываем текущий урон в случайном месте с точностью до сотых
          setCurrentDamage(parseFloat(damageToApply.toFixed(2)));
          setTimeout(() => setCurrentDamage(0), 1330); // Увеличиваем время отображения на 33% (было 1000мс)
          
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

  // Удалена логика сохранения результатов
  const handleReturnToMenu = () => {
    // Сохраняем результат только если победа и есть id уровня
    if (showVictory && gameStats && levelId !== null && gameStats.endTime && gameStats.startTime && gameStats.totalChars > 0) { // Changed: (gameConfig as any).id to levelId
      const durationMinutes = (gameStats.endTime - gameStats.startTime) / 60000;
      const speed = gameStats.correctChars / durationMinutes;
      const accuracy = (gameStats.correctChars / gameStats.totalChars) * 100;
      saveLevelResult(levelId.toString(), speed, accuracy); // Changed: (gameConfig as any).id to levelId.toString()
    }
    onReturnToMenu();
  };

  return (
    <>
      <BackgroundManager imagePath={gameConfig.backgroundImage} />
      <div className="game-container">
        <button className="menu-button" onClick={handleReturnToMenu}>Вернуться в меню</button>
        
        <div className="monster-container">
          <Monster 
            imagePath={monster.imagePath}
            isDefeated={monster.isDefeated}
            takingDamage={monster.takingDamage}
            className={playerDamageAnimation ? 'monster-attacking' : ''}
          />
          {currentDamage > 0 && (
            <div className="damage-display" style={{
              position: 'absolute',
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              transform: 'translate(-50%, -50%)'
            }}>
              <span>-{Number.isInteger(currentDamage) ? currentDamage.toFixed(0) : currentDamage.toFixed(2)}</span>
            </div>
          )}
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
          
          {/* Добавляем полосу здоровья игрока */}
          <PlayerHealthBar 
            currentHealth={playerHealth} 
            maxHealth={maxPlayerHealth}
          />
        </div>

        {showVictory ? (
          <VictoryScreen 
            gameStats={gameStats}
            speed={gameStats && gameStats.endTime && gameStats.startTime && gameStats.totalChars > 0
              ? gameStats.correctChars / ((gameStats.endTime - gameStats.startTime) / 60000)
              : 0}
            accuracy={gameStats && gameStats.totalChars > 0
              ? (gameStats.correctChars / gameStats.totalChars) * 100
              : 0}
            onRestart={restartGame} 
            // onReturnToMenu={onReturnToMenu} // <--- Removed this line
            rewards={rewards}
            isFirstCompletion={isFirstCompletion}
            levelId={levelId as number} // <--- Added this line, ensuring levelId is passed
          />
        ) : (
          <>
            <TypingInterface
              currentWord={currentWord}
              userInput={userInput}
              onInputChange={handleInputChange}
              onTimerComplete={() => {
                setBonusDamageActive(false);
                setBonusDamagePercent(0);
              }}
              onTimerSuccess={() => {
                setBonusDamageActive(true);
                setBonusDamagePercent(prev => prev + 10);
              }}
              bonusPercent={bonusDamagePercent}
            />
            <div className="equipment-stats-bottom">
              <EquipmentStats 
                equipment={playerEquipment.equipped} 
              />
            </div>
          </>
        )}
        
        {showAttackWarning && (
          <div className="attack-warning">
            Monster is about to attack!
          </div>
        )}
      </div>
    </>
  );
};

export default GamePlay;