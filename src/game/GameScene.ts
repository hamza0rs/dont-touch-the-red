import Phaser from 'phaser';
import type { GameCallbacks, GameSettings, GameSnapshot, PowerUpKind } from '../types/game';
import { loadSettings, recordRun } from '../services/storage';
import { AudioManager } from './AudioManager';
import { Coin } from './Coin';
import { CollisionSystem } from './CollisionSystem';
import { DifficultyManager } from './DifficultyManager';
import { ParticleSystem } from './ParticleSystem';
import { PowerUp } from './PowerUp';
import { RedObstacle } from './RedObstacle';
import { WorldGenerator } from './WorldGenerator';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
const LANES = 9;
const ROAD_TOP = 80;
const ROAD_BOTTOM = 485;
const ROAD_LEFT = 58;
const ROAD_RIGHT = GAME_WIDTH - 58;
const PLAYER_Y = 424;

export class GameScene extends Phaser.Scene {
  private callbacks!: GameCallbacks;
  private audio = new AudioManager();
  private difficulty = new DifficultyManager();
  private generator!: WorldGenerator;
  private particles!: ParticleSystem;

  private laneX: number[] = [];
  private laneSeparators: Phaser.GameObjects.Rectangle[] = [];
  private speedLines: Phaser.GameObjects.Rectangle[] = [];
  private stars: Phaser.GameObjects.Arc[] = [];

  private player!: Phaser.GameObjects.Container;
  private playerCore!: Phaser.GameObjects.Rectangle;
  private playerRing!: Phaser.GameObjects.Arc;

  private hazards: RedObstacle[] = [];
  private coins: Coin[] = [];
  private powers: PowerUp[] = [];

  private phase: GameSnapshot['phase'] = 'menu';
  private score = 0;
  private bestScore = 0;
  private combo = 0;
  private bestCombo = 0;
  private lives = 3;
  private runMs = 0;
  private coinsCollected = 0;
  private collisions = 0;
  private isNewBest = false;
  private runStartBest = 0;

