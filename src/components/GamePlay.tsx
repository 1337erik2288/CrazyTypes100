import React, { useState, useEffect, useCallback } from 'react';
import Monster from './Monster';
import HealthBar from './HealthBar';
import VictoryScreen from './VictoryScreen';
import TypingInterface from './TypingInterface';
import BackgroundManager from './BackgroundManager';
import { getAdditionalWords } from '../services/wordsService';

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

export type Language = 'en' | 'ru';

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
}

const GamePlay: React.FC<GamePlayProps> = ({ config, onRestart, onReturnToMenu }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [monster, setMonster] = useState<Monster>(() => ({
    health: config.initialHealth,
    imagePath: config.monsterImage,
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
    getAdditionalWords(config.language).then(newWords => {
      if (newWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * newWords.length);
        const newWord = newWords[randomIndex];
        setCurrentWord(newWord);
        setUserInput('');
      }
    });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastCharIndex = value.length - 1;
    
    if (lastCharIndex >= 0 && lastCharIndex < currentWord.length) {
      const isCorrect = value[lastCharIndex] === currentWord[lastCharIndex];
      
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
      
      if (value === currentWord && !monster.isDefeated) {
        generateNewWord();
      }
    }
  };

  return (
    <>
      <BackgroundManager imagePath={config.backgroundImage} />
      <div className="game-container">
        <div className="monster-container">
          <Monster 
            imagePath={monster.imagePath}
            isDefeated={monster.isDefeated}
          />
          <HealthBar 
            health={monster.health}
            canHeal={true}
            healAmount={config.healAmount}
            canRegenerate={true}
            regenerateAmount={config.regenerateAmount}
            isDefeated={monster.isDefeated}
            onHealthChange={(newHealth) => setMonster(prev => ({ ...prev, health: newHealth }))}
          />
        </div>
        {showVictory ? (
          <VictoryScreen gameStats={gameStats} onRestart={restartGame} onReturnToMenu={onReturnToMenu} />
        ) : (
          <TypingInterface
            currentWord={currentWord}
            userInput={userInput}
            onInputChange={handleInputChange}
          />
        )}
      </div>
    </>
  );
};

export default GamePlay;