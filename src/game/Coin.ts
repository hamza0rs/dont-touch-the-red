import Phaser from 'phaser';

export class Coin {
  readonly lane: number;
  readonly root: Phaser.GameObjects.Container;
  private collected = false;
  private speed: number;

  constructor(scene: Phaser.Scene, lane: number, y: number, x: number, speed: number) {
    this.lane = lane;
    this.speed = speed;
    this.root = scene.add.container(x, y);
    const outer = scene.add.circle(0, 0, 12, 0xffd66b, 1);
    outer.setStrokeStyle(2, 0xfff5cf, 0.85);
    const inner = scene.add.circle(0, 0, 5, 0x16120b, 0.9);
    this.root.add([outer, inner]);
    this.root.setDepth(24);

    scene.tweens.add({
      targets: this.root,
      scale: { from: 0.88, to: 1.12 },
      alpha: { from: 0.75, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(deltaMs: number, speedFactor: number, playerX: number, magnetActive: boolean) {
    if (this.collected) return;
    const dt = deltaMs / 1000;
    const worldFactor = speedFactor;
    this.root.y += this.speed * worldFactor * dt;
    if (magnetActive) {
      const dx = playerX - this.root.x;
      if (Math.abs(dx) < 220) this.root.x += dx * Math.min(1, dt * 7);
    }
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
