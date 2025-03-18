import { useState, useEffect } from 'react'
import './App.css'
import GamePlay, { GamePlayConfig, Language } from './components/GamePlay'
import LevelSelect, { levels, Level } from './components/LevelSelect'
import { getPlayerProgress, savePlayerProgress, addRewards, calculateLevelReward, PlayerProgress } from './services/playerService'

const monsterImages = [
  '/src/image/monster/Cartoon Monster Design 3.png',
  '/src/image/monster/Cartoon Monster Design.png',
  '/Users/erik/Documents/TraeProjects/CrazyTypes100/src/image/monster/Cartoon Monster Design.png',
  '/src/image/monster/Cartoon Monster Photoroom Mar 18 2025.png',
  '/src/image/monster/Cartoon Style Monster Photoroom.png',
  '/src/image/monster/DALL·E Cartoon March 18 2025.png',
  '/src/image/monster/DALL·E_2025_03_18_07_42_33_A_cartoon_style_monster_with_a_mischievous-Photoroom.png'
]

const backgroundImages = [
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg'
]

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(getPlayerProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [currentRewards, setCurrentRewards] = useState<{ experience: number; gold: number } | null>(null);
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameConfig, setGameConfig] = useState(() => ({
    backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)],
    initialHealth: 150,
    healAmount: 5,
    regenerateAmount: 1,
    damageAmount: 4,
    healOnMistake: 5,
    language: 'en' as Language
  }))

  const handleRestart = () => {
    setGameConfig(prev => ({
      ...prev,
      backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
      monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)]
    }))
  }

  const handleLevelSelect = (config: GamePlayConfig, levelId: number) => {
    const selectedLevel = levels.find(level => level.id === levelId) || null;
    setGameConfig(config);
    setCurrentLevelId(levelId);
    setCurrentLevel(selectedLevel);
    
    // Check if this level is being played for the first time
    const isFirstTime = !playerProgress.completedLevels.includes(levelId);
    setIsFirstCompletion(isFirstTime);
    
    // Calculate potential rewards if this is the first completion
    if (isFirstTime && selectedLevel) {
      const rewards = calculateLevelReward(selectedLevel);
      setCurrentRewards(rewards);
    } else {
      setCurrentRewards(null);
    }
    
    setIsPlaying(true);
  };

  const handleReturnToMenu = () => {
    setIsPlaying(false);
  };
  
  // Load player progress from localStorage on component mount
  useEffect(() => {
    const progress = getPlayerProgress();
    setPlayerProgress(progress);
  }, []);
  
  // Mark current level as completed and award rewards when victory is achieved
  const handleLevelComplete = () => {
    if (currentLevelId && currentLevel && !playerProgress.completedLevels.includes(currentLevelId)) {
      // Use the pre-calculated rewards from handleLevelSelect
      if (currentRewards) {
        // Add rewards and update player progress
        const updatedProgress = addRewards(currentRewards.experience, currentRewards.gold);
        
        // Update completed levels
        const newCompletedLevels = [...updatedProgress.completedLevels, currentLevelId];
        updatedProgress.completedLevels = newCompletedLevels;
        
        // Save and update state
        savePlayerProgress(updatedProgress);
        setPlayerProgress(updatedProgress);
      }
    }
  };

  return isPlaying ? (
    <GamePlay 
      config={gameConfig} 
      onRestart={handleRestart} 
      onReturnToMenu={handleReturnToMenu}
      onLevelComplete={handleLevelComplete}
      rewards={currentRewards || undefined}
      isFirstCompletion={isFirstCompletion}
    />
  ) : (
    <LevelSelect 
      onLevelSelect={handleLevelSelect} 
      completedLevels={playerProgress.completedLevels}
      playerProgress={playerProgress}
    />
  )
}

export default App
