import Phaser from 'phaser';

export class ParticleSystem {
  constructor(private readonly scene: Phaser.Scene, private readonly enabled: () => boolean) {}

  burst(x: number, y: number, color: number, quantity = 18) {
    if (!this.enabled()) return;
    for (let i = 0; i < quantity; i += 1) {
      const dot = this.scene.add.circle(x, y, Phaser.Math.FloatBetween(1.5, 3.5), color, 0.8);
      this.scene.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-80, 80),
        y: y + Phaser.Math.Between(-80, 80),
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(260, 520),
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  trail(x: number, y: number, color: number) {
    if (!this.enabled()) return;
    const dot = this.scene.add.circle(x, y, 2, color, 0.32);
    this.scene.tweens.add({
      targets: dot,
      y: y + 28,
      alpha: 0,
      duration: 260,
      onComplete: () => dot.destroy(),
    });
  }
}
