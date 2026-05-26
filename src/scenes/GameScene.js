import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';

// Core PoC logic for switching between time periods
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.timePeriod = 'past';
    this.level = LEVELS[0];
    
    // Set world bounds to exactly match the 25x14 tilemap (800x448)
    this.physics.world.setBounds(0, 0, 800, 448);

    this.createTilemaps();
    this.createPlayer();
    this.setupCollisions();
    this.setupKeyboardInput();

    this.scene.launch('UIScene');
    this.events.on('switchPeriod', () => this.switchTimePeriod());
    this.registry.set('timePeriod', this.timePeriod);

    //attempt animation creation

    var playerIdle = {
      key: 'idle',

      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 3,
      repeat: -1,
      showOnStart: true
    }
    this.anims.create(playerIdle);

    var playerWalk = {
      key: 'walk',

      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 7 }),
      frameRate: 15,
      repeat: -1,
      showOnStart: true
    }
    this.anims.create(playerWalk);
  }

  createTilemaps() {
    this.pastMap = this.make.tilemap({ data: this.level.past.tileData, tileWidth: 32, tileHeight: 32 });
    const pastTileset = this.pastMap.addTilesetImage('tileset_past');
    this.pastLayer = this.pastMap.createLayer(0, pastTileset, 0, 0);
    this.pastLayer.setCollisionByExclusion([0]);

    this.presentMap = this.make.tilemap({ data: this.level.present.tileData, tileWidth: 32, tileHeight: 32 });
    const presentTileset = this.presentMap.addTilesetImage('tileset_present');
    this.presentLayer = this.presentMap.createLayer(0, presentTileset, 0, 0);
    this.presentLayer.setCollisionByExclusion([0]);
    this.presentLayer.setVisible(false);
  }

  createPlayer() {
    this.player = new Player(this, this.level.playerStart.x, this.level.playerStart.y);
    
  }

  setupCollisions() {
    this.pastCollider = this.physics.add.collider(this.player, this.pastLayer);
    this.presentCollider = this.physics.add.collider(this.player, this.presentLayer);
    this.presentCollider.active = false;
  }

  setupKeyboardInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  switchTimePeriod() {
    if (this.player.isMidAir) return;

    // Visual feedback: camera shake
    this.cameras.main.shake(100, 0.005);

    this.scene.launch('TransitionScene', {
      callback: () => {
        this.timePeriod = this.timePeriod === 'past' ? 'present' : 'past';
        this.pastLayer.setVisible(this.timePeriod === 'past');
        this.presentLayer.setVisible(this.timePeriod === 'present');
        this.pastCollider.active = (this.timePeriod === 'past');
        this.presentCollider.active = (this.timePeriod === 'present');

        this.registry.set('timePeriod', this.timePeriod);
        this.events.emit('periodChanged', this.timePeriod);
        
        // Small flash effect for impact
        this.cameras.main.flash(200, 255, 255, 255, 0.3);

        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      }
    });
  }

  update() {
    this.handleInput();
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
