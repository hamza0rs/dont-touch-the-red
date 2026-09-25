import Phaser from 'phaser';
import type { PowerUpKind } from '../types/game';

export class PowerUp {
  readonly lane: number;
  readonly kind: PowerUpKind;
  readonly root: Phaser.GameObjects.Container;
  private speed: number;
  private collected = false;

  constructor(scene: Phaser.Scene, lane: number, y: number, x: number, speed: number, kind: PowerUpKind) {
    this.lane = lane;
    this.kind = kind;
    this.speed = speed;
    this.root = scene.add.container(x, y);
    const color = this.color(kind);
    const aura = scene.add.circle(0, 0, 18, color, 0.11);
    const star = scene.add.star(0, 0, 5, 8, 16, color, 1);
    star.setStrokeStyle(2, 0xffffff, 0.62);
    const label = scene.add.text(0, 0, this.icon(kind), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#080b12',
    }).setOrigin(0.5);
    this.root.add([aura, star, label]);
    this.root.setDepth(25);

    scene.tweens.add({
      targets: this.root,
      scale: { from: 0.9, to: 1.14 },
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private color(kind: PowerUpKind) {
    return ({ shield: 0x48e5ff, slow: 0xb27aff, magnet: 0xffd66b, ghost: 0x57ff9b })[kind];
  }

  private icon(kind: PowerUpKind) {
    return ({ shield: 'S', slow: 'T', magnet: 'M', ghost: 'G' })[kind];
  }

  update(deltaMs: number, speedFactor: number) {
    this.root.y += this.speed * speedFactor * (deltaMs / 1000);
  }

  intersects(bounds: Phaser.Geom.Rectangle) {
    return Phaser.Geom.Rectangle.Overlaps(this.root.getBounds(), bounds);
  }

  collect() {
    this.collected = true;
    this.root.destroy();
  }

  isOffscreen(height: number) {
    return this.root.y > height + 80 || !this.root.active;
  }
}
