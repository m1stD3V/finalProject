export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    console.log('Creating SettingsScene');
    this.add.text(20, 20, 'Settings', { fontSize: '32px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold' });
  
    // Volume Slider
    const sliderWidth = 200;
    const sliderHeight = 6;
    const handleRadius = 10;

    const trackLeft = (w / 2) - (sliderWidth / 2);
    const trackRight = (w / 2) + (sliderWidth / 2);

    const trackGraphics = this.add.graphics();
    trackGraphics.fillStyle(0x555555, 1);
    trackGraphics.fillRoundedRect(trackLeft, h / 2 - (sliderHeight / 2), sliderWidth, sliderHeight, 3);

    const currentvolume = this.sound.volume;
    const initialHandleX = trackLeft + (currentvolume * sliderWidth);

    const handle = this.add.circle(initialHandleX, h / 2, handleRadius, 0xaaaaaa).setInteractive({ draggable: true });

    handle.on('pointerover', () => handle.setFillStyle(0xffffff));
    handle.on('pointerout', () => handle.setFillStyle(0xaaaaaa));

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === handle) {
        const clampedX = Phaser.Math.Clamp(dragX, trackLeft, trackRight);
        gameObject.x = clampedX;

        const newVolume = (clampedX - trackLeft) / sliderWidth;
        this.sound.setVolume(newVolume);
      }
    });
    // Back button implementation
    this.createMenuButton(w / 2 + 130, h / 2 + 120, 'Back', () => {
      const audio = this.registry.get('audioManager');
      if (audio) {
        audio.resume();
        audio.startMusic();
      }
      this.scene.start('MenuScene');
    });
}

  createMenuButton(x, y, label, callback) {
    const bg = this.add.graphics();
    const draw = (over = false) => {
      bg.clear();
      bg.fillStyle(over ? 0x555555 : 0x333333);
      bg.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
      bg.lineStyle(2, over ? 0x44aaff : 0x666666);
      bg.strokeRoundedRect(x - 120, y - 30, 240, 60, 10);
    };

    draw();

    const text = this.add.text(x, y, label, { 
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace' 
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 240, 60).setInteractive({ useHandCursor: true });
    
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', callback);
}
}