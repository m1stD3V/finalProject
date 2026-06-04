// Polished Menu for PoC
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Title with shadow
    this.add.text(w / 2 + 4, h / 2 - 96, 'TIME THIEF', { 
      fontSize: '64px', color: '#000000', fontFamily: 'monospace', fontStyle: 'bold' 
    }).setOrigin(0.5).setAlpha(0.3);

    this.add.text(w / 2, h / 2 - 100, 'TIME THIEF', { 
      fontSize: '64px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold' 
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(w / 2, h / 2 - 35, 'Proof of Concept', { 
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'monospace' 
    }).setOrigin(0.5);

    // Interactive Start Button
    this.createMenuButton(w / 2, h / 2 + 35, 'START GAME', () => {
      const audio = this.registry.get('audioManager');
      if (audio) {
        audio.resume();
        audio.startMusic();
      }
      this.scene.start('Level1Scene'); //TutorialScene
    });

    this.createMenuButton(w / 2 + 130, h / 2 + 120, 'SETTINGS', () => {
      this.scene.launch('SettingsScene', { caller: 'MenuScene' });
    });

    // Interactive Credits & Settings Buttons
    this.createMenuButton(w / 2 - 130, h / 2 + 120, 'CREDITS', () => {
      const audio = this.registry.get('audioManager');
      if (audio) {
        audio.resume();
        audio.startMusic();
      }      
      this.scene.start('CreditsScene');
    });
  }

  // Helper for menu buttons with hover effects
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
