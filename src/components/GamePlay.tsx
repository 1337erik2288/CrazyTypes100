import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './GamePlay.css';
import Monster from './Monster';
import HealthBar from './HealthBar';
import VictoryScreen from './VictoryScreen';
import DefeatScreen from './DefeatScreen';
import TypingInterface from './TypingInterface';
import BackgroundManager from './BackgroundManager';
import EquipmentStats from './EquipmentStats';
import { getAdditionalWords } from '../services/wordsService';
import { getRandomCodeLine } from '../services/codeService';
import { LevelReward } from '../services/playerService';
import { getEquippedItems, applyEquipmentEffects } from '../services/equippedGearService';
import { mathExpressions } from '../data/math-expressions';
import { getPlayerHealth, getMaxPlayerHealth, damagePlayer, healPlayerToMax, getPlayerBaseDamage, addRewards } from '../services/playerService'; 
import { saveLevelResult } from '../services/progressService';
import { Language, ContentType } from '../types';
import { getRandomBackgroundImage, getRandomMonsterImage } from '../data/levelResources';

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
  speed?: number;
  accuracy?: number;
  errorChars?: string[];
}

export interface GamePlayConfig {
  backgroundImage: string;
  monsterImage: string;
  initialHealth: number;
  healAmount: number;
  regenerateAmount: number;
  healOnMistake: number;
  language: Language;
  contentType: ContentType;
  monsterDamage?: number;
  attackInterval?: number;
  difficulty?: string;
}

interface GamePlayProps {
  config: GamePlayConfig;
  onRestart: () => void;
  onLevelComplete: () => void;
  rewards?: LevelReward;
  isFirstCompletion?: boolean;
  levelId: number | null;
}

