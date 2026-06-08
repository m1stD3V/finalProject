// Cinematics prototype PreloadScene
// Sets the asset base path two directories up so the shared assets/ folder is found
// correctly whether served locally or from GitHub Pages.
import AudioManager from '../../../src/systems/AudioManager.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    // Resolve assets relative to the main project root, not this prototype's URL
    this.load.setPath('../../');
    this.load.image('monkey', 'assets/UI/monkey.png');
    this.load.spritesheet('player', 'assets/player/mcSpriteSheet.png', { frameWidth: 20, frameHeight: 32 });
    this.load.audio('mainTheme', 'assets/audio/mainTheme.mp3');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // Create player animations (needed by MenuScene's animated thief)
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 3, repeat: -1
    });

    // Studio logo cinematic — identical to the main game's intro
    const monkey = this.add.image(400, 200, 'monkey').setScale(0.5).setAlpha(0);
    this.tweens.chain({
      targets: monkey,
      tweens: [
        { alpha: 1, scale: 0.515, duration: 1000, ease: 'Sine.easeInOut' },
        { alpha: 0, duration: 1200, onComplete: () => monkey.destroy() }
      ]
    });

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const loadingText = this.add.text(w / 2, h / 2 - 20, 'Loading...', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRect(w / 2 - 150, h / 2 + 10, 300, 20);

    const bar = this.add.graphics();

    this.time.delayedCall(2300, () => {
      bar.fillStyle(0x44aaff);
      bar.fillRect(w / 2 - 148, h / 2 + 12, 296, 16);

      const audio = new AudioManager(this);
      audio.init();
      this.registry.set('audioManager', audio);

      this.time.delayedCall(200, () => this.scene.start('MenuScene'));
    });
  }
}
