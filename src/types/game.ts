export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';
export type PowerUpKind = 'shield' | 'slow' | 'magnet' | 'ghost';
export type HazardType = 'orb' | 'block' | 'laser' | 'mine' | 'warning';
export type EventTone = 'good' | 'bad' | 'neutral';

export interface GameSettings {
  sound: boolean;
  music: boolean;
  screenShake: boolean;
  particles: boolean;
  reducedMotion: boolean;
}

export interface PersistentStats {
  bestScore: number;
  totalGames: number;
  totalSurvivalMs: number;
  totalCoins: number;
  highestCombo: number;
  bestDifficulty: number;
  totalCollisions: number;
  longestRunMs: number;
}

export interface GameSnapshot {
  phase: GamePhase;
  score: number;
  bestScore: number;
  combo: number;
  lives: number;
  speed: number;
  level: number;
  difficulty: number;
  powerUp: PowerUpKind | null;
  powerUpMs: number;
  coins: number;
  runMs: number;
  collisions: number;
  bestCombo: number;
  isNewBest: boolean;
  settings: GameSettings;
}

export interface GameCallbacks {
  onSnapshot: (snapshot: GameSnapshot) => void;
  onEvent: (message: string, tone?: EventTone) => void;
  onSettings: (settings: GameSettings) => void;
}

export interface RedObstacleConfig {
  lane: number;
  y: number;
  speed: number;
  type: HazardType;
  size: number;
}

export interface GeneratedWave {
  safeLane: number;
  obstacles: RedObstacleConfig[];
  coinLane: number | null;
  powerLane: number | null;
  powerType: PowerUpKind | null;
}
