import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Monster from './components/Monster'
import HealthBar from './components/HealthBar'
import Landscape from './components/Landscape'
import VictoryScreen from './components/VictoryScreen'
import TypingInterface from './components/TypingInterface'

interface Monster {
  health: number
  shape: string
  color: string
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

const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon']

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
      health: 100,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      isDefeated: false
    }
  }

  const words = {
    en: [
        'typescript', 'javascript', 'programming', 'developer',
        'monster', 'battle', 'keyboard', 'typing', 'speed',
        'practice', 'learning', 'coding', 'game', 'react',
        'computer', 'software', 'interface', 'database', 'network',
        'algorithm', 'function', 'variable', 'constant', 'module',
        'debugging', 'framework', 'repository', 'version', 
        'syntax', 'compiler', 'editor', 'client', 'server',
        'application', 'deployment', 'testing', 'performance',
        'automation', 'architecture', 'cloud', 'security'
    ],
    ru: [
        'программа', 'разработка', 'компьютер', 'клавиатура',
        'монстр', 'битва', 'печать', 'скорость', 'практика',
        'обучение', 'код', 'игра', 'реакт', 'интерфейс',
        'база', 'сеть', 'алгоритм', 'функция', 'модуль',
        'константа', 'массив', 'строка', 'число', 'объект',
        'отладка', 'фреймворк', 'репозиторий', 'версия',
        'синтаксис', 'компилятор', 'редактор', 'клиент', 
        'сервер', 'приложение', 'развертывание', 'тестирование',
        'производительность', 'автоматизация', 'архитектура',
        'облако', 'безопасность'
    ]
};

  const generateNewWord = useCallback(() => {
    const wordList = words[language]
    const randomIndex = Math.floor(Math.random() * wordList.length)
    const newWord = wordList[randomIndex]
    setCurrentWord(newWord)
    setUserInput('')
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
  }, [generateNewWord])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en')
    generateNewWord()
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
            shape={monster.shape}
            color={monster.color}
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
