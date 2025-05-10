export interface LevelResult {
  speed: number;
  accuracy: number;
  date: number;
}

export interface PlayerProgress {
  completedLevels: string[];
  levelStats: { [levelId: string]: LevelResult };
}