const GamePlay: React.FC<GamePlayProps> = ({
  config: initialConfig, 
  onRestart,
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
  const [showDefeatScreen, setShowDefeatScreen] = useState(false);
  const [monster, setMonster] = useState<Monster>(() => ({
    health: gameConfig.initialHealth,
    maxHealth: gameConfig.initialHealth,
    imagePath: '',
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
  const [playerHealth, setPlayerHealth] = useState<number>(getPlayerHealth());
  const [maxPlayerHealth, setMaxPlayerHealth] = useState<number>(getMaxPlayerHealth());
  const [playerDamageAnimation, setPlayerDamageAnimation] = useState<boolean>(false);
  const [showAttackWarning, setShowAttackWarning] = useState<boolean>(false);
  const [currentErrorChars, setCurrentErrorChars] = useState<string[]>([]);
  
  // Новое состояние для фона
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const monsterAttackInterval = useRef<NodeJS.Timeout | null>(null);

  const totalMonsterDamageReduction = useMemo(() => {
    return equippedPlayerItems.reduce((sum: number, item: any) => sum + (item.effects?.monsterDamageReduction || 0), 0);
  }, [equippedPlayerItems]);

  // Установка фона один раз при монтировании
  useEffect(() => {
    const randomBackground = getRandomBackgroundImage();
    setBackgroundImage(randomBackground);
  }, []);

  useEffect(() => {
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
    return undefined;
  }, [equippedPlayerItems, maxPlayerHealth, showVictory, showDefeatScreen]);

  useEffect(() => {
    const randomMonsterImage = getRandomMonsterImage();
    setMonster(prevMonster => ({
      ...prevMonster,
      imagePath: randomMonsterImage,
      health: gameConfig.initialHealth,
      maxHealth: gameConfig.initialHealth
    }));
  }, [gameConfig.initialHealth, gameConfig.monsterImage]);

  const generateNewWord = useCallback(() => {
    if (initialConfig.contentType === ContentType.Code) { 
      const codeLanguages = ['javascript', 'python', 'typescript', 'java', 'csharp']; 
      const randomLang = codeLanguages[Math.floor(Math.random() * codeLanguages.length)];
      getRandomCodeLine(randomLang).then((codeLine: string) => {
        setCurrentWord(codeLine);
        setUserInput('');
      });
    } else if (initialConfig.contentType === ContentType.Math) { 
      const useExpression = Math.random() < 0.7;
      if (useExpression && mathExpressions.expressions.length > 0) {
        const randomIndex = Math.floor(Math.random() * mathExpressions.expressions.length);
        const expression = mathExpressions.expressions[randomIndex];
        setCurrentWord(expression.display);
      } else if (mathExpressions.numbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * mathExpressions.numbers.length);
        setCurrentWord(mathExpressions.numbers[randomIndex]);
      } else {
        setCurrentWord('1+1=?');
      }
      setUserInput('');
    } else {
      getAdditionalWords(initialConfig.contentType).then(newWords => { 
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
    const randomMonsterImage = getRandomMonsterImage();
    setMonster({
      health: gameConfig.initialHealth,
      maxHealth: gameConfig.initialHealth,
      imagePath: randomMonsterImage,
      isDefeated: false,
      takingDamage: false
    });
    setShowVictory(false);
    setShowDefeatScreen(false);
    setCurrentErrorChars([]);
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
    setPlayerBaseDamage(getPlayerBaseDamage());
    healPlayerToMax();
    setPlayerHealth(getPlayerHealth());
    setMaxPlayerHealth(getMaxPlayerHealth());
    
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
      monsterAttackInterval.current = null;
    }
    
    console.log('Уровень:', initialConfig);
    console.log('Урон монстра:', initialConfig.monsterDamage);
    console.log('Интервал атаки:', initialConfig.attackInterval);
    
    if (initialConfig.monsterDamage && initialConfig.monsterDamage > 0 && initialConfig.attackInterval && initialConfig.attackInterval > 0) {
      const initialDelay = 7000;
      
      setTimeout(() => {
        setShowAttackWarning(true);
        setTimeout(() => {
          setShowAttackWarning(false);
        }, 2000);
      }, initialDelay - 2000);
      
      const initialAttackTimer = setTimeout(() => {
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

        performMonsterAttack();

        if (!monster.isDefeated && !showVictory && !showDefeatScreen) {
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
  }, [initialConfig, monster.isDefeated, generateNewWord, totalMonsterDamageReduction, showVictory, showDefeatScreen]);
  
  const handleDefeat = () => {
    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
    setShowDefeatScreen(true);
  };

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    
    const isMathExpressionContent = initialConfig.contentType === ContentType.Math; 
    
    let expectedContent = currentWord;
    if (isMathExpressionContent) {
      const matchingExpression = mathExpressions.expressions.find(expr => expr.display === currentWord);
      if (matchingExpression) {
        expectedContent = matchingExpression.answer;
      } else {
        expectedContent = currentWord;
      }
    }
    
    if (lastCharIndex >= 0) {
      const compareWith = expectedContent;
      
      if (lastCharIndex < compareWith.length) {
        const isCorrect = value[lastCharIndex] === compareWith[lastCharIndex];
        
        if (!isCorrect) {
          setCurrentErrorChars((prevErrorChars: string[]) => [...prevErrorChars, compareWith[lastCharIndex]]); 
          setUserInput(value.slice(0, -1));
          
          setGameStats(prev => ({
            ...prev,
            incorrectChars: prev.incorrectChars + 1,
            totalChars: prev.totalChars + 1
          }));
          
          setMonster(prev => {
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
          const equipmentDamageBonus = equippedPlayerItems.reduce(
            (sum, item) => sum + (item.effects?.playerDamageBonus || 0),
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
          }
          const monsterElement = document.querySelector('.monster') as HTMLElement;
          if (monsterElement) {
            monsterElement.classList.remove('damage-animation');
            void monsterElement.offsetWidth;
            monsterElement.classList.add('damage-animation');
          }
          
          setCurrentDamage(finalDamageToApply);
          setTimeout(() => setCurrentDamage(0), 1330);
          
          return { ...prev, health: newHealth, isDefeated };
        });
        
        setUserInput(value);
        
        if ((isMathExpressionContent && value === expectedContent) || 
            (!isMathExpressionContent && value === currentWord)) {
          if (!monster.isDefeated) {
            generateNewWord();
          }
        }
      }
    }
  };

  const handleReturnToMenu = () => {
    onLevelComplete();
  };

  const handleVictory = useCallback(() => {
    if (showVictory || showDefeatScreen) return;

    console.log("Victory achieved!");
    setShowVictory(true);
    setGameStats(prev => ({
      ...prev,
      endTime: Date.now(),
    }));

    if (levelId !== null && gameStats.endTime === null) {
      const durationMinutes = (Date.now() - gameStats.startTime) / 60000;
      const speed = gameStats.correctChars / durationMinutes;
      const accuracy = (gameStats.correctChars / gameStats.totalChars) * 100;
      saveLevelResult(levelId.toString(), speed, accuracy, currentErrorChars);

      if (isFirstCompletion && rewards) {
        addRewards(rewards.experience, rewards.gold);
      }
    }

    if (monsterAttackInterval.current) {
      clearInterval(monsterAttackInterval.current);
    }
  }, [showVictory, showDefeatScreen, levelId, gameStats, currentErrorChars, isFirstCompletion, rewards]);

  useEffect(() => {
    if (!monster.isDefeated && monster.health <= 0 && !showVictory && !showDefeatScreen) {
      setMonster(prev => ({ ...prev, isDefeated: true }));
      handleVictory(); 
    }
  }, [monster.health, monster.isDefeated, showVictory, showDefeatScreen, handleVictory]);

  return (
    <div className="game-play-container">
      <BackgroundManager imagePath={backgroundImage || ''} />
      <div className="game-content">
        <div className="top-section">
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
                onLevelComplete={onLevelComplete}
              />
            ) : showDefeatScreen ? (
              <DefeatScreen
                onRestart={() => {
                  setShowDefeatScreen(false);
                  restartGame();
                }}
                onLevelComplete={() => {
                  setShowDefeatScreen(false);
                  onLevelComplete();
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
                    equipment={equippedPlayerItems}
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
        </div>
      </div>
    </div>
  );
};

export default GamePlay;