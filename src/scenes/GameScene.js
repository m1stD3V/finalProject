import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';
import { Guard_Present, Guard_Past } from '../objects/Guards.js';

const GUARD_CLASSES = { past: Guard_Past, present: Guard_Present };

export default class GameScene extends Phaser.Scene {
  constructor(key = 'GameScene') {
    super(key);
  }

  getLevelConfig() {
    return LEVELS[0];
  }

  create() {
    this.cfg = this.getLevelConfig();
    const { cfg } = this;

    const map = this.make.tilemap({ key: cfg.mapKey, tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage(cfg.tilesetName, cfg.tilesetKey);
    this.setupLayers(map, tileset);

    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, cfg.cameraWidth, cfg.cameraHeight);
    this.physics.world.setBounds(0, 0, cfg.worldWidth, cfg.worldHeight);
    // Increase tile bias to reduce edge-case tunneling at high velocities (default is 16)
    this.physics.world.TILE_BIAS = 32;

    this.timePeriod = 'past';
    this.guards = [];
    this.characters = this.add.group();
    this.caught = false;
    this.won = false;
    this.invincible = false;
    this.lives = 3;

    this.registry.set('lives', this.lives);

    this.createPlayer();
    this.createObjective(cfg.objectivePos.x, cfg.objectivePos.y);

    for (const g of cfg.guards) {
      this.createGuard(GUARD_CLASSES[g.type], g.x, g.y, g.route, g.visionSize);
    }

    this.setupCollisions();
    this.setupKeyboardInput();

    for (const char of this.characters.getChildren()) {
      if (char.onPeriodChange) char.onPeriodChange(this.timePeriod);
    }

    this.registry.set('timePeriod', this.timePeriod);
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this.scene.launch('UIScene', { caller: this.scene.key });

    this.periodOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffddbb, 0.15)
      .setDepth(50).setScrollFactor(0).setOrigin(0);

    this.updatePeriodVisuals(this.timePeriod);
    this.cameras.main.startFollow(this.player);
  }

  setupLayers(map, tileset) {
    const { layers, layerMode } = this.cfg;
    if (layerMode === 'simple') {
      this.bgLayer = map.createLayer(layers.bg, tileset, 0, 0);
      this.mainLayer = map.createLayer(layers.main, tileset, 0, 0);
    } else {
      this.pastBg = map.createLayer(layers.pastBg, tileset, 0, 0);
      this.pastNoCollide = map.createLayer(layers.pastNoCollide, tileset, 0, 0);
      this.pastMain = map.createLayer(layers.pastMain, tileset, 0, 0);
      this.presentBg = map.createLayer(layers.presentBg, tileset, 0, 0);
      this.presentNoCollide = map.createLayer(layers.presentNoCollide, tileset, 0, 0);
      this.presentMain = map.createLayer(layers.presentMain, tileset, 0, 0);
    }
  }

  createPlayer() {
    this.player = new Player(this, this.cfg.playerStart.x, this.cfg.playerStart.y);
    this.characters.add(this.player);
  }

