// Polished UIScene for PoC mobile controls
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Initial input state
    this.registry.set('uiInput', { left: false, right: false, jumpPressed: false, timeTravelPressed: false });

    // HUD: Time Period Indicator
    this.createHUD();

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('periodChanged', (period) => {
      this.updateHUD(period);
    });

    // Mobile Controls
    this.createButton(80, 380, 70, 70, '◀', 'left');
    this.createButton(170, 380, 70, 70, '▶', 'right');
    this.createButton(720, 380, 80, 80, '▲', 'jump');
    this.createButton(610, 380, 70, 70, '⚡', 'timeTravel', 0xffcc00);
  }

  // Create a more polished HUD for time indication
  createHUD() {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(320, 10, 160, 40, 10);
    
    this.periodText = this.add.text(400, 30, 'PAST', { 
      fontSize: '22px', 
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  // Update HUD text and color based on period
  updateHUD(period) {
    const isPast = period === 'past';
    this.periodText.setText(period.toUpperCase());
    this.periodText.setColor(isPast ? '#ffcc00' : '#44aaff');
  }

  // Create stylized interactive buttons
  createButton(x, y, w, h, label, action, color = 0xffffff) {
    const bg = this.add.graphics();
    const drawBtn = (pressed = false) => {
      bg.clear();
      bg.fillStyle(0x222222, pressed ? 0.9 : 0.6);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
      bg.lineStyle(3, color, pressed ? 1 : 0.5);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    };

    drawBtn();

    const text = this.add.text(x, y, label, { 
      fontSize: '32px', 
      color: color === 0xffffff ? '#ffffff' : '#000000',
      backgroundColor: color === 0xffffff ? 'transparent' : color,
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive();
    
    zone.on('pointerdown', () => {
      drawBtn(true);
      const input = this.registry.get('uiInput');
      if (action === 'left' || action === 'right') input[action] = true;
      else if (action === 'jump') input.jumpPressed = true;
      else if (action === 'timeTravel') input.timeTravelPressed = true;
    });

    const release = () => {
      drawBtn(false);
      const input = this.registry.get('uiInput');
      if (action === 'left' || action === 'right') input[action] = false;
    };

    zone.on('pointerup', release);
    zone.on('pointerout', release);
  }
}
