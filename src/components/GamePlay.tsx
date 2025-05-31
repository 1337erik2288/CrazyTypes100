import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './GamePlay.css';
import Monster from './Monster';
import HealthBar from './HealthBar';
import VictoryScreen from './VictoryScreen';
import DefeatScreen from './DefeatScreen'; // Добавьте этот импорт
import TypingInterface from './TypingInterface';
import BackgroundManager from './BackgroundManager';
import EquipmentStats from './EquipmentStats';
import { getAdditionalWords } from '../services/wordsService';
import { getRandomCodeLine } from '../services/codeService';
import { LevelReward } from '../services/playerService';
// import { getPlayerEquipment, applyEquipmentEffects } from '../services/equipmentService'; // <--- УДАЛИТЬ
import { getEquippedItems, applyEquipmentEffects } from '../services/equippedGearService'; // <--- ИСПОЛЬ НОВЫЙ СЕРВИС
import { mathExpressions } from '../data/math-expressions';
import PlayerHealthBar from './PlayerHealthBar';
// Removed unused: getPlayerProgress, savePlayerProgress
import { getPlayerHealth, getMaxPlayerHealth, damagePlayer, healPlayerToMax, getPlayerBaseDamage } from '../services/playerService'; 
import { saveLevelResult } from '../services/progressService';
import { Language, ContentType } from '../types'; // <--- ИСПРАВЛЕННЫЙ ПУТЬ ИМПОРТА

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
  errorChars?: string[]; // Ensure this is part of GameStats if it's intended for overall stats
}

// Удаляем локальное определение Language, так как будем использовать импортированное
// export type Language =
//   | 'key-combos'
//   | 'simple-words'
//   | 'phrases'
//   | 'math'
//   | 'code'
//   | 'paragraphs'
//   | 'mixed'
//   // Добавьте сюда другие существующие значения, если они есть (например, 'ru', 'en')
//   | 'keyboard-training'; // <--- Добавлено это значение

