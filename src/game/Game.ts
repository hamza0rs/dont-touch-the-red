import Phaser from 'phaser';
import { GameScene, GAME_HEIGHT, GAME_WIDTH } from './GameScene';
import type { GameCallbacks, GameSettings } from '../types/game';

export class Game {
  private readonly scene: GameScene;
  private readonly instance: Phaser.Game;

  constructor(parent: HTMLElement, callbacks: GameCallbacks) {
    this.scene = new GameScene();
    this.scene.configure(callbacks);
    this.instance = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent,
      backgroundColor: '#060810',
      scene: this.scene,
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      input: {
        activePointers: 2,
      },
    });
  }

  start() { this.scene.startGame(); }
  menu() { this.scene.showMenu(); }
  pause() { this.scene.togglePause(); }
  moveLeft() { this.scene.moveLeft(); }
  moveRight() { this.scene.moveRight(); }
  setSettings(settings: GameSettings) { this.scene.setSettings(settings); }

  destroy() {
    this.scene.shutdown();
    this.instance.destroy(true);
  }
}
