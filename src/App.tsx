import { useState } from 'react'
import './App.css'
import GamePlay, { GamePlayConfig, Language } from './components/GamePlay'
import LevelSelect from './components/LevelSelect'

const monsterImages = [
  '/src/image/IMG_0263.JPG',
  '/src/image/SVOyMINIOn.webp',
  '/src/image/photo_2023-04-21_13-34-14.jpg',
  '/src/image/photo_2024-12-19_14-46-01.jpg',
  '/src/image/photo_2025-02-03_22-51-27.jpg'
]

const backgroundImages = [
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (2).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (3).jpg',
  '/src/image/background/I_need_a_picture_of_a_beautiful_landscape_there_s_fe26500b_4270 (4).jpg'
]

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleLevelSelect = (config: GamePlayConfig) => {
    setGameConfig(config);
    setIsPlaying(true);
  };

  const handleReturnToMenu = () => {
    setIsPlaying(false);
  };

  return isPlaying ? (
    <GamePlay 
      config={gameConfig} 
      onRestart={handleRestart} 
      onReturnToMenu={handleReturnToMenu}
    />
  ) : (
    <LevelSelect onLevelSelect={handleLevelSelect} />
  )
}

export default App
