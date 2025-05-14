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
import { getPlayerHealth, getMaxPlayerHealth, damagePlayer, healPlayerToMax, getPlayerBaseDamage } from '../services/playerService'; // Ensure getPlayerBaseDamage is imported
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

export interface GamePlayConfig { // Убедитесь, что этот интерфейс экспортируется или доступен для equippedGearService
  backgroundImage: string;
  monsterImage: string;
  initialHealth: number;
  healAmount: number;
  regenerateAmount: number;
  // damageAmount: number; // Убедитесь, что это поле УДАЛЕНО
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
  config: initialConfig, // config is destructured to initialConfig
  onRestart,
  onReturnToMenu,
  onLevelComplete,
  rewards,
  isFirstCompletion = false,
  levelId
}) => {
  // Apply equipment effects to the game configuration
  const [equippedPlayerItems] = useState(() => getEquippedItems()); // <--- FIX: Use getEquippedItems and rename state
  
  const [gameConfig] = useState(() => {
    // return applyEquipmentEffects(config, playerEquipment.equipped); // <--- OLD
    return applyEquipmentEffects(initialConfig, equippedPlayerItems); // <--- FIX: Use initialConfig and equippedPlayerItems
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
  const [playerBaseDamage, setPlayerBaseDamage] = useState<number>(0); // <--- Add state for player's base damage

  // Добавляем состояния для здоровья игрока
  const [playerHealth, setPlayerHealth] = useState<number>(getPlayerHealth());
  const [maxPlayerHealth, setMaxPlayerHealth] = useState<number>(getMaxPlayerHealth());
  const [playerDamageAnimation, setPlayerDamageAnimation] = useState<boolean>(false);
  const [showAttackWarning, setShowAttackWarning] = useState<boolean>(false);
  
  // Таймер для нанесения урона игроку
  const monsterAttackInterval = useRef<NodeJS.Timeout | null>(null);

  // Рассчитываем суммарное снижение урона от монстра (MOVED TO TOP LEVEL)
  const totalMonsterDamageReduction = useMemo(() => {
    return equippedPlayerItems.reduce((sum, item) => sum + (item.effects?.monsterDamageReduction || 0), 0);
  }, [equippedPlayerItems]);

  const generateNewWord = useCallback(() => {
    if (initialConfig.language === 'code') { // Получаем список всех доступных языков из сервиса или вручную
      const codeLanguages = ['javascript', 'python', 'typescript', 'java', 'csharp']; // Пример, замените на актуальные
      // хочу гулять...
      const randomLang = codeLanguages[Math.floor(Math.random() * codeLanguages.length)];
      getRandomCodeLine(randomLang).then((codeLine: string) => {
        setCurrentWord(codeLine);
        setUserInput('');
      });
    } else if (initialConfig.language === 'math') { // Специальная обработка для математических выражений
      getAdditionalWords(initialConfig.language).then(newWords => { // <--- FIX: Use initialConfig
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
      getAdditionalWords(initialConfig.language).then(newWords => { // <--- FIX: Use initialConfig
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          setCurrentWord(newWord);
          setUserInput('');
        }
      });
    }
  }, [initialConfig.language]); // <--- FIX: Use initialConfig.language in dependency array

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
        // Рассчитываем суммарное снижение урона от монстра
        // const totalMonsterDamageReduction = useMemo(() => { // <-- REMOVE THIS useMemo from here
        //   return equippedPlayerItems.reduce((sum, item) => sum + (item.effects?.monsterDamageReduction || 0), 0);
        // }, [equippedPlayerItems]);
        
        // useEffect(() => { // <-- REMOVE THIS NESTED useEffect
        //   generateNewWord();
        //   setPlayerBaseDamage(getPlayerBaseDamage());
      
        //   // Монстр атакует только если не побежден
        //   if (!monster.isDefeated) {
        //     // Ограничиваем урон монстра до максимум 10 единиц за атаку
        //     const actualDamage = Math.min(initialConfig.monsterDamage || 0, 10); 
            
        //     console.log('Монстр атакует! Урон:', actualDamage);
            
        //     const newHealth = damagePlayer(actualDamage);
        //     console.log('Новое здоровье игрока:', newHealth);
            
        //     setPlayerHealth(newHealth);
        //     setPlayerDamageAnimation(true);
            
        //     // Сбрасываем анимацию получения урона
        //     setTimeout(() => {
        //       setPlayerDamageAnimation(false);
        //     }, 300);
            
        //     // Проверяем, не проиграл ли игрок
        //     if (newHealth <= 0) {
        //       // Игрок проиграл
        //       handleDefeat();
        //     }
        //   }
        // }, initialConfig.attackInterval); // <-- REMOVE THIS (and its incorrect dependency)

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
    
    // Проверяем, является ли текущее слово математическим выражением
    const isMathExpression = initialConfig.language === 'math' && currentWord.includes('=?'); // <--- FIX: Use initialConfig
    
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
            // Sum up monster heal reduction from equipment
            const totalHealReduction = equippedPlayerItems.reduce(
              (sum, item) => sum + (item.effects?.monsterHealReduction || 0),
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
            gameStats={gameStats}
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