import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';
import { Guard_Present, Guard_Past } from '../objects/Guards.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const map = this.make.tilemap({ key: 'level0', tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage('castle0', 'tiles');

    this.bgLayer = map.createLayer('bg', tileset, 0, 0);
    // 'main' is the sole collision layer. When the Tiled map gains separate
    // 'past' and 'present' layers, add a second createLayer call here and
    // toggle visibility/colliders in switchTimePeriod().
    this.mainLayer = map.createLayer('main', tileset, 0, 0);

    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, 400, 224);
    this.physics.world.setBounds(0, 0, 400, 224);

    this.timePeriod = 'past';
    this.level = LEVELS[0];
    this.guards = [];
    this.characters = this.add.group();

    this.createPlayer();

    // Create Player Objective
    this.objective = this.add.rectangle(200, 50, 10, 10, 0x00ff00).setDepth(100);
    this.physics.add.existing(this.objective, true);
    this.physics.add.overlap(this.player, this.objective, () => {
      console.log('Go to next level!');
      // this.scene.start('NextScene');
    });

    // Two guards — one per time period — patrolling opposite halves of the map.
    // Y=50 so they drop onto the floor naturally; patrol Y matches floor level (~192).
    this.createGuard(Guard_Past,    80, 50, [{ x: 40,  y: 192 }, { x: 185, y: 192 }]);
    this.createGuard(Guard_Present, 320, 50, [{ x: 215, y: 192 }, { x: 360, y: 192 }]);

    this.setupCollisions();
    this.setupKeyboardInput();

    this.scene.launch('UIScene');
    this.events.on('switchPeriod', () => this.switchTimePeriod());
    this.registry.set('timePeriod', this.timePeriod);

    this.cameras.main.startFollow(this.player);
  }

  createPlayer() {
    this.player = new Player(this, this.level.playerStart.x, this.level.playerStart.y);
    this.characters.add(this.player);
  }

  createGuard(GuardClass, x, y, patrolRoute) {
    const guard = new GuardClass(this, x, y, 300, patrolRoute);
    this.guards.push(guard);
    this.characters.add(guard);
  }

  setupCollisions() {
    this.mainLayer.setCollisionByExclusion([-1]);
    // Tile collisions for every character (player + all guards)
    this.physics.add.collider(this.characters, this.mainLayer);
    // Guard bodies physically block the player
    for (const guard of this.guards) {
      this.physics.add.collider(this.player, guard);
    }
  }

  setupKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  switchTimePeriod() {
    if (this.player.isMidAir) return;

    this.cameras.main.shake(100, 0.005);

    this.scene.launch('TransitionScene', {
      callback: () => {
        this.timePeriod = this.timePeriod === 'past' ? 'present' : 'past';
        this.registry.set('timePeriod', this.timePeriod);
        this.events.emit('periodChanged', this.timePeriod);

        this.cameras.main.flash(200, 255, 255, 255, 0.3);

        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      }
    });
  }

  update() {
    this.handleInput();
    this.manageGuards();
  }

  handleInput() {
    const uiInput = this.registry.get('uiInput') || {};

    if (this.cursors.left.isDown || uiInput.left) {
      this.player.moveLeft();
      this.player.play('walk', true);
    } else if (this.cursors.right.isDown || uiInput.right) {
      this.player.moveRight();
      this.player.play('walk', true);
    } else {
      this.player.stopMoving();
      this.player.play('idle', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || uiInput.jumpPressed) {
      if (this.player.jump()) {
        const audio = this.registry.get('audioManager');
        if (audio) audio.playJump();
      }
      uiInput.jumpPressed = false;
    }

    if (Phaser.Input.Keyboard.JustDown(this.tKey) || uiInput.timeTravelPressed) {
      this.switchTimePeriod();
      uiInput.timeTravelPressed = false;
    }
  }

  /**
   * Each frame: active-period guards chase the player when in range, patrol
   * otherwise, and wait briefly after losing sight before resuming patrol.
   * Guards outside the current time period freeze in place.
   */
  manageGuards() {
    for (const guard of this.guards) {
      if (!guard.isActiveInPeriod(this.timePeriod)) {
        guard.patroling = false;
        guard.stopMoving();
        continue;
      }

      if (guard.chaseRange.contains(this.player.x, this.player.y)) {
        // Cancel any pending return-to-patrol timer and start chasing
        if (guard.cooldownTimer) {
          guard.cooldownTimer.remove();
          guard.cooldownTimer = null;
        }
        guard.patroling = false;
        guard.chase(this.player);
      } else if (guard.patroling) {
        guard.patrol();
      } else {
        // Just lost the player — stop and wait before resuming patrol
        guard.stopMoving();
        if (!guard.cooldownTimer) {
          guard.cooldownTimer = this.time.delayedCall(1500, () => {
            guard.patroling = true;
            guard.cooldownTimer = null;
          });
        }
      }
    }
  }
}
