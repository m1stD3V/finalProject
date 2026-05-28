import { LEVELS } from '../levelData.js';
import Player from '../objects/Player.js';
import Guard_Present from '../objects/Guards.js';
import Guard_Past from '../objects/Guards.js';

// Core PoC logic for switching between time periods
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  

  create() {
    //load map json

    const map = this.make.tilemap({ key: 'level0', tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage('castle0', 'tiles');

    const layer0 = map.createLayer('bg', tileset, 0, 0);
    const layer1 = map.createLayer('main', tileset, 0, 0);
    
    this.cameras.main.zoom = 2.5;
    this.cameras.main.setBounds(0, 0, 400, 224);

    this.timePeriod = 'past';
    this.level = LEVELS[0];
    this.guards = []; // A list of all the guards in the level (Past & Present) so they don't have to be saved in individual variables
    this.characters = this.add.group(); // a group so that I can add collision in a batch as opposed to one-by-one

    // Set world bounds to exactly match the 25x14 tilemap (800x448)
    this.physics.world.setBounds(0, 0, 400, 224);

    this.createPlayer();
    this.createGuard(this.level.playerStart.x * 2, this.level.playerStart.y, [{ x: 100, y: 399 }, { x: 600, y: 271 }, { x: 720, y: 399 }]);
    this.setupCollisions();
    this.setupKeyboardInput();

    layer1.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, layer1);

    this.scene.launch('UIScene');
    this.events.on('switchPeriod', () => this.switchTimePeriod());
    this.registry.set('timePeriod', this.timePeriod);
    

    //attempt animation creation

    
    var playerIdle = {
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
    
    this.cameras.main.startFollow(this.player);
  }

  createPlayer() {
    this.player = new Player(this, this.level.playerStart.x, this.level.playerStart.y);
    this.characters.add(this.player);
  }

  createGuard(x, y, patrolRoute) {
    let guy = new Guard_Present(this, x, y, 300, patrolRoute, "present", "player");
    this.guards.push(guy);
    // Add the most recently added guard (^ That one) to the characters group so it can have collision
    this.characters.add(guy);
  }

  setupCollisions() {
    this.pastCollider = this.physics.add.collider(this.characters, this.pastLayer);
    this.presentCollider = this.physics.add.collider(this.characters, this.presentLayer);
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

  /** manageGuards 
   * This function controls the guards movement by iterating through every guard in the lise [this.guards] and
   * for each guard it will check if the player is in their range. It will chase the player if they are and patrol
   * after the player has escaped for at least 1.5 seconds.
   */
  manageGuards () {
    for (let i = 0; i < this.guards.length; i++) {
      let guy = this.guards[i];
      if (guy.isActiveInPeriod() == true) {
        if (guy.chaseRange.contains(this.player.x,this.player.y)) {
          guy.patroling = false;
          guy.chase(this.player);
        } else if (guy.patroling == true) {
          guy.patrol();
        } else {
          guy.stopMoving();
          this.time.delayedCall(1500, () => {
            guy.patroling = true;
          });
        }
      } else {
        guy.patroling = false;
        guy.stopMoving();
      }
    }
  }
}