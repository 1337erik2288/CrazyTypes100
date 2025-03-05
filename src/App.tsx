import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Monster from './components/Monster'
import HealthBar from './components/HealthBar'
import Landscape from './components/Landscape'
import VictoryScreen from './components/VictoryScreen'
import TypingInterface from './components/TypingInterface'
import { getAdditionalWords } from './services/wordsService'

interface Monster {
  health: number
  imagePath: string
  isDefeated: boolean
}

interface GameStats {
  correctChars: number
  incorrectChars: number
  totalChars: number
  startTime: number
  endTime: number | null
}

type Language = 'en' | 'ru'

const monsterImages = [
  '/src/image/IMG_0263.JPG',
  '/src/image/SVOyMINIOn.webp',
  '/src/image/photo_2023-04-21_13-34-14.jpg',
  '/src/image/photo_2024-12-19_14-46-01.jpg',
  '/src/image/photo_2025-02-03_22-51-27.jpg'
]

function App() {
  const [currentWord, setCurrentWord] = useState('')
  const [userInput, setUserInput] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [showVictory, setShowVictory] = useState(false)
  const [monster, setMonster] = useState<Monster>(() => createNewMonster())
  const [gameStats, setGameStats] = useState<GameStats>(() => ({
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    startTime: Date.now(),
    endTime: null
  }))

  function createNewMonster(): Monster {
    return {
      health: 150,
      imagePath: monsterImages[Math.floor(Math.random() * monsterImages.length)],
      isDefeated: false
    }
  }

  const generateNewWord = useCallback(() => {
    getAdditionalWords(language).then(newWords => {
      if (newWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * newWords.length)
        const newWord = newWords[randomIndex]
        setCurrentWord(newWord)
        setUserInput('')
      }
    })
  }, [language])

  const restartGame = () => {
    setMonster(createNewMonster())
    setShowVictory(false)
    setGameStats({
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
      startTime: Date.now(),
      endTime: null
    })
    generateNewWord()
  }

  useEffect(() => {
    generateNewWord()
  }, []) // Remove generateNewWord from dependencies

  const toggleLanguage = async () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en')
    setUserInput('')
    setCurrentWord('')
    await getAdditionalWords(language === 'en' ? 'ru' : 'en').then(newWords => {
      if (newWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * newWords.length)
        const newWord = newWords[randomIndex]
        setCurrentWord(newWord)
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const lastCharIndex = value.length - 1
    
    if (lastCharIndex >= 0 && lastCharIndex < currentWord.length) {
      const isCorrect = value[lastCharIndex] === currentWord[lastCharIndex]
      
      if (!isCorrect) {
        setUserInput(value.slice(0, -1))
        
        setGameStats(prev => ({
          ...prev,
          incorrectChars: prev.incorrectChars + 1,
          totalChars: prev.totalChars + 1
        }))
        
        setMonster(prev => {
          const newHealth = Math.min(100, prev.health + 5)
          return { ...prev, health: newHealth }
        })
        return
      }
      
      setGameStats(prev => ({
        ...prev,
        correctChars: prev.correctChars + 1,
        totalChars: prev.totalChars + 1
      }))

      setMonster(prev => {
        const newHealth = Math.max(0, prev.health - 4)
        const isDefeated = newHealth === 0
        if (isDefeated) {
          setShowVictory(true)
          setGameStats(prev => ({ ...prev, endTime: Date.now() }))
        }
        const monsterElement = document.querySelector('.monster')
        if (monsterElement) {
          monsterElement.classList.remove('damage-animation')
          void monsterElement.offsetWidth
          monsterElement.classList.add('damage-animation')
        }
        return { ...prev, health: newHealth, isDefeated }
      })
      
      setUserInput(value)
      
      if (value === currentWord && !monster.isDefeated) {
        generateNewWord()
      }
    }
  }

  return (
    <>
      <Landscape />
      <div className="game-container">
        <div className="monster-container">
          <Monster 
            imagePath={monster.imagePath}
            isDefeated={monster.isDefeated}
          />
          <HealthBar 
            health={monster.health}
            canHeal={true}
            healAmount={5}
            canRegenerate={true}
            regenerateAmount={1}
            isDefeated={monster.isDefeated}
            onHealthChange={(newHealth) => setMonster(prev => ({ ...prev, health: newHealth }))}
          />
        </div>
        {showVictory ? (
          <VictoryScreen gameStats={gameStats} onRestart={restartGame} />
        ) : (
          <TypingInterface
            currentWord={currentWord}
            userInput={userInput}
            language={language}
            onInputChange={handleInputChange}
            onLanguageToggle={toggleLanguage}
          />
        )}
      </div>
    </>
  )
}

export default App
