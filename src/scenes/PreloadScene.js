import AudioManager from '../systems/AudioManager.js';

// Handles asset generation and system initialization before the game starts
// Displays a loading bar while placeholder textures are being created
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.pack('assets', 'json/assetLoader.json');
    this.load.pack('music', 'json/musicLoader.json');
    this.load.tilemapTiledJSON('level0', 'json/level1.json');
    this.load.tilemapTiledJSON('level1', 'json/longLevel0.json');
    this.load.tilemapTiledJSON('level2', 'json/castleMap2.json');
    this.load.tilemapTiledJSON('level3', 'json/level3.json');
    this.load.image('monkey', 'assets/UI/monkey.png');
  }

  // Create the loading UI and initialize game systems
  create() {
    this.cameras.main.setBackgroundColor('#000000');
    let monkey = this.add.image(400, 200, 'monkey').setScale(0.5).setAlpha(0).setOrigin(0.5, 0.5);
    this.tweens.chain({
      targets: monkey,
      tweens: [
        {
          alpha: 1,
          scale: 0.515,
          duration: 1000,
          ease: 'Sine.easeInOut'
        }, {
          alpha: 0,
          duration: 1200,
          onComplete: () => { monkey.destroy(); }
        }
      ]
    });
    // init player animations
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
          showOnStart: false
        }
        this.anims.create(playerWalk);
    
        var playerJump = {
          key: 'jump',
    
          frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
          frameRate: 0,
          repeat: -1,
          showOnStart: false
        }
        this.anims.create(playerJump);

        this.anims.create({
          key: 'guard_walk',
          frames: this.anims.generateFrameNumbers('clanker', { start: 4, end: 7 }),
          frameRate: 12,
          repeat: -1
        });

        this.anims.create({
          key: 'guard_idle',
          frames: this.anims.generateFrameNumbers('clanker', { start: 0, end: 3 }),
          frameRate: 4,
          repeat: -1
        });


    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Loading text
    let loadingText = this.add.text(w / 2, h / 2 - 20, 'Loading...', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRect(w / 2 - 150, h / 2 + 10, 300, 20);

    // Progress bar foreground
    const bar = this.add.graphics();
    bar.fillStyle(0x44aaff);
    bar.fillRect(w / 2 - 148, h / 2 + 12, 0, 16);

    // Loading Container
    let loadingContainer = this.add.container(0, h / 2 - 90);
    loadingContainer.add([loadingText, barBg, bar]).setAlpha(1);

    // Delay slightly to show the loading bar before starting generation
    this.time.delayedCall(2300, () => {
      // Simulate progress bar filling
      bar.fillRect(w / 2 - 148, h / 2 + 12, 296, 16);

      // Initialize the audio system
      const audio = new AudioManager(this);
      audio.init();
      // Store in registry for global access
      this.registry.set('audioManager', audio);

      // Transition to the main menu after a short delay
      this.time.delayedCall(200, () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
