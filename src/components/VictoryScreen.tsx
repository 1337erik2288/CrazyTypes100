import React from 'react';

interface GameStats {
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number;
  endTime: number | null;
}

interface VictoryScreenProps {
  gameStats: GameStats;
  onRestart: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ gameStats, onRestart }) => {
  return (
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
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
};

export default VictoryScreen;