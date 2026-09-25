import Phaser from 'phaser';
import { RedObstacle } from './RedObstacle';
import { Coin } from './Coin';
import { PowerUp } from './PowerUp';

export class CollisionSystem {
  static hazard(player: Phaser.GameObjects.GameObject, hazard: RedObstacle) {
    return Phaser.Geom.Rectangle.Overlaps(player.getBounds(), hazard.getBounds());
  }

  static coin(player: Phaser.GameObjects.GameObject, coin: Coin) {
    return coin.intersects(player.getBounds());
  }

  static power(player: Phaser.GameObjects.GameObject, power: PowerUp) {
    return power.intersects(player.getBounds());
  }
}
