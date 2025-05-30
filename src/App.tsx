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
  // const [selectedTrack, setSelectedTrack] = useState<ContentType | null>(null); // selectedTrack не используется напрямую
  const [currentTrackLevels, setCurrentTrackLevels] = useState<LevelConfig[]>([]); 
  const [gameConfig, setGameConfig] = useState(() => ({
    backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)],
    initialHealth: 150,
    healAmount: 5,
    regenerateAmount: 1,
    damageAmount: 4,
    healOnMistake: 5,
    language: 'en' as Language,
    // Добавим поля из LevelConfig, которые могут быть перезаписаны
    contentType: ContentType.KeyCombos, // Значение по умолчанию
    timeLimit: 120, // Значение по умолчанию
    levelContent: [], // Значение по умолчанию
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
      monsterHealth: levelDetails.monsterHealth,
      monsterRegeneration: levelDetails.monsterRegeneration,
      monsterHealOnMistake: levelDetails.monsterHealOnMistake,
      damageAmount: levelDetails.damageAmount,
      background: levelDetails.background,
      monsterImage: levelDetails.monsterImage,
      contentType: levelDetails.contentType,
      // timeLimit и levelContent не являются частью LevelConfig в текущей структуре.
      // Они будут взяты из prevConfig, если не будут добавлены в LevelConfig.
      // timeLimit: levelDetails.timeLimit || prevConfig.timeLimit, // Пример, если бы timeLimit был в LevelConfig
      // levelContent: levelDetails.levelContent || prevConfig.levelContent, // Пример
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
    // setSelectedTrack(track); // Можно удалить, если selectedTrack не используется для других целей
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
    if (currentLevelId !== null && currentLevel && !playerProgress.completedLevels.includes(currentLevelId.toString())) {
      // Логика наград будет здесь или передаваться в GamePlay
      // if (currentRewards) { ... }
    }
  };

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
            onOpenShop={handleOpenShop}
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
            onOpenShop={handleOpenShop}
          />
        );
    }
  };

  return renderScreen();
}

export default App;
