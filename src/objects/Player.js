import GameObject from './GameObject.js';

// Basic player movement for PoC
export default class Player extends GameObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'player', { period: 'both', type: 'player' });
    this.setCollideWorldBounds(true);
    this.speed = 140;
    this.jumpForce = -370;
  }

  moveLeft() {
    this.setVelocityX(-this.speed);
    this.setFlipX(true);
  }

  moveRight() {
    this.setVelocityX(this.speed);
    this.setFlipX(false);
  }

  stopMoving() {
    this.setVelocityX(0);
  }

  jump() {
    if (this.body.blocked.down) {
      this.setVelocityY(this.jumpForce);
      
      return true;
    }
    return false;
  }

  get isMidAir() {
    return !this.body.blocked.down;
  }
}