  private laneIndex = 4;
  private spawnAccumulator = 0;
  private scoreAccumulator = 0;
  private invulnerableMs = 0;
  private powerUp: PowerUpKind | null = null;
  private powerUpMs = 0;
  private shieldHits = 0;
  private pointerStartX: number | null = null;
  private settings: GameSettings;
  private leftKey: Phaser.Input.Keyboard.Key | null = null;
  private rightKey: Phaser.Input.Keyboard.Key | null = null;
  private prevLeft = false;
  private prevRight = false;
  private keyRepeatMs = 0;
  private debugMode = false;
  private debugText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('GameScene');
    this.settings = loadSettings();
  }

  configure(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.settings = loadSettings();
  }

  create() {
    if (!this.callbacks) throw new Error('GameScene.configure() must be called before the scene starts.');
    this.bestScore = this.readBestScore();
    this.audio.setEnabled(this.settings.sound, this.settings.music);
    this.difficulty.update(0, 0);
    this.generator = new WorldGenerator(() => this.settings, this.difficulty);
    this.particles = new ParticleSystem(this, () => this.settings.particles && !this.settings.reducedMotion);

    this.buildWorld();
    this.buildPlayer();
    this.bindInput();
    this.bindKeyboard();
    this.createDebugOverlay();
    this.publish();
  }

  private buildWorld() {
    this.cameras.main.setBackgroundColor('#060810');
    this.laneX = Array.from({ length: LANES }, (_, lane) => ROAD_LEFT + ((ROAD_RIGHT - ROAD_LEFT) / (LANES - 1)) * lane);

    const bg = this.add.graphics();
    bg.fillStyle(0x060810, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x111a30, 0.5);
    bg.fillCircle(95, 110, 210);
    bg.fillStyle(0x27142f, 0.35);
    bg.fillCircle(850, 425, 230);

    const road = this.add.rectangle(GAME_WIDTH / 2, (ROAD_TOP + ROAD_BOTTOM) / 2, GAME_WIDTH - 32, ROAD_BOTTOM - ROAD_TOP, 0x0d1020, 1);
    road.setStrokeStyle(1, 0x2b3150, 1);

    for (let lane = 0; lane < LANES - 1; lane += 1) {
      const x = (this.laneX[lane] + this.laneX[lane + 1]) / 2;
      const divider = this.add.rectangle(x, (ROAD_TOP + ROAD_BOTTOM) / 2, 1, ROAD_BOTTOM - ROAD_TOP - 20, 0x303655, 0.85);
      this.laneSeparators.push(divider);
    }

    for (let i = 0; i < 28; i += 1) {
      const mark = this.add.rectangle(GAME_WIDTH / 2, ROAD_TOP + i * 15, GAME_WIDTH - 80, 2, 0x35405f, 0.3);
      this.speedLines.push(mark);
    }

    for (let i = 0; i < 65; i += 1) {
      const star = this.add.circle(Phaser.Math.Between(15, GAME_WIDTH - 15), Phaser.Math.Between(12, GAME_HEIGHT - 12), Phaser.Math.Between(1, 2), 0xffffff, Phaser.Math.FloatBetween(0.06, 0.26));
      this.stars.push(star);
    }

    this.add.rectangle(GAME_WIDTH / 2, ROAD_TOP, GAME_WIDTH - 32, 2, 0x475171, 0.9);
    this.add.rectangle(GAME_WIDTH / 2, ROAD_BOTTOM, GAME_WIDTH - 32, 2, 0x475171, 0.9);

    this.add.text(28, 22, "DON'T TOUCH THE RED", {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#f5f7ff',
    });
    this.add.text(30, 48, '9-LANE INFINITE REFLEX // RED = DANGER', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      letterSpacing: 2,
      color: '#6b748d',
    });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '← →   A / D   •   SWIPE   •   SURVIVE', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#5a637c',
    }).setOrigin(0.5);
  }

  private buildPlayer() {
    this.player = this.add.container(this.laneX[this.laneIndex], PLAYER_Y);
    this.player.setDepth(70);
    this.playerRing = this.add.circle(0, 0, 28, 0x48e5ff, 0.08);
    this.playerRing.setStrokeStyle(2, 0x48e5ff, 0.38);
    this.playerCore = this.add.rectangle(0, 0, 28, 28, 0x48e5ff, 1);
    this.playerCore.setStrokeStyle(2, 0xf6f7fb, 0.78);
    const eye = this.add.circle(6.5, -4.5, 2.5, 0x080b12, 1);
    const eye2 = this.add.circle(6.5, 4.5, 2.5, 0x080b12, 1);
    this.player.add([this.playerRing, this.playerCore, eye, eye2]);
  }

  private bindInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.phase !== 'playing') return;
      this.pointerStartX = pointer.worldX;
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.phase !== 'playing') return;
      const start = this.pointerStartX;
      this.pointerStartX = null;
      if (start === null) return;
      const dx = pointer.worldX - start;
      if (Math.abs(dx) > 22) this.changeLane(dx > 0 ? 1 : -1);
      else this.changeLane(pointer.worldX >= GAME_WIDTH / 2 ? 1 : -1);
    });
  }

  showMenu() {
    if (this.phase === 'playing' || this.phase === 'paused') {
      this.phase = 'gameover';
    }
    this.resetRun();
    this.phase = 'menu';
    this.publish();
  }

  startGame() {
    this.resetRun();
    this.runStartBest = this.bestScore;
    this.phase = 'playing';
    this.audio.start();
    this.spawnWave(true);
    this.emitEvent('GO. RED IS EVERYWHERE.', 'neutral');
    this.publish();
  }

  togglePause() {
    if (this.phase === 'playing') {
      this.phase = 'paused';
      this.tweens.pauseAll();
      this.emitEvent('PAUSED.', 'neutral');
    } else if (this.phase === 'paused') {
      this.phase = 'playing';
      this.tweens.resumeAll();
      this.emitEvent('BACK IN. MOVE.', 'neutral');
    }
    this.publish();
  }

  moveLeft() { this.changeLane(-1); }
  moveRight() { this.changeLane(1); }

  setSettings(settings: GameSettings) {
    this.settings = settings;
    this.audio.setEnabled(settings.sound, settings.music);
    this.callbacks.onSettings(settings);
    this.publish();
  }

  update(_time: number, delta: number) {
    this.handleKeyboard(delta);
    if (this.phase !== 'playing') {
      this.updateDebug();
      return;
    }
    const dt = Math.min(40, Math.max(8, delta));
    this.runMs += dt;
    this.spawnAccumulator += dt;
    this.scoreAccumulator += dt;
    this.invulnerableMs = Math.max(0, this.invulnerableMs - dt);
    this.powerUpMs = Math.max(0, this.powerUpMs - dt);

    if (this.powerUpMs <= 0) {
      this.powerUp = null;
    }

    this.difficulty.update(this.score, this.runMs);
    const worldFactor = this.powerUp === 'slow' ? 0.52 : 1;

    this.updateHazards(dt, worldFactor);
    this.updateCollectibles(dt, worldFactor);
    this.updateRoad(dt);
    this.updatePlayerFx();

    while (this.spawnAccumulator >= this.difficulty.spawnInterval) {
      this.spawnAccumulator -= this.difficulty.spawnInterval;
      this.spawnWave(false);
    }

    while (this.scoreAccumulator >= 100) {
      this.scoreAccumulator -= 100;
      this.score += 1 + Math.floor(this.difficulty.difficulty / 4);
      this.updateBest();
    }

    this.updateDebug();
    this.publish();
  }

  private bindKeyboard() {
    if (!this.input.keyboard) return;
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.input.keyboard.on('keydown-A', () => this.changeLane(-1));
    this.input.keyboard.on('keydown-D', () => this.changeLane(1));
    this.input.keyboard.on('keydown-F1', () => this.toggleDebug());
  }

  private handleKeyboard(delta: number) {
    if (this.phase !== 'playing' || (!this.leftKey && !this.rightKey)) return;
    const left = Boolean(this.leftKey?.isDown);
    const right = Boolean(this.rightKey?.isDown);
    this.keyRepeatMs -= delta;
    if (this.keyRepeatMs <= 0) {
      if (left && !this.prevLeft) { this.changeLane(-1); this.keyRepeatMs = 85; }
      else if (right && !this.prevRight) { this.changeLane(1); this.keyRepeatMs = 85; }
      else if (left && left !== right) { this.changeLane(-1); this.keyRepeatMs = 85; }
      else if (right && left !== right) { this.changeLane(1); this.keyRepeatMs = 85; }
    }
    this.prevLeft = left;
    this.prevRight = right;
  }

  private createDebugOverlay() {
    this.debugText = this.add.text(12, 76, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      fontSize: '10px',
      color: '#7ef9ff',
      backgroundColor: '#05070dcc',
      padding: { x: 8, y: 7 },
    }).setDepth(100).setVisible(false);
  }

  private toggleDebug() {
    this.debugMode = !this.debugMode;
    this.debugText?.setVisible(this.debugMode);
    this.updateDebug();
  }

  private updateDebug() {
    if (!this.debugMode || !this.debugText) return;
    this.debugText.setText([
      `FPS ${Math.round(this.game.loop.actualFps || 0)}`,
      `phase ${this.phase}`,
      `player lane ${this.laneIndex} x=${Math.round(this.player.x)} y=${Math.round(this.player.y)}`,
      `red obstacles ${this.hazards.length}`,
      `speed ${Math.round(this.difficulty.speed)}`,
      `difficulty ${this.difficulty.difficulty}`,
      `run ${(this.runMs / 1000).toFixed(1)}s`,
    ]);
  }

  private updateHazards(delta: number, speedFactor: number) {
    const playerBounds = this.player.getBounds();
    for (const hazard of this.hazards) {
      // Every obstacle has its own speed and position and is updated on every frame.
      hazard.update(delta, speedFactor);
      if (this.invulnerableMs <= 0 && CollisionSystem.hazard(this.player, hazard)) {
        this.takeHit(hazard);
        if (this.phase === 'gameover') break;
      }
    }

    this.hazards = this.hazards.filter((hazard) => {
      if (!hazard.root.active || hazard.root.y > GAME_HEIGHT + 90) {
        hazard.destroy();
        return false;
      }
      return true;
    });

    void playerBounds;
  }

  private updateCollectibles(delta: number, speedFactor: number) {
    const magnet = this.powerUp === 'magnet';
    for (const coin of this.coins) {
      coin.update(delta, speedFactor, this.player.x, magnet);
      if (CollisionSystem.coin(this.player, coin)) {
        this.collectCoin(coin);
      }
    }
    this.coins = this.coins.filter((coin) => !coin.isOffscreen(GAME_HEIGHT));

    for (const power of this.powers) {
      power.update(delta, speedFactor);
      if (CollisionSystem.power(this.player, power)) this.collectPower(power);
    }
    this.powers = this.powers.filter((power) => !power.isOffscreen(GAME_HEIGHT));
  }

  private updateRoad(delta: number) {
    const factor = this.settings.reducedMotion ? 0.45 : 1;
    const lineSpeed = this.difficulty.speed * factor;
    for (const line of this.speedLines) {
      line.y += lineSpeed * (delta / 1000);
      if (line.y > ROAD_BOTTOM) line.y = ROAD_TOP;
    }
    for (const star of this.stars) {
      star.y += (12 + this.difficulty.difficulty * 0.7) * (delta / 1000) * factor;
      if (star.y > GAME_HEIGHT + 5) star.y = -5;
    }
  }

  private changeLane(direction: number) {
    if (this.phase !== 'playing') return;
    const next = Phaser.Math.Clamp(this.laneIndex + direction, 0, LANES - 1);
    if (next === this.laneIndex) return;
    this.laneIndex = next;
    const targetX = this.laneX[next];
    this.player.x = targetX;
    this.playerCore.setScale(1.16, 0.82);
    this.tweens.add({ targets: this.playerCore, scaleX: 1, scaleY: 1, duration: 68, ease: 'Quad.easeOut' });
    this.audio.move();
  }

  private spawnWave(initial: boolean) {
    const wave = this.generator.createWave(LANES, this.laneX, initial ? ROAD_TOP - 24 : ROAD_TOP - 28);
    for (const obstacle of wave.obstacles) {
      this.hazards.push(new RedObstacle(this, this.hazards.length + 1, obstacle, this.laneX[obstacle.lane]));
    }
    if (wave.coinLane !== null) {
      this.coins.push(new Coin(this, wave.coinLane, ROAD_TOP - 42, this.laneX[wave.coinLane], this.difficulty.speed * 0.97));
    }
    if (wave.powerLane !== null && wave.powerType) {
      this.powers.push(new PowerUp(this, wave.powerLane, ROAD_TOP - 180, this.laneX[wave.powerLane], this.difficulty.speed * 0.9, wave.powerType));
    }

    if (!initial && Math.random() < 0.17) {
      const lines = [
        'THE RED IS WATCHING 👁️',
        'FASTER. FASTER. FASTER.',
        'YOU HAVE 9 LANES. USE THEM.',
        'SUSPICIOUSLY ALIVE.',
        'YOUR REFLEXES HAVE ENTERED THE CHAT.',
        'DO NOT PANIC. ACTUALLY, PANIC A LITTLE.',
      ];
      this.emitEvent(lines[Math.floor(Math.random() * lines.length)], 'neutral');
    }
  }

  private takeHit(hazard: RedObstacle) {
    hazard.destroy();
    this.collisions += 1;

    if (this.powerUp === 'shield' && this.shieldHits > 0) {
      this.shieldHits -= 1;
      this.invulnerableMs = 650;
      this.emitEvent('SHIELD SAVED YOU 🛡️', 'good');
      this.particles.burst(this.player.x, this.player.y, 0x48e5ff, 24);
      this.audio.power();
      return;
    }

    this.lives -= 1;
    this.combo = 0;
    this.invulnerableMs = 1000;
    this.audio.hit();
    if (this.settings.screenShake && !this.settings.reducedMotion) this.cameras.main.shake(180, 0.008);
    this.particles.burst(this.player.x, this.player.y, 0xff375f, 28);

    if (this.lives <= 0) {
      this.endGame();
      return;
    }
    this.emitEvent(this.lives === 1 ? 'ONE LIFE LEFT. LOCK IN.' : `${this.lives} LIVES LEFT. KEEP MOVING.`, 'bad');
  }

  private collectCoin(coin: Coin) {
    coin.collect();
    this.coinsCollected += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const multiplier = 1 + Math.min(6, Math.floor(this.combo / 4));
    this.score += 12 * multiplier;
    this.updateBest();
    this.particles.burst(coin.root.x, coin.root.y, 0xffd66b, 14);
    this.audio.coin();
    if (this.combo >= 5 && this.combo % 5 === 0) this.audio.combo();
    this.emitEvent(this.combo >= 10 ? `COMBO x${this.combo} 🔥` : '+ COIN', 'good');
  }

  private collectPower(power: PowerUp) {
    const kind = power.kind;
    power.collect();
    this.powerUp = kind;
    this.powerUpMs = ({ shield: 6000, slow: 5000, magnet: 6000, ghost: 4000 })[kind];
    this.shieldHits = kind === 'shield' ? 1 : 0;
    if (kind === 'ghost') this.invulnerableMs = this.powerUpMs;
    this.particles.burst(this.player.x, this.player.y, this.powerColor(kind), 30);
    this.audio.power();
    this.emitEvent(`${kind.toUpperCase()} ACTIVATED`, 'good');
  }

  private updatePlayerFx() {
    const inv = this.invulnerableMs > 0 || this.powerUp === 'ghost';
    if (inv && !this.settings.reducedMotion) {
      this.player.alpha = Math.sin(performance.now() * 0.022) > 0 ? 0.32 : 1;
    } else {
      this.player.alpha = 1;
    }
    const ringColor = this.powerUp ? this.powerColor(this.powerUp) : 0x48e5ff;
    this.playerRing.setStrokeStyle(this.powerUp ? 3 : 2, ringColor, this.powerUp ? 0.8 : 0.36);

    if (this.phase === 'playing') this.particles.trail(this.player.x, this.player.y + 18, 0x48e5ff);
  }

  private powerColor(kind: PowerUpKind) {
    return ({ shield: 0x48e5ff, slow: 0xb27aff, magnet: 0xffd66b, ghost: 0x57ff9b })[kind];
  }

  private endGame() {
    if (this.phase === 'gameover') return;
    this.phase = 'gameover';
    this.player.setVisible(false);
    this.audio.gameOver();
    const previousBest = this.runStartBest;
    const stats = recordRun({
      score: this.score,
      survivalMs: this.runMs,
      coins: this.coinsCollected,
      bestCombo: this.bestCombo,
      difficulty: this.difficulty.difficulty,
      collisions: this.collisions,
    });
    this.bestScore = stats.bestScore;
    this.isNewBest = this.score > previousBest;
    if (this.isNewBest) {
      this.audio.record();
      this.emitEvent('NEW PERSONAL RECORD 🏆', 'good');
    }
    this.hazards.forEach((item) => item.destroy());
    this.coins.forEach((item) => item.root.destroy());
    this.powers.forEach((item) => item.root.destroy());
    this.hazards = [];
    this.coins = [];
    this.powers = [];
    this.publish();
  }

  private resetRun() {
    this.hazards.forEach((item) => item.destroy());
    this.coins.forEach((item) => item.root.destroy());
    this.powers.forEach((item) => item.root.destroy());
    this.hazards = [];
    this.coins = [];
    this.powers = [];
    this.phase = 'menu';
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.lives = 3;
    this.runMs = 0;
    this.coinsCollected = 0;
    this.collisions = 0;
    this.isNewBest = false;
    this.laneIndex = Math.floor(LANES / 2);
    this.spawnAccumulator = 0;
    this.scoreAccumulator = 0;
    this.invulnerableMs = 0;
    this.powerUp = null;
    this.powerUpMs = 0;
    this.shieldHits = 0;
    this.player.alpha = 1;
    this.player.setVisible(true);
    this.player.setPosition(this.laneX[this.laneIndex], PLAYER_Y);
    this.difficulty.update(0, 0);
  }

  private readBestScore() {
    try {
      return Number(localStorage.getItem('dtr_best_score_compat') ?? localStorage.getItem('dtr-best') ?? 0);
    } catch {
      return 0;
    }
  }

  private updateBest() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      try { localStorage.setItem('dtr_best_score_compat', String(this.bestScore)); } catch { /* ignore */ }
    }
  }

  private emitEvent(message: string, tone: 'good' | 'bad' | 'neutral' = 'neutral') {
    this.callbacks.onEvent(message, tone);
  }

  private publish() {
    this.callbacks.onSnapshot(this.snapshot());
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      score: this.score,
      bestScore: this.bestScore,
      combo: this.combo,
      lives: this.lives,
      speed: Math.round(this.difficulty.speed),
      level: this.difficulty.difficulty,
      difficulty: this.difficulty.difficulty,
      powerUp: this.powerUp,
      powerUpMs: Math.max(0, Math.round(this.powerUpMs)),
      coins: this.coinsCollected,
      runMs: Math.round(this.runMs),
      collisions: this.collisions,
      bestCombo: this.bestCombo,
      isNewBest: this.isNewBest,
      settings: this.settings,
    };
  }

  shutdown() {
    this.input.removeAllListeners();
    this.input.keyboard?.removeAllListeners();
    this.audio.destroy();
  }
}
