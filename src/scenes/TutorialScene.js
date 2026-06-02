import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    const map = this.make.tilemap({ key: 'level0', tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage('castle0', 'tiles');

    this.bgLayer  = map.createLayer('bg',   tileset, 0, 0);
    this.mainLayer = map.createLayer('main', tileset, 0, 0);

    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, 560, 224);
    this.physics.world.setBounds(0, 0, 560, 224);

    this.timePeriod = 'past';
    this.level = LEVELS[0];
    this.guards = [];
    this.characters = this.add.group();

    this.createPlayer();

    // Pulsing glow (decorative) + physics body for overlap detection
    this.objectiveGlow = this.add.rectangle(250, 115, 10, 10, 0x00ff00).setDepth(100).setAlpha(0.2);
    this.objective     = this.add.rectangle(250, 115, 10, 10, 0x00ff00).setDepth(100).setAlpha(0.2);
    this.physics.add.existing(this.objective, true);
    this.physics.add.overlap(this.player, this.objective, () => {
      if (this.timePeriod === 'present') this.scene.start('GameScene');
    });

    this.tweens.add({ targets: this.objectiveGlow, alpha: 1, duration: 1000, yoyo: true, repeat: -1 });

    const textRes = this.cameras.main.zoom * (window.devicePixelRatio || 1);
    this.add.text(20, 35,
      'Welcome to Time Thief!\nUse arrow buttons on your left to move.\nPress the lightning button to switch time periods and\navoid obstacles.', {
        fontSize: '10px', fill: '#ffffff'
      }).setResolution(textRes);

    this.setupCollisions();
    this.setupKeyboardInput();

    // Initialise lives in registry so the UIScene hearts display correctly
    this.registry.set('lives', 3);

    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this.scene.launch('UIScene');
    this.registry.set('timePeriod', this.timePeriod);

    this.periodOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffddbb, 0.15)
      .setDepth(50).setScrollFactor(0).setOrigin(0);

    this.updatePeriodVisuals(this.timePeriod);
    this.cameras.main.startFollow(this.player);
  }

  createPlayer() {
    this.player = new Player(this, this.level.playerStart.x, this.level.playerStart.y);
    this.characters.add(this.player);
  }

  setupCollisions() {
    this.mainLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.characters, this.mainLayer);
    for (const guard of this.guards) {
      this.physics.add.collider(this.player, guard);
    }
  }

  setupKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  updatePeriodVisuals(period) {
    this.periodOverlay.setFillStyle(period === 'past' ? 0xffddbb : 0xbbddff, 0.15);
  }

  switchTimePeriod() {
    if (this.player.isMidAir || this.scene.isActive('TransitionScene')) return;

    this.cameras.main.shake(100, 0.005);

    this.scene.launch('TransitionScene', {
      callback: () => {
        this.timePeriod = this.timePeriod === 'past' ? 'present' : 'past';
        this.registry.set('timePeriod', this.timePeriod);
        this.events.emit('periodChanged', this.timePeriod);

        this.updatePeriodVisuals(this.timePeriod);
        this.cameras.main.flash(200, 255, 255, 255, 0.3);

        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      }
    });
  }

  update() {
    this.handleInput();
    const active = this.timePeriod === 'present';
    this.objective.setAlpha(active ? 1 : 0.25);
    this.objectiveGlow.setAlpha(active ? 0.2 : 0.04);
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

    // Jump animation takes priority; walk/idle only when grounded
    if (this.player.isMidAir) {
      this.player.play('jump', true);
    } else if (this.cursors.left.isDown || uiInput.left || this.cursors.right.isDown || uiInput.right) {
      this.player.play('walk', true);
    } else {
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
}
