import { useState, useEffect } from 'react'
import './App.css'
import './components/GameContainer.css'
import GamePlay, { GamePlayConfig, Language } from './components/GamePlay'
import LevelSelect, { levels, Level } from './components/LevelSelect' // Убедимся, что levels и Level импортируются
import Shop from './components/Shop'
import { getPlayerProgress, savePlayerProgress, addRewards, calculateLevelReward, PlayerProgress, getInitialPlayerProgress } from './services/playerService' // Добавлен getInitialPlayerProgress
import TrainingRoom from './components/TrainingRoom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignUpForm from './components/Auth/SignUpForm';
import LoginForm from './components/Auth/LoginForm';
import AuthDetails from './components/Auth/AuthDetails';
import './components/Auth/Auth.css'; // Можно добавить, если нужны общие стили для .auth-container

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

// Этот компонент теперь содержит всю логику приложения
const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // Состояния из оригинального App компонента
  const [currentScreen, setCurrentScreen] = useState<'levelSelect' | 'playing' | 'shop' | 'trainingRoom'>('levelSelect');
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(getInitialPlayerProgress()); // Используем getInitialPlayerProgress для инициализации
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [currentRewards, setCurrentRewards] = useState<{ experience: number; gold: number } | null>(null);
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameConfig, setGameConfig] = useState<GamePlayConfig>(() => ({ // Явно указываем тип для gameConfig
    backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
    monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)],
    initialHealth: 150,
    healAmount: 5,
    regenerateAmount: 1,
    damageAmount: 4,
    healOnMistake: 5,
    language: 'en' as Language
  }));

  // Загрузка прогресса игрока
  useEffect(() => {
    const loadProgress = async () => {
      if (currentUser && currentUser.uid) { // Убедимся, что currentUser и currentUser.uid существуют
        try {
          // Используем await и передаем currentUser.uid
          const progress = await getPlayerProgress(currentUser.uid);
          setPlayerProgress(progress);
        } catch (error) {
          console.error("Ошибка загрузки прогресса игрока:", error);
          // В случае ошибки устанавливаем начальный прогресс
          setPlayerProgress(getInitialPlayerProgress());
        }
      } else if (!loading) { 
        // Если пользователь не вошел в систему (и загрузка завершена), устанавливаем начальный прогресс
        setPlayerProgress(getInitialPlayerProgress());
      }
    };

    loadProgress();
    // Добавляем loading в массив зависимостей, чтобы эффект перезапускался при изменении статуса загрузки
  }, [currentUser, loading]);


  const handleRestart = () => {
    setGameConfig(prev => ({
      ...prev,
      backgroundImage: backgroundImages[Math.floor(Math.random() * backgroundImages.length)],
      monsterImage: monsterImages[Math.floor(Math.random() * monsterImages.length)]
    }))
  }

  const handleLevelSelect = (config: GamePlayConfig, levelId: number) => {
    const selectedLevel = levels.find((level: Level) => level.id === levelId) || null; // Используем 'levels' и явно указываем тип для 'level'
    setGameConfig(prevConfig => ({ ...prevConfig, ...config }));
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
    
    if (config.language === 'keyboard-training') {
      setCurrentScreen('trainingRoom');
    } else {
      setCurrentScreen('playing');
    }
  };

  const handleReturnToMenu = () => {
    // TODO: Возможно, потребуется обновить playerProgress из Firebase, если были изменения
    // setPlayerProgress(getPlayerProgress()); // Пока что оставляем localStorage
    setCurrentScreen('levelSelect');
  };
  
  const handleOpenShop = () => {
    setCurrentScreen('shop');
  };
  
  const handleEquipmentPurchased = async (updatedProgress: PlayerProgress) => {
    setPlayerProgress(updatedProgress);
    // TODO: Сохранить updatedProgress в Firebase
    if (currentUser && currentUser.uid) {
      await savePlayerProgress(currentUser.uid, updatedProgress); // Пока что оставляем localStorage
    }
  };
  
  const handleLevelComplete = async () => {
    if (currentLevelId !== null && currentLevel && !playerProgress.completedLevels.includes(currentLevelId.toString())) {
      if (currentRewards && currentUser && currentUser.uid) {
        // TODO: addRewards должен будет работать с Firebase и быть асинхронным
        const updatedProgress = await addRewards(currentUser.uid, currentRewards.experience, currentRewards.gold);
        const newCompletedLevels = [...updatedProgress.completedLevels, currentLevelId.toString()];
        updatedProgress.completedLevels = newCompletedLevels;
        
        // TODO: Сохранить updatedProgress в Firebase
        await savePlayerProgress(currentUser.uid, updatedProgress);
        setPlayerProgress(updatedProgress);
      }
    }
  };

  if (loading) {
    return <div>Загрузка аутентификации...</div>;
  }

  if (!currentUser) {
    return (
      // Добавляем класс для возможной общей стилизации контейнера форм
      <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {showLogin ? (
          <>
            <LoginForm />
            <p>Нет аккаунта? <button className="auth-switch-button" onClick={() => setShowLogin(false)}>Зарегистрироваться</button></p>
          </>
        ) : (
          <>
            <SignUpForm />
            <p>Уже есть аккаунт? <button className="auth-switch-button" onClick={() => setShowLogin(true)}>Войти</button></p>
          </>
        )}
      </div>
    );
  }

  // Если пользователь вошел, показываем основное приложение
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
      case 'levelSelect':
      default:
        return (
          <div className="App">
            <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>CrazyTypes100</h1>
              {/* <AuthDetails />  УДАЛЕНО ОТСЮДА. Теперь будет в LevelSelect.tsx */}
            </header>
            <main>
              <LevelSelect 
                onLevelSelect={handleLevelSelect} 
                completedLevels={playerProgress.completedLevels}
                playerProgress={playerProgress}
                onOpenShop={handleOpenShop}
              />
            </main>
          </div>
        );
    }
  };

  if (currentScreen !== 'levelSelect') {
    return (
      <div className="App">
        <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>CrazyTypes100</h1>
          <AuthDetails /> {/* AuthDetails остается здесь для других экранов */}
           <nav>
             {/* <button onClick={() => setCurrentScreen('levelSelect')}>Меню уровней</button>  УДАЛЕНО */}
             {currentScreen !== 'trainingRoom' && <button onClick={() => setCurrentScreen('trainingRoom')}>Тренировка</button>}
             {currentScreen !== 'shop' && <button onClick={() => handleOpenShop()}>Магазин</button>}
           </nav>
        </header>
        <main>
          {renderScreen()}
        </main>
      </div>
    );
  }

  return renderScreen();
}

// Основной компонент App теперь только предоставляет AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
