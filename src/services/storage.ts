import type { GameSettings, PersistentStats } from '../types/game';

const STATS_KEY = 'dtr_stats_v2';
const SETTINGS_KEY = 'dtr_settings_v2';

const defaultStats: PersistentStats = {
  bestScore: 0,
  totalGames: 0,
  totalSurvivalMs: 0,
  totalCoins: 0,
  highestCombo: 0,
  bestDifficulty: 1,
  totalCollisions: 0,
  longestRunMs: 0,
};

const defaultSettings: GameSettings = {
  sound: true,
  music: false,
  screenShake: true,
  particles: true,
  reducedMotion: false,
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes; gameplay still works.
  }
}

export function loadStats(): PersistentStats {
  const stored = readJson<Partial<PersistentStats>>(STATS_KEY);
  return { ...defaultStats, ...stored };
}

export function saveStats(stats: PersistentStats) {
  writeJson(STATS_KEY, stats);
}

export function recordRun(result: {
  score: number;
  survivalMs: number;
  coins: number;
  bestCombo: number;
  difficulty: number;
  collisions: number;
}): PersistentStats {
  const current = loadStats();
  const next: PersistentStats = {
    bestScore: Math.max(current.bestScore, result.score),
    totalGames: current.totalGames + 1,
    totalSurvivalMs: current.totalSurvivalMs + result.survivalMs,
    totalCoins: current.totalCoins + result.coins,
    highestCombo: Math.max(current.highestCombo, result.bestCombo),
    bestDifficulty: Math.max(current.bestDifficulty, result.difficulty),
    totalCollisions: current.totalCollisions + result.collisions,
    longestRunMs: Math.max(current.longestRunMs, result.survivalMs),
  };
  saveStats(next);
  return next;
}

export function loadSettings(): GameSettings {
  const stored = readJson<Partial<GameSettings>>(SETTINGS_KEY);
  return { ...defaultSettings, ...stored };
}

export function saveSettings(settings: GameSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function resetStats() {
  saveStats(defaultStats);
}
