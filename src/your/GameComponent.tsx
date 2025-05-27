import { getPlayerProgress, savePlayerProgress } from '../services/playerService';

interface GameComponentProps {
  currentLevelId: number;
  playerSpeed: number;
  playerAccuracy: number;
  onReturnToMenu: () => void;
}

const GameComponent: React.FC<GameComponentProps> = ({
  currentLevelId,
  playerSpeed,
  playerAccuracy,
  onReturnToMenu
}) => {
  // Function to handle exit and save stats
  const handleExitToMenu = () => {
    const progress = getPlayerProgress();
    if (!progress.levelStats) progress.levelStats = {};
    // Convert currentLevelId to string for object key and add date
    progress.levelStats[String(currentLevelId)] = { 
      speed: playerSpeed, 
      accuracy: playerAccuracy, 
      date: Date.now() // Add current timestamp for the date
    };
    // Convert currentLevelId to string before pushing to completedLevels
    if (!progress.completedLevels.includes(String(currentLevelId))) {
      progress.completedLevels.push(String(currentLevelId));
    }
    savePlayerProgress(progress);
    onReturnToMenu();
  };

  return (
    <button onClick={handleExitToMenu}>
      Return to Menu
    </button>
  );
};

export default GameComponent;