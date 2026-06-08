import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.timePeriod = 'past';
    this.level = LEVELS[0];

    this.physics.world.setBounds(0, 0, 800, 450);
    this.createTilemaps();
    this.createPlayer();
    this.setupCollisions();
    this.setupKeyboardInput();

    this.scene.launch('UIScene');
    this.registry.set('timePeriod', this.timePeriod);

    // Period label in-world
    this.periodLabel = this.add.text(10, 10, 'PAST  — T to switch', {
      fontSize: '14px', color: '#ffcc00', fontFamily: 'monospace',
      backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 6, y: 3 }
    });

    // Objective marker
    const ox = 700, oy = 400;
    this.objective = this.add.rectangle(ox, oy, 24, 24, 0xffcc00).setAlpha(0.85);
    this.physics.add.existing(this.objective, true);
    this.tweens.add({ targets: this.objective, alpha: 0.3, scaleX: 1.3, scaleY: 1.3, duration: 700, yoyo: true, repeat: -1 });
    this.add.text(ox, oy - 20, 'GOAL', { fontSize: '10px', color: '#ffcc00', fontFamily: 'monospace' }).setOrigin(0.5);
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
    this.pastCollider    = this.physics.add.collider(this.player, this.pastLayer);
    this.presentCollider = this.physics.add.collider(this.player, this.presentLayer);
    this.presentCollider.active = false;

    this.physics.add.overlap(this.player, this.objective, () => this.playerWon());
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
        this.pastLayer.setVisible(this.timePeriod === 'past');
        this.presentLayer.setVisible(this.timePeriod === 'present');
        this.pastCollider.active    = (this.timePeriod === 'past');
        this.presentCollider.active = (this.timePeriod === 'present');
        this.registry.set('timePeriod', this.timePeriod);
        this.events.emit('periodChanged', this.timePeriod);
        this.cameras.main.flash(200, 255, 255, 255, 0.3);
        this.periodLabel.setText(this.timePeriod.toUpperCase() + '  — T to switch');
        this.periodLabel.setColor(this.timePeriod === 'past' ? '#ffcc00' : '#44aaff');
        const audio = this.registry.get('audioManager');
        if (audio) audio.playTimeSwitch();
      }
    });
  }

  playerWon() {
    if (this.won) return;
    this.won = true;
    this.cameras.main.flash(600, 255, 220, 50, 0.8);
    this.time.delayedCall(600, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  update() {
    const uiInput = this.registry.get('uiInput') || {};

    if (this.cursors.left.isDown  || uiInput.left)  this.player.moveLeft();
    else if (this.cursors.right.isDown || uiInput.right) this.player.moveRight();
    else this.player.stopMoving();

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
