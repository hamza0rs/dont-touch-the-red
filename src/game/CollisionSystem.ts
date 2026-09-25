import Phaser from 'phaser';
import { RedObstacle } from './RedObstacle';
import { Coin } from './Coin';
import { PowerUp } from './PowerUp';

type BoundedGameObject = Phaser.GameObjects.GameObject & {
  getBounds(): Phaser.Geom.Rectangle;
};

export class CollisionSystem {
  static hazard(
    player: BoundedGameObject,
    hazard: RedObstacle,
  ): boolean {
    return Phaser.Geom.Rectangle.Overlaps(
      player.getBounds(),
      hazard.getBounds(),
    );
  }

  static coin(
    player: BoundedGameObject,
    coin: Coin,
  ): boolean {
    return coin.intersects(player.getBounds());
  }

  static power(
    player: BoundedGameObject,
    power: PowerUp,
  ): boolean {
    return power.intersects(player.getBounds());
  }
}