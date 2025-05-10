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
    progress.levelStats[currentLevelId] = { speed: playerSpeed, accuracy: playerAccuracy };
    if (!progress.completedLevels.includes(currentLevelId)) {
      progress.completedLevels.push(currentLevelId);
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