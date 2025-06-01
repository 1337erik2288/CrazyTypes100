import { useState, useEffect } from 'react'
import './App.css'
import './components/GameContainer.css'
import GamePlay from './components/GamePlay'; // Убрал Language, если он импортируется из types.ts
// Удаляем levels и Level из этого импорта
import LevelSelect from './components/LevelSelect'; 
import Shop from './components/Shop';
// import { getPlayerProgress, savePlayerProgress, addRewards, PlayerProgress } from './services/playerService'; // УДАЛЕНЫ savePlayerProgress, addRewards
import { getPlayerProgress, savePlayerProgress, addRewards, PlayerProgress } from './services/playerService'; // Раскомментированы savePlayerProgress и addRewards
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
  const [currentRewards, setCurrentRewards] = useState<{ experience: number; gold: number } | null>(null);
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
    setGameConfig(prevConfig => ({
      ...prevConfig,
      language: levelDetails.language !== undefined ? levelDetails.language : prevConfig.language,
      initialHealth: levelDetails.monsterHealth, // ИСПОЛЬЗУЕМ monsterHealth КАК initialHealth
      regenerateAmount: levelDetails.monsterRegeneration !== undefined ? levelDetails.monsterRegeneration : prevConfig.regenerateAmount,
      healOnMistake: levelDetails.monsterHealOnMistake, // Corrected property name
      damageAmount: levelDetails.damageAmount,
      backgroundImage: levelDetails.backgroundImage,
      monsterImage: levelDetails.monsterImage,
      contentType: levelDetails.contentType,
      difficulty: levelDetails.difficulty, // ПЕРЕДАЕМ СЛОЖНОСТЬ
    }));
    setCurrentLevelId(levelDetails.id);
    setCurrentLevel(levelDetails);

    const isFirstTime = !playerProgress.completedLevels.includes(levelDetails.id.toString());
    setIsFirstCompletion(isFirstTime);

    if (levelDetails.contentType === ContentType.KeyCombos) {
      setCurrentScreen('trainingRoom');
    } else {
      setCurrentScreen('playing');
    }
    setCurrentRewards({
      experience: levelDetails.experienceReward || 0,
      gold: levelDetails.goldReward || 0
    });
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
    let updatedProgress = playerProgress;
    if (currentLevelId !== null && currentLevel && isFirstCompletion && currentRewards) {
      // Начисляем награды только при первом прохождении и если они есть
      updatedProgress = addRewards(currentRewards.experience, currentRewards.gold);
      // Отмечаем уровень как пройденный (если это еще не сделано в progressService.saveLevelResult)
      // Если saveLevelResult уже добавляет ID в completedLevels, этот блок может быть не нужен
      // или его нужно будет синхронизировать с логикой progressService
      if (!updatedProgress.completedLevels.includes(currentLevelId.toString())) {
        updatedProgress.completedLevels.push(currentLevelId.toString());
      }
      savePlayerProgress(updatedProgress); // Сохраняем обновленный прогресс
      setPlayerProgress(updatedProgress); // Обновляем состояние
    } else {
      // Если не первое прохождение или нет наград, просто обновляем состояние из localStorage
      // на случай, если статистика уровня (скорость, точность) обновилась
      setPlayerProgress(getPlayerProgress());
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
            onOpenShop={handleOpenShop} // Убедитесь, что эта функция определена
          />
        );
    }
  };

  return renderScreen();
}

export default App;
