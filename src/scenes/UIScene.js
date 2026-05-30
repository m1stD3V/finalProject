// Polished UIScene for PoC mobile controls
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  preload() {
    this.load.path = "assets/";

    this.load.image("jumpButt","UI/button_jump.png"); // Lol
    this.load.image("rightButt", "UI/button_right.png");
    this.load.image("leftButt", "UI/button_left.png");
    
    this.load.spritesheet("timeButt", "UI/button_timeTravel.png",{ frameWidth:32, frameHeight: 32});
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
    let UIScale = 3;
    this.createButton(80, 380, 'left', "leftButt", 1*UIScale);
    this.createButton(180, 380, 'right', "rightButt", 1*UIScale);
    this.createButton(720, 380, 'jump', "jumpButt", 1*UIScale);

    const ageToPresent = {
      key: "toPresent",
      frames: this.anims.generateFrameNumbers("timeButt", {frames: [12,11,10,9,8,7,6,5,4,3,2,1,0]}),
      frameRate: 16,
      repeat: 0,
    }
    const ageToPast = {
      key: "toPast",
      frames: this.anims.generateFrameNumbers("timeButt", {frames: [0,1,2,3,4,5,6,7,8,9,10,11,12]}),
      frameRate: 16,
      repeat: 0,
    }
    this.anims.create(ageToPresent);
    this.anims.create(ageToPast);

    const travButton = this.createButton(610, 380, 'timeTravel', "timeButt", 0.9*UIScale)
    this.scene.get("GameScene").events.on("periodChanged", (period) => {
        console.log(`Changed Period to ${period}`);
        if (period == "present") {
          travButton.play("toPresent");
        } else {
          travButton.play("toPast");
        }
      }, this)
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
  createButton(x, y, action, texture, scale = 1) {
    const button = this.add.sprite(x, y, texture);
    button.setScale(scale);
    const w = button.width * button.scale;
    const h = button.height * button.scale;
    const drawBtn = (pressed = false) => {
      button.setAlpha(pressed ? 1 : 0.75);
    };

    drawBtn();

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

    return(button);
  }
}
