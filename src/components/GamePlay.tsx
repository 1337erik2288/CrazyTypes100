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
import { useAuth } from '../contexts/AuthContext'; // Добавлено для получения userId
import { Equipment } from '../data/equipmentData'; // Добавлен импорт типа Equipment

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

// Предполагаемое местоположение и вид определения типа Language
// Убедитесь, что вы нашли правильное определение в вашем файле
export type Language =
  | 'key-combos'
  | 'simple-words'
  | 'phrases'
  | 'math'
  | 'code'
  | 'paragraphs'
  | 'mixed'
  // Добавьте сюда другие существующие значения, если они есть (например, 'ru', 'en')
  | 'keyboard-training'; // <--- Добавлено это значение

export interface GamePlayConfig {
  backgroundImage: string;
  monsterImage: string;
  initialHealth: number;
  healAmount: number;
  regenerateAmount: number;
  healOnMistake: number;
  language: Language; // Теперь 'keyboard-training' будет допустимым значением
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
  const { currentUser } = useAuth(); // Получаем текущего пользователя
  const userId = currentUser?.uid; // Получаем ID пользователя

  const [actualEquippedItems, setActualEquippedItems] = useState<Equipment[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true); // Состояние для отслеживания загрузки

  // Эффект для загрузки экипированных предметов
  useEffect(() => {
    if (userId) {
      setIsLoadingItems(true);
      getEquippedItems(userId)
        .then(items => {
          setActualEquippedItems(items);
        })
        .catch(error => {
          console.error("Ошибка загрузки экипировки:", error);
          setActualEquippedItems([]); // В случае ошибки используем пустой массив
        })
        .finally(() => {
          setIsLoadingItems(false);
        });
    } else {
      // Если пользователя нет, экипировки тоже нет
      setActualEquippedItems([]);
      setIsLoadingItems(false);
    }
  }, [userId]); // Зависимость от userId

