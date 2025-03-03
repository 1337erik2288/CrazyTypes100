import { useState, useEffect, useCallback } from 'react'
import './App.css'

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
        // Remove incorrect character immediately
        setUserInput(value.slice(0, -1))
        
        // Update stats for incorrect character
        setGameStats(prev => ({
          ...prev,
          incorrectChars: prev.incorrectChars + 1,
          totalChars: prev.totalChars + 1
        }))
        
        // Heal monster for incorrect character
        setMonster(prev => {
          const newHealth = Math.min(100, prev.health + 5)
          return { ...prev, health: newHealth }
        })
        return
      }
      
      // Update stats for correct character
      setGameStats(prev => ({
        ...prev,
        correctChars: prev.correctChars + 1,
        totalChars: prev.totalChars + 1
      }))

      // Damage monster for correct character
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
      
      // Generate new word when current word is completed
      if (value === currentWord && !monster.isDefeated) {
        generateNewWord()
      }
    }
  }

  const getCharacterClass = (wordChar: string, inputChar: string, index: number) => {
    if (index >= userInput.length) return ''
    return wordChar === inputChar ? 'correct' : 'incorrect'
  }

  return (
    <>
      <div className="landscape">
        <div className="sun"></div>
        <div className="mountain mountain-1"></div>
        <div className="mountain mountain-2"></div>
        <div className="mountain mountain-3"></div>
        <div className="castle">
          <div className="castle-main">
            <div className="castle-top"></div>
            <div className="castle-window castle-window-1"></div>
            <div className="castle-window castle-window-2"></div>
            <div className="castle-window castle-window-3"></div>
            <div className="castle-window castle-window-4"></div>
            <div className="castle-door"></div>
            <div className="castle-tower castle-tower-left"></div>
            <div className="castle-tower castle-tower-right"></div>
          </div>
        </div>
        <div className="forest">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="tree" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
        <div className="ground"></div>
      </div>
      <div className="game-container">
        <div className="monster-container">
          <div className={`monster ${monster.isDefeated ? 'defeated' : ''}`}
            style={{ backgroundColor: monster.color, ...(monster.shape === 'circle' ? { borderRadius: '50%' } :
              monster.shape === 'triangle' ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } :
              monster.shape === 'pentagon' ? { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' } :
              monster.shape === 'hexagon' ? { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' } :
              { borderRadius: '0' }) }}>
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
          </div>
          <div className="health-bar">
          <div className="health-fill" style={{ 
            width: `${monster.health}%`,
            backgroundColor: `hsl(${Math.max(0, (monster.health * 1.2) - 120)}, 100%, 50%)`
          }}></div>
          </div>
        </div>
        {showVictory ? (
          <div className="victory-screen">
            <h2>Victory!</h2>
            <p>You defeated the monster!</p>
            <div className="stats">
              <p>Time: {((gameStats.endTime || Date.now()) - gameStats.startTime) / 1000} seconds</p>
              <p>Total characters: {gameStats.totalChars}</p>
              <p>Correct characters: {gameStats.correctChars}</p>
              <p>Mistakes: {gameStats.incorrectChars}</p>
              <p>Accuracy: {((gameStats.correctChars / gameStats.totalChars) * 100).toFixed(1)}%</p>
              <p>Speed: {Math.round((gameStats.totalChars / ((gameStats.endTime || Date.now()) - gameStats.startTime)) * 60000)} CPM</p>
            </div>
            <button onClick={restartGame}>Play Again</button>
          </div>
        ) : (
          <div className="typing-container">
            <div className="controls">
              <button onClick={toggleLanguage}>
                {language === 'en' ? 'Switch to Russian' : 'Switch to English'}
              </button>
            </div>
            <div className="word-display">
              {currentWord.split('').map((char, index) => (
                <span key={index} className={getCharacterClass(char, userInput[index], index)}>
                  {char}
                </span>
              ))}
            </div>
            <input type="text" value={userInput} onChange={handleInputChange} className="typing-input"
              placeholder={language === 'en' ? "Type the word..." : "Введите слово..."} autoFocus />
          </div>
        )}
      </div>
    </>
  )
}

export default App
