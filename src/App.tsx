import { useState, useEffect } from 'react'
import './App.css'
import './components/GameContainer.css'
import GamePlay, { GamePlayConfig, Language } from './components/GamePlay'
import LevelSelect, { levels, Level } from './components/LevelSelect'
import Shop from './components/Shop'
import { getPlayerProgress, savePlayerProgress, addRewards, calculateLevelReward, PlayerProgress } from './services/playerService'
import TrainingRoom from './components/TrainingRoom';

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
  const [currentScreen, setCurrentScreen] = useState<'levelSelect' | 'playing' | 'shop' | 'trainingRoom'>('levelSelect'); // ИЗМЕНЕНО: добавлен 'trainingRoom'
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
    setGameConfig(prevConfig => ({ ...prevConfig, ...config })); // Объединяем конфиги
    setCurrentLevelId(levelId);
    setCurrentLevel(selectedLevel);
    
    const isFirstTime = !playerProgress.completedLevels.includes(levelId.toString());
    setIsFirstCompletion(isFirstTime);
    
    if (isFirstTime && selectedLevel) {
      const rewards = calculateLevelReward(selectedLevel);
      setCurrentRewards(rewards);
    } else {
      setCurrentRewards(null);
    }
    
    // ИЗМЕНЕНО: Логика выбора экрана
    if (config.language === 'keyboard-training') { // Предполагаем, что у тренировочной комнаты такой язык в конфиге
      setCurrentScreen('trainingRoom');
    } else {
      setCurrentScreen('playing');
    }
  };

  const handleReturnToMenu = () => {
    setPlayerProgress(getPlayerProgress());
    setCurrentScreen('levelSelect');
  };
  
  const handleOpenShop = () => {
    setCurrentScreen('shop');
  };
  
  const handleEquipmentPurchased = (updatedProgress: PlayerProgress) => {
    setPlayerProgress(updatedProgress);
  };
  
  // Load player progress from localStorage on component mount
  useEffect(() => {
    const progress = getPlayerProgress();
    setPlayerProgress(progress);
  }, []);
  
  // Mark current level as completed and award rewards when victory is achieved
  const handleLevelComplete = () => {
    if (currentLevelId !== null && currentLevel && !playerProgress.completedLevels.includes(currentLevelId.toString())) { // Changed: currentLevelId to currentLevelId.toString()
      // Use the pre-calculated rewards from handleLevelSelect
      if (currentRewards) {
        // Add rewards and update player progress
        const updatedProgress = addRewards(currentRewards.experience, currentRewards.gold);
        
        // Update completed levels
        // Ensure currentLevelId is not null before converting to string, already handled by the outer if
        const newCompletedLevels = [...updatedProgress.completedLevels, currentLevelId.toString()]; // Changed: currentLevelId to currentLevelId.toString()
        updatedProgress.completedLevels = newCompletedLevels;
        
        // Save and update state
        savePlayerProgress(updatedProgress);
        setPlayerProgress(updatedProgress);
      }
    }
  };

  // Render the appropriate screen based on currentScreen state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'playing':
        return (
          <GamePlay 
            config={gameConfig} 
            onRestart={handleRestart} 
            onReturnToMenu={handleReturnToMenu}
            onLevelComplete={handleLevelComplete}
            rewards={currentRewards || undefined}
            isFirstCompletion={isFirstCompletion}
            levelId={currentLevelId}
          />
        );
      case 'shop':
        return (
          <Shop 
            playerProgress={playerProgress}
            onReturnToMenu={handleReturnToMenu}
            onEquipmentPurchased={handleEquipmentPurchased}
          />
        );
      case 'trainingRoom': // ДОБАВЛЕНО: случай для тренировочной комнаты
        return (
          <TrainingRoom
            onReturnToMenu={handleReturnToMenu}
            config={gameConfig} // Передаем текущий gameConfig
          />
        );
      case 'levelSelect':
      default:
        return (
          <LevelSelect 
            onLevelSelect={handleLevelSelect} 
            completedLevels={playerProgress.completedLevels}
            playerProgress={playerProgress}
            onOpenShop={handleOpenShop}
          />
        );
    }
  };

  return renderScreen()
}

export default App
