import Phaser from 'phaser';
import type { HazardType, RedObstacleConfig } from '../types/game';

export class RedObstacle {
  readonly id: number;
  readonly lane: number;
  readonly type: HazardType;
  readonly speed: number;
  readonly size: number;
  readonly root: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Shape;

  constructor(scene: Phaser.Scene, id: number, config: RedObstacleConfig, x: number) {
    this.id = id;
    this.lane = config.lane;
    this.type = config.type;
    this.speed = config.speed;
    this.size = config.size;
    this.root = scene.add.container(x, config.y);
    this.body = this.createBody(scene, config.type, config.size);
    this.root.add(this.body);
    this.root.setDepth(30);

    const glow = scene.add.circle(0, 0, config.size * 0.8, 0xff375f, 0.08);
    glow.setName(`hazard-glow-${id}`);
    this.root.addAt(glow, 0);

    scene.tweens.add({
      targets: this.body,
      alpha: { from: 0.78, to: 1 },
      scale: { from: 0.92, to: 1.08 },
      duration: 130 + (id % 5) * 20,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBody(scene: Phaser.Scene, type: HazardType, size: number): Phaser.GameObjects.Shape {
    if (type === 'orb') {
      const circle = scene.add.circle(0, 0, size, 0xff375f, 1);
      circle.setStrokeStyle(3, 0xffc1cd, 0.7);
      return circle;
    }

    if (type === 'laser') {
      const rect = scene.add.rectangle(0, 0, size * 2.4, Math.max(10, size * 0.45), 0xff375f, 1);
      rect.setStrokeStyle(2, 0xffecf0, 0.65);
      return rect;
    }

    if (type === 'mine') {
      const star = scene.add.star(0, 0, 6, size * 0.62, size, 0xff375f, 1);
      star.setStrokeStyle(2, 0xffb8c5, 0.7);
      return star;
    }

    if (type === 'warning') {
      const rect = scene.add.rectangle(0, 0, size * 2.2, size * 1.2, 0xff375f, 0.48);
      rect.setStrokeStyle(3, 0xff879aab, 0.65);
      return rect;
    }

    const block = scene.add.rectangle(0, 0, size * 1.55, size * 1.55, 0xff375f, 1);
    block.setStrokeStyle(3, 0xffd7df, 0.62);
    return block;
  }

  update(deltaMs: number, speedFactor: number) {
    this.root.y += this.speed * speedFactor * (deltaMs / 1000);
    this.root.rotation += this.type === 'mine' ? 0.006 * deltaMs : 0;
  }

  getBounds() {
    return this.root.getBounds();
  }

  destroy() {
    this.root.destroy();
  }
}
