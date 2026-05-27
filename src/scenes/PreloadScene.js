import SpriteGenerator from '../systems/SpriteGenerator.js';
import AudioManager from '../systems/AudioManager.js';

// Handles asset generation and system initialization before the game starts
// Displays a loading bar while placeholder textures are being created
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // tileset1 in order: left platform, middle platform, right platform, floor, background, wall
    this.load.pack('assets', 'lib/json/assetLoader.json');
    this.load.pack('music', 'lib/json/musicLoader.json');
  }

  // Create the loading UI and initialize game systems
  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Placeholder Logo and Intro
    let stuidoText1 = this.add.text(w / 2 - 80, h / 2 - 80, 'A game by...', {
      fontSize: '35px', color: '#ffffff', fontFamily: 'monospace'
    });

    let studioText2 = this.add.text(w / 2 - 200, h / 2 - 20, 'Placeholder Studios', {
      fontSize: '45px', color: '#ffffff', fontFamily: 'monospace'
    });

    // Simple tween effect
    this.tweens.chain({
      tweens: [{
        targets: [stuidoText1, studioText2],
        color: '#44aaff',
        scale: 1.05,
        x: '-=10',
        duration: 2000,
        ease: 'Power2'
      }, {
        targets: [stuidoText1, studioText2],
        alpha: 0,
        duration: 2000,
      }]

      
    });

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
    this.time.delayedCall(2000, () => {
      // Simulate progress bar filling
      bar.fillRect(w / 2 - 148, h / 2 + 12, 296, 16);

      // Generate all procedural textures
      const gen = new SpriteGenerator(this);
      gen.generateAll();

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
