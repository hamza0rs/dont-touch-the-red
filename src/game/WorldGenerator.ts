import type { GameSettings, GeneratedWave, HazardType, PowerUpKind, RedObstacleConfig } from '../types/game';
import { DifficultyManager } from './DifficultyManager';

export class WorldGenerator {
  constructor(private readonly settings: () => GameSettings, private readonly difficulty: DifficultyManager) {}

  createWave(laneCount: number, laneX: number[], y: number): GeneratedWave {
    void laneX;
    const safeLane = Math.floor(Math.random() * laneCount);
    const typePool: HazardType[] = ['orb', 'block', 'laser', 'mine', 'warning'];
    const obstacles: RedObstacleConfig[] = [];
    const baseSpeed = this.difficulty.speed;
    const pattern = this.pattern();
    const maxCount = Math.min(laneCount - 1, this.difficulty.obstacleCount);
    const blocked = new Set<number>();

    const add = (lane: number, offset: number) => {
      if (lane < 0 || lane >= laneCount || lane === safeLane || blocked.has(lane)) return;
      blocked.add(lane);
      const type = typePool[Math.floor(Math.random() * typePool.length)];
      obstacles.push({
        lane,
        y: y - offset,
        speed: baseSpeed * (0.94 + Math.random() * 0.28),
        type,
        size: type === 'laser' ? 18 : type === 'warning' ? 22 : 17,
      });
    };

    if (pattern === 'single') {
      add((safeLane + 2) % laneCount, 0);
    } else if (pattern === 'double') {
      add((safeLane + 2) % laneCount, 0);
      add((safeLane + laneCount - 3) % laneCount, 18);
    } else if (pattern === 'triple') {
      add((safeLane + 1) % laneCount, 0);
      add((safeLane + 3) % laneCount, 22);
      add((safeLane + 5) % laneCount, 44);
    } else if (pattern === 'zigzag') {
      const direction = Math.random() < 0.5 ? 1 : -1;
      for (let i = 1; i <= Math.min(maxCount, 6); i += 1) add((safeLane + direction * (i + 1) + laneCount * 3) % laneCount, i * 22);
    } else if (pattern === 'alternating') {
      for (let lane = 0; lane < laneCount && blocked.size < maxCount; lane += 2) add(lane, (lane % 4) * 16);
    } else if (pattern === 'wall') {
      for (let lane = 0; lane < laneCount; lane += 1) add(lane, lane % 3 === 0 ? 28 : 0);
    } else if (pattern === 'cross') {
      add(safeLane - 2, 0);
      add(safeLane + 2, 0);
      add(safeLane - 1, 32);
      add(safeLane + 1, 32);
    } else {
      const lanes = Array.from({ length: laneCount }, (_, i) => i).filter((lane) => lane !== safeLane);
      this.shuffle(lanes);
      for (let i = 0; i < Math.min(maxCount, lanes.length); i += 1) add(lanes[i], (i % 3) * 18);
    }

    // Keep generation playable: if a dense pattern blocked too many lanes, trim hazards.
    while (obstacles.length > maxCount) obstacles.pop();

    const coinLane = Math.random() < this.difficulty.coinChance ? safeLane : null;
    const powerLane = Math.random() < this.difficulty.powerChance ? safeLane : null;
    const powerType: PowerUpKind | null = powerLane === null ? null : this.randomPower();

    return { safeLane, obstacles, coinLane, powerLane, powerType };
  }

  private pattern() {
    const patterns = ['single', 'double', 'triple', 'zigzag', 'alternating', 'wall', 'cross', 'random'] as const;
    const weights = [2, 3, 3, 4, 3, this.difficulty.difficulty > 5 ? 2 : 1, 2, 4];
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < patterns.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return patterns[i];
    }
    return 'random';
  }

  private randomPower(): PowerUpKind {
    const all: PowerUpKind[] = ['shield', 'slow', 'magnet', 'ghost'];
    return all[Math.floor(Math.random() * all.length)];
  }

  private shuffle(values: number[]) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
  }
}