  // Вычисляем эффективную конфигурацию игры с учетом снаряжения
  const effectiveGameConfig = useMemo(() => {
    return applyEquipmentEffects(initialConfig, actualEquippedItems);
  }, [initialConfig, actualEquippedItems]);
  
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeatScreen, setShowDefeatScreen] = useState(false); // Добавьте это состояние

  // Инициализация состояния монстра. Обновляется через useEffect ниже.
  const [monster, setMonster] = useState<Monster>(() => ({
    health: effectiveGameConfig.initialHealth,
    maxHealth: effectiveGameConfig.initialHealth,
    imagePath: effectiveGameConfig.monsterImage,
    isDefeated: false,
    takingDamage: false
  }));

  // Обновляем состояние монстра, когда effectiveGameConfig изменится (например, после загрузки предметов)
  useEffect(() => {
    setMonster({
      health: effectiveGameConfig.initialHealth,
      maxHealth: effectiveGameConfig.initialHealth,
      imagePath: effectiveGameConfig.monsterImage,
      isDefeated: false, // Сбрасываем состояние при изменении конфига (например, при перезапуске с новым конфигом)
      takingDamage: false
    });
  }, [effectiveGameConfig]);

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
  // Инициализируем с значениями из initialConfig, затем загружаем актуальные в useEffect
  const [playerHealth, setPlayerHealth] = useState<number>(initialConfig.initialHealth);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState<number>(initialConfig.initialHealth);
  const [playerDamageAnimation, setPlayerDamageAnimation] = useState<boolean>(false);
  const [showAttackWarning, setShowAttackWarning] = useState<boolean>(false);

  // Эффект для загрузки начального здоровья игрока
  useEffect(() => {
    if (userId) {
      const fetchPlayerHealthStats = async () => {
        try {
          const currentHealth = await getPlayerHealth(userId);
          const maxHealth = await getMaxPlayerHealth(userId);
          setPlayerHealth(currentHealth);
          setMaxPlayerHealth(maxHealth);
        } catch (error) {
          console.error("Ошибка загрузки здоровья игрока из сервиса:", error);
          // В случае ошибки используем значения из initialConfig
          setPlayerHealth(initialConfig.initialHealth);
          setMaxPlayerHealth(initialConfig.initialHealth);
        }
      };
      fetchPlayerHealthStats();
    } else {
      // Если нет userId, используем значения из initialConfig (уже установлены, но для ясности)
      setPlayerHealth(initialConfig.initialHealth);
      setMaxPlayerHealth(initialConfig.initialHealth);
    }
  }, [userId, initialConfig]); // Перезапускаем, если изменится userId или initialConfig
  
  // Таймер для нанесения урона игроку
  const monsterAttackInterval = useRef<NodeJS.Timeout | null>(null);

  // Рассчитываем суммарное снижение урона от монстра
  const totalMonsterDamageReduction = useMemo(() => {
    return actualEquippedItems.reduce((sum: number, item: Equipment) => sum + (item.effects?.monsterDamageReduction || 0), 0);
  }, [actualEquippedItems]);

  // Эффект автолечения игрока по бонусу снаряжения
  useEffect(() => {
    // Суммируем бонусы к лечению игрока со всего надетого снаряжения
    const totalPlayerHealBonus = actualEquippedItems.reduce(
      (sum: number, item: Equipment) => sum + (item.effects?.playerHealBonus || 0),
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
  }, [actualEquippedItems, maxPlayerHealth, showVictory, showDefeatScreen]);

  const generateNewWord = useCallback(() => {
    if (initialConfig.language === 'code') {
      const codeLanguages = ['javascript', 'python', 'typescript', 'java', 'csharp'];
      const randomLang = codeLanguages[Math.floor(Math.random() * codeLanguages.length)];
      getRandomCodeLine(randomLang).then((codeLine: string) => {
        setCurrentWord(codeLine);
        setUserInput('');
      });
    } else if (initialConfig.language === 'math') {
      // Ошибка TS2554: Expected 1 arguments, but got 0.
      // wordsService.getAdditionalWords ожидает аргумент 'language'.
      getAdditionalWords(initialConfig.language).then(newWords => { // <--- ИСПРАВЛЕНО: добавлен initialConfig.language
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          const useExpressions = Math.random() > 0.5;
          if (!useExpressions) {
            setCurrentWord(newWord);
          } else {
            const matchingExpression = mathExpressions.expressions.find(expr => expr.answer === newWord);
            if (matchingExpression) {
              setCurrentWord(matchingExpression.display);
            } else {
              setCurrentWord(newWord);
            }
          }
          setUserInput('');
        }
      });
    } else {
      // Ошибка TS2554: Expected 1 arguments, but got 0.
      // wordsService.getAdditionalWords ожидает аргумент 'language'.
      getAdditionalWords(initialConfig.language).then(newWords => { // <--- ИСПРАВЛЕНО: добавлен initialConfig.language
        if (newWords.length > 0) {
          const randomIndex = Math.floor(Math.random() * newWords.length);
          const newWord = newWords[randomIndex];
          setCurrentWord(newWord);
          setUserInput('');
        }
      });
    }
  }, [initialConfig.language]);

  const restartGame = () => {
    setMonster({
      health: initialConfig.initialHealth,
      maxHealth: initialConfig.initialHealth,
      imagePath: initialConfig.monsterImage,
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

  // Переносим useCallback выше useEffect, чтобы не было проблем с зависимостями
  const handleDefeat = useCallback(() => {
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
    setShowDefeatScreen(true);
    setGameStats(prev => ({ ...prev, endTime: Date.now() }));
  }, [setShowDefeatScreen]);

  useEffect(() => {
    // Генерация нового слова и инициализация статов игрока
    generateNewWord();

    const initializePlayerStats = async () => {
      if (userId) {
        try {
          const baseDamage = await getPlayerBaseDamage();
          setPlayerBaseDamage(baseDamage);

          await healPlayerToMax(userId);

          const currentHealth = await getPlayerHealth(userId);
          const maxHealth = await getMaxPlayerHealth(userId);
          setPlayerHealth(currentHealth);
          setMaxPlayerHealth(maxHealth);

        } catch (error) {
          console.error("Ошибка инициализации статов игрока в useEffect:", error);
          setPlayerBaseDamage(0);
          setPlayerHealth(initialConfig.initialHealth);
          setMaxPlayerHealth(initialConfig.initialHealth);
        }
      } else {
        setPlayerBaseDamage(0);
        setPlayerHealth(initialConfig.initialHealth);
        setMaxPlayerHealth(initialConfig.initialHealth);
      }
    };

    initializePlayerStats();

    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
      monsterAttackInterval.current = null;
    }

    if (initialConfig.monsterDamage && initialConfig.monsterDamage > 0 && initialConfig.attackInterval && initialConfig.attackInterval > 0) {
      const initialDelay = 7000;

      setTimeout(() => {
        setShowAttackWarning(true);
        setTimeout(() => {
          setShowAttackWarning(false);
        }, 2000);
      }, initialDelay - 2000);

      const initialAttackTimer = setTimeout(async () => {
        const performMonsterAttack = async () => {
          if (!monster.isDefeated && !showVictory && !showDefeatScreen && userId) {
            const baseMonsterDamage = initialConfig.monsterDamage || 0;
            const effectiveMonsterDamage = Math.max(0, baseMonsterDamage - totalMonsterDamageReduction);
            const actualDamageToPlayer = effectiveMonsterDamage;

            const newPlayerHealth = await damagePlayer(userId, actualDamageToPlayer);
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

        await performMonsterAttack();

        if (!monster.isDefeated && !showVictory && !showDefeatScreen && userId) {
          monsterAttackInterval.current = setInterval(performMonsterAttack, initialConfig.attackInterval);
        }

      }, initialDelay);

      return () => {
        clearTimeout(initialAttackTimer);
        if (monsterAttackInterval.current) {
          clearInterval(monsterAttackInterval.current);
        }
      };
    }

    return () => {
      if (monsterAttackInterval.current) {
        clearInterval(monsterAttackInterval.current);
      }
    };
  }, [initialConfig, monster.isDefeated, generateNewWord, totalMonsterDamageReduction, showVictory, showDefeatScreen, userId, handleDefeat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    
    const isMathExpression = initialConfig.language === 'math' && currentWord.includes('=?');
    
    let expectedAnswer = currentWord;
    if (isMathExpression) {
      const matchingExpression = mathExpressions.expressions.find(expr => expr.display === currentWord);
      if (matchingExpression) {
        expectedAnswer = matchingExpression.answer;
      }
    }
    
    if (lastCharIndex >= 0) {
      const compareWith = isMathExpression ? expectedAnswer : currentWord;
      
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
            const totalHealReduction = actualEquippedItems.reduce(
              (sum: number, item: Equipment) => sum + (item.effects?.monsterHealReduction || 0), // ИСПРАВЛЕНО: Equipment
              0
            );
            
            // TS2304: Cannot find name 'gameConfig'.
            const healAmount = Math.max(0, effectiveGameConfig.healOnMistake - totalHealReduction); // ИСПРАВЛЕНО
            
            const newHealth = Math.min(
              prev.maxHealth || effectiveGameConfig.initialHealth, // ИСПРАВЛЕНО
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

          // TS2304: Cannot find name 'equippedPlayerItems'.
          // TS7006: Parameter 'sum' implicitly has an 'any' type.
          // TS7006: Parameter 'item' implicitly has an 'any' type.
          const equipmentDamageBonus = actualEquippedItems.reduce( // ИСПРАВЛЕНО
            (sum: number, item: Equipment) => sum + (item.effects?.playerDamageBonus || 0), // ИСПРАВЛЕНО: типы
            0
          );
          
          const baseDamageToApply = playerBaseDamage + equipmentDamageBonus;

          const damageWithActiveBonus = bonusDamageActive 
            ? baseDamageToApply * (1 + bonusDamagePercent / 100) 
            : baseDamageToApply;
          
          const finalDamageToApply = parseFloat(damageWithActiveBonus.toFixed(2));

          const newHealth = Math.max(0, prev.health - finalDamageToApply); 
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
      saveLevelResult(userId, levelId.toString(), speed, accuracy); // Исправлено: добавлен userId первым аргументом
    }
    onReturnToMenu();
  };

  return (
    <>
      <BackgroundManager imagePath={effectiveGameConfig.backgroundImage} />
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
            gameStats={{...gameStats, speed: finalSpeed, accuracy: finalAccuracy}}
            onRestart={() => {
              restartGame();
              if (userId) healPlayerToMax(userId);
            }}
            rewards={rewards}
            isFirstCompletion={isFirstCompletion}
            speed={finalSpeed}
            accuracy={finalAccuracy}
            levelId={levelId}
            userId={userId} // Передаем userId
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
