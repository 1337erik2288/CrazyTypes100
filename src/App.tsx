import { useState, useEffect } from 'react'
import './App.css'
import './components/GameContainer.css'
import GamePlay from './components/GamePlay'; // Убрал Language, если он импортируется из types.ts
// Удаляем levels и Level из этого импорта
import LevelSelect from './components/LevelSelect'; 
import Shop from './components/Shop';
// import { getPlayerProgress, savePlayerProgress, addRewards, PlayerProgress } from './services/playerService'; // УДАЛЕНЫ savePlayerProgress, addRewards
import { getPlayerProgress, PlayerProgress } from './services/playerService'; 
import TrainingRoom from './components/TrainingRoom';
import { LevelConfig, ContentType, Language } from './types'; // Убедимся, что Language импортирован
import { russianLevels } from './data/russianLevels';
import { englishLevels } from './data/englishLevels';
import { codeLevels } from './data/codeLevels';
import { mathLevels } from './data/mathLevels';

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
  const [currentScreen, setCurrentScreen] = useState<'levelSelect' | 'playing' | 'shop' | 'trainingRoom' | 'trackLevels'>('levelSelect');
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(getPlayerProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  // const [currentRewards, setCurrentRewards] = useState<{ experience: number; gold: number } | null>(null); // <-- УДАЛЕНО, так как setCurrentRewards не используется
  const [currentRewards, ] = useState<{ experience: number; gold: number } | null>(null); // Если currentRewards все еще нужен, но без сеттера
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<ContentType | null>(null); // Добавляем состояние для отслеживания выбранного трека
  const [currentTrackLevels, setCurrentTrackLevels] = useState<LevelConfig[]>([]); 
  const [gameConfig, setGameConfig] = useState(() => ({
    backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)],
    initialHealth: 150, // Это значение по умолчанию для игрока, не монстра
    healAmount: 5,
    regenerateAmount: 1,
    damageAmount: 4, // Урон игрока
    healOnMistake: 5,
    language: 'en' as Language,
    contentType: ContentType.KeyCombos,
    timeLimit: 120,
    levelContent: [],
  }))

  const handleRestart = () => {
    setGameConfig(prev => ({
      ...prev,
      backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
      monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)]
    }))
  }

  // Эта функция будет вызываться при выборе уровня на экране трека
  const handleLevelSelect = (levelDetails: LevelConfig) => { 
    // Устанавливаем конфигурацию игры на основе выбранного уровня
    // Свойства из levelDetails перезапишут базовые в gameConfig
    setGameConfig(prevConfig => ({
      ...prevConfig,
      language: levelDetails.language !== undefined ? levelDetails.language : prevConfig.language,
      monsterHealth: levelDetails.monsterHealth, // Теперь берется напрямую из levelDetails
      monsterRegeneration: levelDetails.monsterRegeneration,
      monsterHealOnMistake: levelDetails.monsterHealOnMistake,
      damageAmount: levelDetails.damageAmount, // Урон монстра, если это свойство в LevelConfig
      backgroundImage: levelDetails.backgroundImage, // Изменено с 'background'
      monsterImage: levelDetails.monsterImage,
      contentType: levelDetails.contentType,
      // timeLimit и levelContent остаются, если они не в LevelConfig
    }));
    setCurrentLevelId(levelDetails.id);
    setCurrentLevel(levelDetails); 
    
    const isFirstTime = !playerProgress.completedLevels.includes(levelDetails.id.toString());
    setIsFirstCompletion(isFirstTime);
        
    // Используем contentType для определения, является ли это тренировочным уровнем
    if (levelDetails.contentType === ContentType.KeyCombos) { // Используем ContentType.KeyCombos
      setCurrentScreen('trainingRoom');
    } else {
      setCurrentScreen('playing');
    }
  };

  const handleTrackSelect = (track: ContentType) => {
    setSelectedTrack(track); // Устанавливаем выбранный трек
    let levelsForTrack: LevelConfig[] = [];
    switch (track) {
      case ContentType.RUSSIAN_TRACK:
        levelsForTrack = russianLevels;
        break;
      case ContentType.ENGLISH_TRACK:
        levelsForTrack = englishLevels;
        break;
      case ContentType.CODE_TRACK:
        levelsForTrack = codeLevels;
        break;
      case ContentType.MATH_TRACK:
        levelsForTrack = mathLevels;
        break;
      // Добавить другие треки, если необходимо
    }
    setCurrentTrackLevels(levelsForTrack);
    setCurrentScreen('trackLevels'); 
  };

  const handleReturnToMenu = () => {
    setPlayerProgress(getPlayerProgress());
    setCurrentScreen('levelSelect');
  };
  
  const handleOpenShop = () => { // Убедитесь, что эта функция определена
    setCurrentScreen('shop');
  };
  
  const handleEquipmentPurchased = (updatedProgress: PlayerProgress) => { // Убедитесь, что эта функция определена
    setPlayerProgress(updatedProgress);
  };
  
  // Load player progress from localStorage on component mount
  const handleLevelComplete = () => {
    if (currentLevelId !== null && currentLevel && !playerProgress.completedLevels.includes(currentLevelId.toString())) {
      // Логика наград будет здесь или передаваться в GamePlay
      // if (currentRewards) { ... }
    }
    // После завершения уровня возвращаемся к списку уровней текущего трека
    if (selectedTrack) {
      handleTrackSelect(selectedTrack); // Возвращаемся к выбранному треку
    } else {
      setCurrentScreen('levelSelect'); // Если трек не выбран, возвращаемся в общее меню
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'playing':
        return (
          <GamePlay 
            config={gameConfig} 
            onRestart={handleRestart} 
            // onReturnToMenu={handleReturnToMenu} // Удалено
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
            onEquipmentPurchased={handleEquipmentPurchased} // Убедимся, что эта функция определена
          />
        );
      case 'trainingRoom': 
        return (
          <TrainingRoom
            onReturnToMenu={handleReturnToMenu}
            config={gameConfig} 
          />
        );
      // Новый случай для отображения уровней трека (пока заглушка)
      case 'trackLevels':
        return (
          <LevelSelect 
            levelsToDisplay={currentTrackLevels} 
            onLevelSelect={handleLevelSelect}
            completedLevels={playerProgress.completedLevels}
            playerProgress={playerProgress}
            onOpenShop={handleOpenShop} // Убедимся, что эта функция определена
            onBackToTrackSelect={() => setCurrentScreen('levelSelect')} 
            // onTrackSelect не передаем, так как он не нужен здесь
          />
        );
      case 'levelSelect':
      default:
        return (
          <LevelSelect 
            onTrackSelect={handleTrackSelect}
            onLevelSelect={handleLevelSelect} 
            completedLevels={playerProgress.completedLevels}
            playerProgress={playerProgress}
            onOpenShop={handleOpenShop} // Убедимся, что эта функция определена
          />
        );
    }
  };

  return renderScreen();
}

export default App;
