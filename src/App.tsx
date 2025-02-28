import { useState, useEffect, useCallback } from 'react'
import './App.css'

interface Monster {
  health: number
  shape: string
  color: string
  isDefeated: boolean
}

type Language = 'en' | 'ru'

const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon']

function App() {
  const [currentWord, setCurrentWord] = useState('')
  const [userInput, setUserInput] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [showVictory, setShowVictory] = useState(false)
  const [monster, setMonster] = useState<Monster>(() => createNewMonster())

  function createNewMonster(): Monster {
    return {
      health: 100,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      isDefeated: false
    }
  }

  const words = {
    en: ['typescript', 'javascript', 'programming', 'developer',
      'monster', 'battle', 'keyboard', 'typing', 'speed',
      'practice', 'learning', 'coding', 'game', 'react',
      'computer', 'software', 'interface', 'database', 'network',
      'algorithm', 'function', 'variable', 'constant', 'module'
    ],
    ru: ['программа', 'разработка', 'компьютер', 'клавиатура',
      'монстр', 'битва', 'печать', 'скорость', 'практика',
      'обучение', 'код', 'игра', 'реакт', 'интерфейс',
      'база', 'сеть', 'алгоритм', 'функция', 'модуль',
      'константа', 'массив', 'строка', 'число', 'объект'
    ]
  }

  const generateNewWord = useCallback(() => {
    const wordList = words[language]
    const randomIndex = Math.floor(Math.random() * wordList.length)
    setCurrentWord(wordList[randomIndex])
    setUserInput('')
  }, [language])

  const restartGame = () => {
    setMonster(createNewMonster())
    setShowVictory(false)
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
        // Remove incorrect character after a short delay
        setTimeout(() => {
          setUserInput(value.slice(0, -1))
        }, 300)
        
        // Heal monster for incorrect character
        setMonster(prev => {
          const newHealth = Math.min(100, prev.health + 5)
          return { ...prev, health: newHealth }
        })
        return
      }
      
      // Damage monster for correct character
      setMonster(prev => {
        const newHealth = Math.max(0, prev.health - 4)
        const isDefeated = newHealth === 0
        if (isDefeated) setShowVictory(true)
        const monsterElement = document.querySelector('.monster')
        if (monsterElement) {
          monsterElement.classList.remove('damage-animation')
          void monsterElement.offsetWidth
          monsterElement.classList.add('damage-animation')
        }
        return { ...prev, health: newHealth, isDefeated }
      })
    }
    
    setUserInput(value)
    
    if (value === currentWord) {
      setTimeout(() => {
        generateNewWord()
      }, 500)
    }
  }

  const getCharacterClass = (wordChar: string, inputChar: string, index: number) => {
    if (index >= userInput.length) return ''
    return wordChar === inputChar ? 'correct' : 'incorrect'
  }

  return (
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
          <div className="health-fill" style={{ width: `${monster.health}%` }}></div>
        </div>
      </div>
      {showVictory ? (
        <div className="victory-screen">
          <h2>Victory!</h2>
          <p>You defeated the monster!</p>
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
  )
}

export default App
