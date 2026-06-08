import SpriteGenerator from '../systems/SpriteGenerator.js';
import AudioManager from '../systems/AudioManager.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.text(w / 2, h / 2 - 20, 'Loading...', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRect(w / 2 - 150, h / 2 + 10, 300, 20);

    const bar = this.add.graphics();

    this.time.delayedCall(100, () => {
      bar.fillStyle(0x44aaff);
      bar.fillRect(w / 2 - 148, h / 2 + 12, 296, 16);

      const gen = new SpriteGenerator(this);
      gen.generateAll();

      const audio = new AudioManager(this);
      audio.init();
      this.registry.set('audioManager', audio);

      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });
  }
}
