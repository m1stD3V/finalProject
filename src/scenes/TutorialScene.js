import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    console.log('Creating TutorialScene');
    const map = this.make.tilemap({ key: 'level0', tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage('castle0', 'tiles');

    this.bgLayer = map.createLayer('bg', tileset, 0, 0);
    // 'main' is the sole collision layer. When the Tiled map gains separate
    // 'past' and 'present' layers, add a second createLayer call here and
    // toggle visibility/colliders in switchTimePeriod().
    this.mainLayer = map.createLayer('main', tileset, 0, 0);

    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, 560, 224);
    this.physics.world.setBounds(0, 0, 560, 224);

    this.timePeriod = 'past';
    this.level = LEVELS[0];
    this.guards = [];
    this.characters = this.add.group();

    this.createPlayer();

    // Create Player Objective
    this.objective2 = this.add.rectangle(250, 115, 10, 10, 0x00ff00).setDepth(100).setAlpha(.20);
    this.objective = this.add.rectangle(250, 115, 10, 10, 0x00ff00).setDepth(100).setAlpha(.20);
    this.physics.add.existing(this.objective, true);
    this.physics.add.overlap(this.player, this.objective, () => {
      if (this.timePeriod === 'present') this.scene.start('GameScene');
    });

    this.tweens.add({
      targets: this.objective2,
      alpha: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Tutorial Text — setResolution matches the 2.5× camera zoom so the
    // text canvas is pre-rendered at the correct pixel density.
    const textRes = this.cameras.main.zoom * (window.devicePixelRatio || 1);
    this.add.text(20, 35, 'Welcome to Time Thief!\nUse arrow buttons on your left to move.\nPress the lightning button to switch time periods and\navoid obstacles.', {
      fontSize: '10px',
      fill: '#ffffff'
    }).setResolution(textRes);

    this.setupCollisions();
    this.setupKeyboardInput();

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
    if (this.player.isMidAir || this.scene.isActive('TransitionScene')) return;

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
    this.objective.setAlpha(this.timePeriod === 'present' ? 1 : 0.25);
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
}
