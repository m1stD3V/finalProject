import GameObject from './GameObject.js';

// Basic player movement for PoC
export default class Player extends GameObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'player', { period: 'both', type: 'player' });
    this.setCollideWorldBounds(true);
    this.speed = 140;
    this.jumpForce = -370;
    // Trim hitbox to visible character; offset aligns it bottom-center in the 20x32 frame
    this.body.setSize(10, 26, false);
    this.body.setOffset(5, 6);
    // Cap vertical velocity to stay under one tile (16px) per frame at 30fps, preventing floor tunneling
    this.body.setMaxVelocity(10000, 450);
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