  createObjective(ox, oy) {
    this.objectiveGlow = this.add.rectangle(ox, oy, 16, 16, 0xffcc00).setDepth(99).setAlpha(0.2);
    this.tweens.add({
      targets: this.objectiveGlow,
      alpha: 0.6, scaleX: 1.4, scaleY: 1.4,
      duration: 900, yoyo: true, repeat: -1,
    });

    this.objective = this.add.rectangle(ox, oy, 12, 12, 0xffcc00).setDepth(100).setAlpha(0.15);
    this.physics.add.existing(this.objective, true);

    this.events.on('periodChanged', (period) => {
      const active = period === this.cfg.objectivePeriod;
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
    if (this.cfg.layerMode === 'simple') {
      this.mainLayer.setCollisionByExclusion([-1]);
      this.physics.add.collider(this.characters, this.mainLayer);
    } else {
      const tileIndexes = Array.from({ length: 132 }, (_, i) => i);
      this.presentMain.setCollision(tileIndexes);
      this.pastMain.setCollision(tileIndexes);
      this.presentCollision = this.physics.add.collider(this.characters, this.presentMain);
      this.pastCollision = this.physics.add.collider(this.characters, this.pastMain);
      this.presentCollision.active = false;
    }

    for (const guard of this.guards) {
      this.physics.add.collider(this.player, guard, (player, hitGuard) => this.playerHit(hitGuard));
    }

    this.physics.add.overlap(this.player, this.objective, () => {
      if (this.timePeriod === this.cfg.objectivePeriod) this.playerWon();
    });
  }

  setupKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  updatePeriodVisuals(period) {
    this.periodOverlay.setFillStyle(period === 'past' ? 0xffddbb : 0xbbddff, 0.15);

    if (this.cfg.layerMode === 'period-split') {
      const inPresent = period === 'present';
      this.presentMain.setVisible(inPresent);
      this.presentNoCollide.setVisible(inPresent);
      this.presentBg.setVisible(inPresent);
      this.pastMain.setVisible(!inPresent);
      this.pastNoCollide.setVisible(!inPresent);
      this.pastBg.setVisible(!inPresent);
    }
  }

  playerHit(guard) {
    if (this.caught || this.won || this.invincible) return;

    this.lives--;
    this.registry.set('lives', this.lives);

    if (this.lives <= 0) {
      this.triggerGameOver();
      return;
    }

    this.invincible = true;

    const dir = this.player.x < guard.x ? -1 : 1;
    this.player.setVelocityX(dir * 260);
    this.player.setVelocityY(-160);

    this.cameras.main.shake(150, 0.007);
    this.cameras.main.flash(100, 220, 0, 0, 0.4);

    const audio = this.registry.get('audioManager');
    if (audio) audio.playHit();

    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.player.setAlpha(1);
        this.invincible = false;
      },
    });
  }

  triggerGameOver() {
    this.caught = true;

    this.player.stopMoving();
    this.player.body.enable = false;

    for (const guard of this.guards) {
      guard.stopMoving();
      guard.body.enable = false;
    }

    this.cameras.main.shake(400, 0.012);
    this.cameras.main.flash(300, 220, 0, 0, 0.6);

    const audio = this.registry.get('audioManager');
    if (audio) audio.playCaught();

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

    for (const guard of this.guards) {
      guard.stopMoving();
      guard.body.enable = false;
    }

    this.cameras.main.flash(600, 255, 220, 50, 0.8);

    const audio = this.registry.get('audioManager');
    if (audio) audio.playWin();

    this.time.delayedCall(500, () => {
      this.showOverlay(this.cfg.winTitle, '#ffcc00', 'R — Continue', () => {
        this.scene.stop('UIScene');
        this.scene.start(this.cfg.nextScene);
      });
    });
  }

  showOverlay(title, titleColor, hint, onAction) {
    const view = this.cameras.main.worldView;
    const cx = view.centerX;
    const cy = view.centerY;
    const res = this.cameras.main.zoom * (window.devicePixelRatio || 1);

    const bg = this.add.graphics().setDepth(200);
    bg.fillStyle(0x000000, 0.75);
    bg.fillRect(view.x, view.y, view.width, view.height);

    this.add.text(cx, cy - 18, title, {
      fontSize: '14px', color: titleColor, fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201).setResolution(res);

    const hintText = this.add.text(cx, cy + 8, hint, {
      fontSize: '7px', color: '#cccccc', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(201).setResolution(res);

    this.tweens.add({ targets: hintText, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.add.zone(cx, cy, view.width, view.height)
      .setDepth(202).setInteractive().once('pointerdown', onAction);

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

        this.updatePeriodVisuals(this.timePeriod);

        if (this.cfg.layerMode === 'period-split') {
          this.presentCollision.active = this.timePeriod === 'present';
          this.pastCollision.active = this.timePeriod === 'past';
          // Zero velocity so the freshly-activated tile layer can resolve overlap cleanly
          this.player.setVelocityY(0);
        }

        this.cameras.main.flash(200, 255, 255, 255, 0.3);

        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      },
    });
  }

  update() {
    if (this.caught || this.won) return;
    this.handleInput();
    this.manageGuards();
    // Debug
    let mouse = this.input.activePointer;
    if (mouse.isDown == true) {
      console.log(`Player: (${Math.trunc(this.player.x)}, ${Math.trunc(this.player.y)})\nObjective: (${Math.trunc(this.objective.x)}, ${Math.trunc(this.objective.y)})\nMouse: (${Math.trunc(mouse.worldX)}, ${Math.trunc(mouse.worldY)})`);
    }
  }

  handleInput() {
    const uiInput = this.registry.get('uiInput') || {};

    if (this.cursors.left.isDown || uiInput.left) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown || uiInput.right) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }

    if (this.player.isMidAir) {
      this.player.play('jump', true);
    } else if (this.cursors.left.isDown || uiInput.left || this.cursors.right.isDown || uiInput.right) {
      this.player.play('walk', true);
    } else {
      this.player.play('idle', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || uiInput.jumpPressed) {
      if (!this.scene.isActive('TransitionScene') && this.player.jump()) {
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

  manageGuards() {
    for (const guard of this.guards) {
      if (!guard.isActiveInPeriod(this.timePeriod)) {
        guard.patroling = false;
        guard.stopMoving();
        continue;
      }

      if (guard.chaseRange.contains(this.player.x, this.player.y)) {
        if (guard.cooldownTimer) {
          guard.cooldownTimer.remove();
          guard.cooldownTimer = null;
        }
        guard.patroling = false;
        guard.chase(this.player);
      } else if (guard.patroling) {
        guard.patrol();
      } else {
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
