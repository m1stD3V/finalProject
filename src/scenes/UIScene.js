export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  preload() {
    this.load.path = 'assets/';
    this.load.image('jumpButt',  'UI/button_jump.png');
    this.load.image('rightButt', 'UI/button_right.png');
    this.load.image('leftButt',  'UI/button_left.png');
    this.load.spritesheet('timeButt', 'UI/button_timeTravel.png', { frameWidth: 32, frameHeight: 32 });
  }

  init(data) {
    this.callerKey = data?.caller ?? 'GameScene';
  }

  create() {
    this.registry.set('uiInput', { left: false, right: false, jumpPressed: false, timeTravelPressed: false });

    const caller = this.scene.get(this.callerKey);

    this.createHUD(caller);
    this.createLivesDisplay();

    const UIScale = 3;
    this.createButton(80,  380, 'left',       'leftButt',  UIScale);
    this.createButton(180, 380, 'right',       'rightButt', UIScale);
    this.createButton(720, 380, 'jump',        'jumpButt',  UIScale);

    if (!this.anims.exists('toPresent')) {
      this.anims.create({
        key: 'toPresent',
        frames: this.anims.generateFrameNumbers('timeButt', { frames: [12,11,10,9,8,7,6,5,4,3,2,1,0] }),
        frameRate: 16, repeat: 0,
      });
    }
    if (!this.anims.exists('toPast')) {
      this.anims.create({
        key: 'toPast',
        frames: this.anims.generateFrameNumbers('timeButt', { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12] }),
        frameRate: 16, repeat: 0,
      });
    }

    const travButton = this.createButton(610, 380, 'timeTravel', 'timeButt', 0.9 * UIScale);
    const onPeriodChanged = (period) => {
      if (travButton && travButton.anims) {
        travButton.play(period === 'present' ? 'toPresent' : 'toPast');
      }
    };
    caller.events.on('periodChanged', onPeriodChanged, this);

    this.createMenuButton(754, 24);

    this.events.once('shutdown', () => {
      this.registry.events.off('changedata-lives', null, this);
      caller.events.off('periodChanged', onPeriodChanged, this);
    });
  }

  createHUD(caller) {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(320, 10, 160, 40, 10);

    this.periodText = this.add.text(400, 30, 'PAST', {
      fontSize: '22px', color: '#ffcc00', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    caller.events.on('periodChanged', (period) => this.updateHUD(period), this);
  }

  updateHUD(period) {
    this.periodText.setText(period.toUpperCase());
    this.periodText.setColor(period === 'past' ? '#ffcc00' : '#44aaff');
  }

  createLivesDisplay() {
    this.livesGfx = this.add.graphics();
    this.drawLives(this.registry.get('lives') ?? 3);

    this.registry.events.on('changedata-lives', (parent, value) => {
      this.drawLives(value);
    }, this);
  }

  drawLives(count) {
    this.livesGfx.clear();
    for (let i = 0; i < 3; i++) {
      this.livesGfx.fillStyle(i < count ? 0xff4444 : 0x444444, 1);
      this.livesGfx.fillCircle(22 + i * 22, 30, 8);
    }
  }

  createMenuButton(x, y) {
    const size = 36;
    const gfx = this.add.graphics();

    const draw = (over) => {
      gfx.clear();
      gfx.fillStyle(0x000000, over ? 0.7 : 0.45);
      gfx.fillRoundedRect(x - size / 2, y - size / 2, size, size, 6);
      gfx.lineStyle(1, over ? 0x888888 : 0x555555, 1);
      gfx.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 6);
    };

    draw(false);
    this.add.text(x, y, '≡', {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5, 0.55);

    const zone = this.add.zone(x, y, size, size).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout',  () => draw(false));
    zone.on('pointerdown', () => {
      this.scene.launch('SettingsScene', { caller: this.callerKey });
      this.scene.bringToTop('SettingsScene');
    });
  }

  createButton(x, y, action, texture, scale = 1) {
    const button = this.add.sprite(x, y, texture).setScale(scale);
    const w = button.width  * button.scaleX;
    const h = button.height * button.scaleY;

    const drawBtn = (pressed) => button.setAlpha(pressed ? 1 : 0.75);
    drawBtn(false);

    const zone = this.add.zone(x, y, w, h).setInteractive();

    zone.on('pointerdown', () => {
      drawBtn(true);
      const input = this.registry.get('uiInput');
      if (action === 'left' || action === 'right') input[action] = true;
      else if (action === 'jump')       input.jumpPressed       = true;
      else if (action === 'timeTravel') input.timeTravelPressed = true;
    });

    const release = () => {
      drawBtn(false);
      const input = this.registry.get('uiInput');
      if (action === 'left' || action === 'right') input[action] = false;
    };

    zone.on('pointerup',  release);
    zone.on('pointerout', release);

    return button;
  }
}
