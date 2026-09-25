export class DifficultyManager {
  private score = 0;
  private survivalMs = 0;

  update(score: number, survivalMs: number) {
    this.score = score;
    this.survivalMs = survivalMs;
  }

  get difficulty() {
    return 1 + Math.min(20, Math.floor(this.score / 550) + Math.floor(this.survivalMs / 12000));
  }

  get speed() {
    return Math.min(1100, 360 + (this.difficulty - 1) * 32 + Math.min(140, this.survivalMs / 5000));
  }

  get spawnInterval() {
    return Math.max(280, 860 - (this.difficulty - 1) * 24);
  }

  get obstacleCount() {
    return Math.min(7, 1 + Math.floor(this.difficulty / 2));
  }

  get coinChance() {
    return Math.min(0.9, 0.62 + this.difficulty * 0.012);
  }

  get powerChance() {
    return Math.min(0.3, 0.09 + this.difficulty * 0.008);
  }
}
