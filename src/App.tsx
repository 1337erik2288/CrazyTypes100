import { useState } from 'react'
import './App.css'
import GamePlay from './components/GamePlay'

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
  const [gameConfig, setGameConfig] = useState(() => ({
    backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)],
    initialHealth: 150,
    healAmount: 5,
    regenerateAmount: 1,
    damageAmount: 4,
    healOnMistake: 5,
    language: 'en' as const
  }))

  const handleRestart = () => {
    setGameConfig(prev => ({
      ...prev,
      backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
      monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)]
    }))
  }

  return <GamePlay config={gameConfig} onRestart={handleRestart} />
}

export default App
