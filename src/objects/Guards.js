import GameObject from './GameObject.js';

/* Known issues
 * 1. Guards aren't affected by the time switch even when their period is not set to both.
 * 2. Guards won't jump if their jump isn't powerful enough to reach the  player, but they will still jump even if their path is 
 *    blocked by a ceiling.
 */

// Basic guard movement for PoC
export default class Guard_Generic extends GameObject {
  constructor(scene, x, y, visionSize, patrolRoute, timePeriod, texture) {
    super(scene, x, y, texture, { period: timePeriod, type: 'enemy' });
    this.setCollideWorldBounds(true);
    this.speed = 180;
    this.jumpForce = -500; // Jump height is height * (jumpforce/100) I think
    this.verticalChase = this.height * (this.jumpForce/100) + this.height; // The jump height for this character. Will only chase vertically if the player is within this range
    this.chaseRange = new Phaser.Geom.Ellipse(x, y, visionSize, visionSize); // This characters detection range.
    this.debugRing = scene.add.circle(x, y, visionSize/2, 0xfeed4f,0.25); // A debug visual to indicate the  detection range
    this.setPatrolRoute(patrolRoute);
  }

  moveLeft() {
    this.setVelocityX(-this.speed);
    this.setFlipX(true);
    this.fixVisionRing();
  }

  moveRight() {
    this.setVelocityX(this.speed);
    this.setFlipX(false);
    this.fixVisionRing();
  }

  stopMoving() {
    this.fixVisionRing();
    this.setVelocityX(0);
  }

  jump() {
    this.fixVisionRing();
    if (this.body.blocked.down) {
      this.setVelocityY(this.jumpForce);
      return true;
    }
    return false;
  }

  get isMidAir() {
    return !this.body.blocked.down;
  }

  /** Chase
   * This will chase the target object in a very primitive manner. It will jump if the target is within the jumping height. 
   * The target paramerter should generally a gameobject that can move as well, but the code will accept a dictionary of {x, y}.
   * Using a coordinate dictionary could theoretically be used for a form of pathfinding, but is not what the function is 
   * intended for.
   * @param target The target to chase. 
   * @returns No return value.
   */
  chase(target) {
      if (target.x + this.width/4 < this.x) {
        this.moveLeft();
      } else if (target.x - this.width/4 > this.x) {
        this.moveRight();
      } else {
        this.stopMoving();
      }

    if (target.y < this.y && target.y >= this.y + this.verticalChase && Math.abs(target.x - this.x) < Math.abs(this.verticalChase)) { //I.e. if the target is reachable with a jump
        this.jump();
    }
  }

  /** setPatrolRoute
   * Initializes a route for the this guard and resets it's phase to the beginning of the route.
   * @param route An indexable list of x,y dictionaries that contain the points in the patrol path.
   * An example of this parameter is [{ x: 100, y: 399 }, { x: 600, y: 271 }, {x:720, y: 399}]
   */
  setPatrolRoute(route) {
    this.patrolRoute = route;
    this.patrolPhase = 0;
  }

  /** patrol
   * Makes the guard follow the path contained in its .patrolRoute value by exploiting the chase function. I.e. the guard is
   * technically "chasing" a given point in the world. Whenever the guard reaches one of its destinations, it will increase
   * the phase of the patrol which will have it move on to the next location in the route. When the guard reaches the end of its
   * patrol route, it will follow it in reverse by calling the .reverse() method.
   */
  patrol() {
    let destination = this.patrolRoute[this.patrolPhase];
    //console.log(Phaser.Math.Distance.BetweenPoints(destination, this.body));
    if ((Phaser.Math.Distance.BetweenPoints(destination, this.body) > this.width) && (this.body.blocked.up == false) && destination.y >= this.y + this.verticalChase) {
      this.chase(destination);
    } else {
      if (this.patrolPhase == this.patrolRoute.length - 1) {
        this.patrolPhase = 0;
        this.patrolRoute.reverse();
      } else {
        this.patrolPhase += 1;
      }
    }
  }

  /** FixVisionRing
   * Moves the characters detection shape to the characters current location. Automatically called in the three movement
   * functions (moveLeft, moveRight, and jump).
   */
  fixVisionRing() {
    this.chaseRange.setPosition(this.x, this.y);
    this.debugRing.setPosition(this.x, this.y);
    this.debugRing.setDepth(this.depth-1);
  }
}

class Guard_Present extends Guard_Generic {
  constructor(scene, x, y, visionLength, patrolRoute) {
    super(scene, x, y, visionLength, patrolRoute, "present", "player");
  }
}

class Guard_Past extends Guard_Generic {
  constructor(scene, x, y, visionLength, patrolRoute) {
    super(scene, x, y, visionLength, patrolRoute, "past", "player");
  }
}