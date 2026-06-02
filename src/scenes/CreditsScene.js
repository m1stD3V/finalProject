export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    console.log('Creating CreditsScene');
    this.add.text(20, 20, 'CREDITS', { fontSize: '32px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold' });
    this.add.text(w / 2 + 15, h / 2 - 35, 'Developed by...\n\nErnie Jennison, Waheed Khan,\n\nEvangel Hightower-Rojas, Serena Heath,\n\nJoshua Peterson', { fontSize: '24px', color: '#ffffff', fontFamily: 'monospace', align: 'center' }).setOrigin(0.5);
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