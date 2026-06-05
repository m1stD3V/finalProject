import GameObject from './GameObject.js';

export default class Guard_Generic extends GameObject {
  constructor(scene, x, y, visionSize, patrolRoute, timePeriod, texture) {
    super(scene, x, y, texture, { period: timePeriod, type: 'enemy' });
    this.setCollideWorldBounds(true);
    this.speed = 60;
    this.jumpForce = -400;
    // Trim hitbox to visible character; offset aligns it bottom-center in the 24x32 frame
    this.body.setSize(14, 26, false);
    this.body.setOffset(5, 6);
    // Negative value: how many px above this guard it can jump to reach a target
    this.verticalReach = this.height * (Math.abs(this.jumpForce) / 100) - this.height;
    this.chaseRange = new Phaser.Geom.Ellipse(x, y, visionSize, visionSize);
    this.debugRing = scene.add.circle(x, y, visionSize / 2, 0xfeed4f, 0.25);
    this.patroling = true;
    this.cooldownTimer = null;
    this.setPatrolRoute(patrolRoute);
  }

  moveLeft() {
    this.setVelocityX(-this.speed);
    this.setFlipX(true);
    this.play('guard_walk', true);
    this.fixVisionRing();
  }

  moveRight() {
    this.setVelocityX(this.speed);
    this.setFlipX(false);
    this.play('guard_walk', true);
    this.fixVisionRing();
  }

  stopMoving() {
    this.setVelocityX(0);
    this.play('guard_idle', true);
    this.fixVisionRing();
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

  /** Move toward target; jump if target is above and within vertical reach. */
  chase(target) {
    this.fixVisionRing();

    if (target.x + this.width / 4 < this.x) {
      this.moveLeft();
    } else if (target.x - this.width / 4 > this.x) {
      this.moveRight();
    } else {
      this.stopMoving();
    }

    // Jump if target is above us and close enough to reach
    const aboveUs = target.y < this.y;
    const withinJumpHeight = (this.y - target.y) <= this.verticalReach;
    const closeEnoughX = Math.abs(target.x - this.x) <= this.verticalReach;
    if (aboveUs && withinJumpHeight && closeEnoughX && this.body.blocked.down) {
      this.jump();
    }
  }

  setPatrolRoute(route) {
    this.patrolRoute = route;
    this.patrolPhase = 0;
    this.patrolDir = 1;
  }

  /**
   * Walk between waypoints. Uses horizontal distance only so guards don't
   * get stuck trying to match a Y coordinate they can never reach on foot.
   * Direction bounces at both ends without mutating the route array.
   */
  patrol() {
    const destination = this.patrolRoute[this.patrolPhase];
    const distX = Math.abs(destination.x - this.x);

    if (distX <= this.width) {
      this.patrolPhase += this.patrolDir;
      if (this.patrolPhase < 0 || this.patrolPhase >= this.patrolRoute.length) {
        this.patrolDir *= -1;
        this.patrolPhase += this.patrolDir * 2;
      }
    } else {
      this.chase(destination);
    }
  }

  fixVisionRing() {
    this.chaseRange.setPosition(this.x, this.y);
    this.debugRing.setPosition(this.x, this.y);
    this.debugRing.setDepth(this.depth - 1);
  }
}

export class Guard_Present extends Guard_Generic {
  constructor(scene, x, y, visionLength, patrolRoute) {
    super(scene, x, y, visionLength, patrolRoute, 'present', 'clanker');
  }
}

export class Guard_Past extends Guard_Generic {
  constructor(scene, x, y, visionLength, patrolRoute) {
    super(scene, x, y, visionLength, patrolRoute, 'past', 'clanker');
  }
}
