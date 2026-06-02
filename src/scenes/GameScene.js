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
    this.mainLayer = map.createLayer('main', tileset, 0, 0);

    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, 560, 224);
    this.physics.world.setBounds(0, 0, 560, 224);

    this.timePeriod = 'past';
    this.level = LEVELS[0];
    this.guards = [];
    this.characters = this.add.group();
    this.caught = false;
    this.won = false;

    this.createPlayer();
    this.createObjective();

    // Two guards — one per time period — patrolling opposite halves of the map.
    this.createGuard(Guard_Past,    500, 50, [{ x: 500,  y: 192 }, { x: 250, y: 192 }]);
    this.createGuard(Guard_Present, 320, 50, [{ x: 500, y: 192 }, { x: 360, y: 192 }]);

    this.setupCollisions();
    this.setupKeyboardInput();

    // Apply initial period state so inactive-period guards start hidden + physics-disabled
    for (const char of this.characters.getChildren()) {
      if (char.onPeriodChange) char.onPeriodChange(this.timePeriod);
    }

    // Restart UIScene so it re-binds its event listeners to this scene
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this.scene.launch('UIScene');
    this.events.on('switchPeriod', () => this.switchTimePeriod());
    this.registry.set('timePeriod', this.timePeriod);

    this.cameras.main.startFollow(this.player);
  }

  createPlayer() {
    this.player = new Player(this, this.level.playerStart.x, this.level.playerStart.y);
    this.characters.add(this.player);
  }

  createObjective() {
    // Placed at the far right end — the Guard_Present patrols nearby, so the
    // player must time their approach and switch to 'present' to trigger it.
    const ox = 490, oy = 170;

    this.objectiveGlow = this.add.rectangle(ox, oy, 16, 16, 0xffcc00).setDepth(99).setAlpha(0.2);
    this.tweens.add({
      targets: this.objectiveGlow,
      alpha: 0.6,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    this.objective = this.add.rectangle(ox, oy, 12, 12, 0xffcc00).setDepth(100).setAlpha(0.15);
    this.physics.add.existing(this.objective, true);

    // Show/hide objective based on period
    this.events.on('periodChanged', (period) => {
      const active = period === 'present';
      this.objective.setAlpha(active ? 0.85 : 0.15);
      this.objectiveGlow.setAlpha(active ? 0.2 : 0.04);
    });
  }

  createGuard(GuardClass, x, y, patrolRoute, visionSize = 160) {
    const guard = new GuardClass(this, x, y, visionSize, patrolRoute);
    this.guards.push(guard);
    this.characters.add(guard);
  }

  setupCollisions() {
    this.mainLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.characters, this.mainLayer);

    for (const guard of this.guards) {
      // Collider callback fires on contact — separates bodies AND triggers catch
      this.physics.add.collider(this.player, guard, () => this.playerCaught());
    }

    // Win: player must be in 'present' to activate the objective
    this.physics.add.overlap(this.player, this.objective, () => {
      if (this.timePeriod === 'present') this.playerWon();
    });
  }

  setupKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  playerCaught() {
    if (this.caught || this.won) return;
    this.caught = true;

    this.player.stopMoving();
    this.player.body.enable = false;

    this.cameras.main.shake(400, 0.012);
    this.cameras.main.flash(300, 220, 0, 0, 0.6);

    this.time.delayedCall(400, () => {
      this.showOverlay('CAUGHT!', '#ff4444', 'R — Try Again', () => {
        this.scene.stop('UIScene');
        this.scene.restart();
      });
    });
  }

  playerWon() {
    if (this.caught || this.won) return;
    this.won = true;

    this.player.stopMoving();
    this.player.body.enable = false;

    this.cameras.main.flash(600, 255, 220, 50, 0.8);

    this.time.delayedCall(500, () => {
      this.showOverlay('LEVEL CLEAR!', '#ffcc00', 'R — Main Menu', () => {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
      });
    });
  }

  showOverlay(title, titleColor, hint, onAction) {
    const view = this.cameras.main.worldView;
    const cx = view.centerX;
    const cy = view.centerY;

    const bg = this.add.graphics().setDepth(200);
    bg.fillStyle(0x000000, 0.75);
    bg.fillRect(view.x, view.y, view.width, view.height);

    // setResolution accounts for the 2.5× camera zoom on top of device DPR
    const res = this.cameras.main.zoom * (window.devicePixelRatio || 1);

    this.add.text(cx, cy - 18, title, {
      fontSize: '14px',
      color: titleColor,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201).setResolution(res);

    const hintText = this.add.text(cx, cy + 8, hint, {
      fontSize: '7px',
      color: '#cccccc',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(201).setResolution(res);

    this.tweens.add({ targets: hintText, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    // Tappable for mobile
    this.add.zone(cx, cy, view.width, view.height)
      .setDepth(202)
      .setInteractive()
      .once('pointerdown', onAction);

    this.input.keyboard.once('keydown-R', onAction);
  }

  switchTimePeriod() {
    if (this.caught || this.won) return;
    if (this.player.isMidAir || this.scene.isActive('TransitionScene')) return;

    this.cameras.main.shake(100, 0.005);

    this.scene.launch('TransitionScene', {
      callback: () => {
        this.timePeriod = this.timePeriod === 'past' ? 'present' : 'past';
        this.registry.set('timePeriod', this.timePeriod);
        this.events.emit('periodChanged', this.timePeriod);

        for (const char of this.characters.getChildren()) {
          if (char.onPeriodChange) char.onPeriodChange(this.timePeriod);
        }

        this.cameras.main.flash(200, 255, 255, 255, 0.3);

        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      }
    });
  }

  update() {
    if (this.caught || this.won) return;
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
          guard.cooldownTimer = this.time.delayedCall(2500, () => {
            guard.patroling = true;
            guard.cooldownTimer = null;
          });
        }
      }
    }
  }
}