export interface GamePlayConfig {
  backgroundImage: string;
  monsterImage: string;
  initialHealth: number;
  healAmount: number;
  regenerateAmount: number;
  healOnMistake: number;
  language: Language; // Теперь используется импортированный Language
  contentType: ContentType; // <--- ДОБАВИТЬ contentType
  monsterDamage?: number;
  attackInterval?: number;
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
  config: initialConfig, 
  onRestart,
  onReturnToMenu,
  onLevelComplete,
  rewards,
  isFirstCompletion = false,
  levelId
}) => {
  const [equippedPlayerItems] = useState(() => getEquippedItems()); 
  
  const [gameConfig] = useState(() => {
    return applyEquipmentEffects(initialConfig, equippedPlayerItems); 
  });
  
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeatScreen, setShowDefeatScreen] = useState(false); // Добавьте это состояние
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
  const [bonusDamageActive, setBonusDamageActive] = useState(false);
  const [bonusDamagePercent, setBonusDamagePercent] = useState(0);
  const [playerBaseDamage, setPlayerBaseDamage] = useState<number>(0); 

  // Добавляем состояния для здоровья игрока
  const [playerHealth, setPlayerHealth] = useState<number>(getPlayerHealth());
  const [maxPlayerHealth, setMaxPlayerHealth] = useState<number>(getMaxPlayerHealth());
  const [playerDamageAnimation, setPlayerDamageAnimation] = useState<boolean>(false);
  const [showAttackWarning, setShowAttackWarning] = useState<boolean>(false);
  const [currentErrorChars, setCurrentErrorChars] = useState<string[]>([]); // This was correctly defined
  // const [errorChars, setErrorChars] = useState<string[]>([]); // Define errorChars for overall game errors if needed, or remove if currentErrorChars is sufficient
  
  // Таймер для нанесения урона игроку
  const monsterAttackInterval = useRef<NodeJS.Timeout | null>(null);

  // Рассчитываем суммарное снижение урона от монстра (MOVED TO TOP LEVEL)
  const totalMonsterDamageReduction = useMemo(() => {
    return equippedPlayerItems.reduce((sum: number, item: any) => sum + (item.effects?.monsterDamageReduction || 0), 0);
  }, [equippedPlayerItems]);

  // Эффект автолечения игрока по бонусу снаряжения
  useEffect(() => {
    // Суммируем бонусы к лечению игрока со всего надетого снаряжения
    const totalPlayerHealBonus = equippedPlayerItems.reduce(
      (sum: number, item: any) => sum + (item.effects?.playerHealBonus || 0),
      0
    );

    if (totalPlayerHealBonus > 0 && !showVictory && !showDefeatScreen) {
      const healInterval = setInterval(() => {
        setPlayerHealth((prev: number) => {
          const healed = Math.min(maxPlayerHealth, prev + totalPlayerHealBonus);
          return healed;
        });
      }, 5000);

      return () => clearInterval(healInterval);
    }
    // Если бонуса нет или игра завершена — ничего не делаем
    return undefined;
  }, [equippedPlayerItems, maxPlayerHealth, showVictory, showDefeatScreen]);

  const generateNewWord = useCallback(() => {
    if (initialConfig.contentType === ContentType.Code) { 
      const codeLanguages = ['javascript', 'python', 'typescript', 'java', 'csharp']; 
      const randomLang = codeLanguages[Math.floor(Math.random() * codeLanguages.length)];
      getRandomCodeLine(randomLang).then((codeLine: string) => {
        setCurrentWord(codeLine);
        setUserInput('');
      });
    } else if (initialConfig.contentType === ContentType.Math) { 
      const useExpression = Math.random() < 0.7; // 70% шанс на выражение, 30% на число
      if (useExpression && mathExpressions.expressions.length > 0) {
        const randomIndex = Math.floor(Math.random() * mathExpressions.expressions.length);
        const expression = mathExpressions.expressions[randomIndex];
        setCurrentWord(expression.display); // Отображаем выражение
      } else if (mathExpressions.numbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * mathExpressions.numbers.length);
        setCurrentWord(mathExpressions.numbers[randomIndex]); // Отображаем число
      } else {
        setCurrentWord('1+1=?'); // Fallback
      }
      setUserInput('');
    } else {
      getAdditionalWords(initialConfig.language).then(newWords => { 
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          setCurrentWord(newWord);
          setUserInput('');
        }
      });
    }
  }, [initialConfig.contentType, initialConfig.language]); 

  const restartGame = () => {
    setMonster({
      health: initialConfig.initialHealth, // <--- FIX: Use initialConfig
      maxHealth: initialConfig.initialHealth, // <--- FIX: Use initialConfig
      imagePath: initialConfig.monsterImage, // <--- FIX: Use initialConfig
      isDefeated: false,
      takingDamage: false
    });
    setShowVictory(false);
    setShowDefeatScreen(false); // Сбрасываем экран поражения
    setCurrentErrorChars([]); // Reset currentErrorChars for the new game/word
    // setErrorChars([]); // Reset overall errorChars if it's being used for the entire session
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
    setPlayerBaseDamage(getPlayerBaseDamage()); // <--- Initialize player's base damage

    healPlayerToMax();
    setPlayerHealth(getPlayerHealth());
    setMaxPlayerHealth(getMaxPlayerHealth());
    
    // Очищаем предыдущий таймер, если он существует
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
      monsterAttackInterval.current = null;
    }
    
    // Добавляем отладочный вывод для проверки параметров уровня
    console.log('Уровень:', initialConfig); // <--- FIX: Use initialConfig
    console.log('Урон монстра:', initialConfig.monsterDamage); // <--- FIX: Use initialConfig
    console.log('Интервал атаки:', initialConfig.attackInterval); // <--- FIX: Use initialConfig
    
    // Запускаем таймер атаки монстра, если уровень предусматривает урон
    if (initialConfig.monsterDamage && initialConfig.monsterDamage > 0 && initialConfig.attackInterval && initialConfig.attackInterval > 0) { // <--- FIX: Use initialConfig
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
        
        // Define the attack logic once
        const performMonsterAttack = () => {
          if (!monster.isDefeated && !showVictory && !showDefeatScreen) {
            const baseMonsterDamage = initialConfig.monsterDamage || 0;
            const effectiveMonsterDamage = Math.max(0, baseMonsterDamage - totalMonsterDamageReduction);
            const actualDamageToPlayer = Math.min(effectiveMonsterDamage, 10); 
            
            console.log('Монстр атакует! Базовый урон:', baseMonsterDamage, 'Снижение:', totalMonsterDamageReduction, 'Эффективный:', effectiveMonsterDamage, 'Финальный:', actualDamageToPlayer);
            
            const newPlayerHealth = damagePlayer(actualDamageToPlayer);
            setPlayerHealth(newPlayerHealth);
            setPlayerDamageAnimation(true);
            
            setTimeout(() => {
              setPlayerDamageAnimation(false);
            }, 300);
            
            if (newPlayerHealth <= 0) {
              handleDefeat();
            }
          }
        };

        // Perform the first attack
        performMonsterAttack();

        // Set up interval for subsequent attacks if the monster is still active
        if (!monster.isDefeated && !showVictory && !showDefeatScreen) {
          monsterAttackInterval.current = setInterval(performMonsterAttack, initialConfig.attackInterval);
        }

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
  }, [initialConfig, monster.isDefeated, generateNewWord, totalMonsterDamageReduction, showVictory, showDefeatScreen]); // Добавлены зависимости
  
  // Функция обработки поражения игрока
  const handleDefeat = () => {
    // Останавливаем таймер атаки монстра
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
    
    setShowDefeatScreen(true); // Показываем экран поражения
    // onReturnToMenu(); // Больше не вызываем это напрямую
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    
    const isMathExpressionContent = initialConfig.contentType === ContentType.Math; 
    
    let expectedContent = currentWord;
    if (isMathExpressionContent) {
      const matchingExpression = mathExpressions.expressions.find(expr => expr.display === currentWord);
      if (matchingExpression) {
        expectedContent = matchingExpression.answer; // Для выражений ожидаем ответ
      } else {
        expectedContent = currentWord; // Для чисел ожидаем само число
      }
    }
    
    if (lastCharIndex >= 0) {
      const compareWith = expectedContent;
      
      if (lastCharIndex < compareWith.length) {
        const isCorrect = value[lastCharIndex] === compareWith[lastCharIndex];
        
        if (!isCorrect) {
          // Add the incorrect character to the errorChars array
          setCurrentErrorChars((prevErrorChars: string[]) => [...prevErrorChars, compareWith[lastCharIndex]]); 

          setUserInput(value.slice(0, -1));
          
          setGameStats(prev => ({
            ...prev,
            incorrectChars: prev.incorrectChars + 1,
            totalChars: prev.totalChars + 1
          }));
          
          setMonster(prev => {
            // Sum up monster heal reduction from equipment
            const totalHealReduction = equippedPlayerItems.reduce(
              (sum: number, item: any) => sum + (item.effects?.monsterHealReduction || 0),
              0
            );
            
            const healAmount = Math.max(0, gameConfig.healOnMistake - totalHealReduction);
            
            const newHealth = Math.min(
              prev.maxHealth || gameConfig.initialHealth,
              prev.health + healAmount
            );
            
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
          if (prev.isDefeated) return prev;

          // Расчет урона с бонусами от снаряжения
          const equipmentDamageBonus = equippedPlayerItems.reduce( // <--- Используем equippedPlayerItems
            (sum, item) => sum + (item.effects?.playerDamageBonus || 0), // Используем playerDamageBonus
            0
          );
          
          const baseDamageToApply = playerBaseDamage + equipmentDamageBonus;

          const damageWithActiveBonus = bonusDamageActive 
            ? baseDamageToApply * (1 + bonusDamagePercent / 100) 
            : baseDamageToApply;
          
          const finalDamageToApply = parseFloat(damageWithActiveBonus.toFixed(2));

          const newHealth = Math.max(0, prev.health - finalDamageToApply); // <--- Apply calculated damage
          const isDefeated = newHealth === 0;

          if (isDefeated) {
            setShowVictory(true);
            setGameStats(prevStats => ({ ...prevStats, endTime: Date.now() }));
            onLevelComplete();
          }
          const monsterElement = document.querySelector('.monster') as HTMLElement;
          if (monsterElement) {
            monsterElement.classList.remove('damage-animation');
            void monsterElement.offsetWidth;
            monsterElement.classList.add('damage-animation');
          }
          
          setCurrentDamage(finalDamageToApply); // <--- Show the actual damage applied
          setTimeout(() => setCurrentDamage(0), 1330);
          
          return { ...prev, health: newHealth, isDefeated };
        });
        
        setUserInput(value);
        
        // Для математических выражений проверяем, совпадает ли ввод с ответом
        if ((isMathExpressionContent && value === expectedContent) || 
            (!isMathExpressionContent && value === currentWord)) {
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
      saveLevelResult(levelId.toString(), speed, accuracy, currentErrorChars); // Pass currentErrorChars here
    }
    onReturnToMenu();
  };
  // Перемещенный код НАЧАЛО
  const handleVictory = useCallback(() => {
    if (showVictory || showDefeatScreen) return; // Already handled

    console.log("Victory achieved!");
    setShowVictory(true); // Устанавливаем локальное состояние для отображения экрана победы
    setGameStats(prev => ({
      ...prev,
      endTime: Date.now(),
    }));

    // НЕ ВЫЗЫВАЙТЕ onLevelComplete здесь напрямую

    // Stop monster attacks
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
  }, [showVictory, showDefeatScreen /* убрали onLevelComplete отсюда, если он не нужен для других логик в useCallback */]);

  // Существующий useEffect для определения условия победы
  useEffect(() => {
    if (!monster.isDefeated && monster.health <= 0 && !showVictory && !showDefeatScreen) {
      setMonster(prev => ({ ...prev, isDefeated: true }));
      handleVictory(); 
    }
  }, [monster.health, monster.isDefeated, showVictory, showDefeatScreen, handleVictory]);

  // Новый useEffect для вызова onLevelComplete, когда showVictory становится true
  useEffect(() => {
    if (showVictory) {
      if (onLevelComplete) {
        onLevelComplete(); // Это вызовет handleLevelComplete из App.tsx
      }
    }
  }, [showVictory, onLevelComplete]); // Запускается, когда изменяется showVictory или onLevelComplete
  // Перемещенный код КОНЕЦ

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
            initialHealth={gameConfig.initialHealth}
            canHeal={true}
            healAmount={gameConfig.healAmount}
            canRegenerate={true}
            regenerateAmount={gameConfig.regenerateAmount}
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
            gameStats={{ ...gameStats, errorChars: currentErrorChars }}
            speed={gameStats && gameStats.endTime && gameStats.startTime && gameStats.totalChars > 0
              ? gameStats.correctChars / ((gameStats.endTime - gameStats.startTime) / 60000)
              : 0}
            accuracy={gameStats && gameStats.totalChars > 0
              ? (gameStats.correctChars / gameStats.totalChars) * 100
              : 0}
            onRestart={restartGame}
            rewards={rewards}
            isFirstCompletion={isFirstCompletion}
            levelId={levelId as number}
          />
        ) : showDefeatScreen ? ( // Добавляем условие для экрана поражения
          <DefeatScreen
            onRestart={() => {
              setShowDefeatScreen(false);
              restartGame(); // Используем restartGame, который уже вызывает onRestart из App.tsx
            }}
            onReturnToMenu={() => {
              setShowDefeatScreen(false);
              onReturnToMenu();
            }}
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
                equipment={equippedPlayerItems} // <--- FIX: Use equippedPlayerItems directly
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
