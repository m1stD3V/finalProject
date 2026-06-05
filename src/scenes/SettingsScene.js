export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.callerKey = data.caller || 'SettingsScene';
  }

  static get GAMEPLAY_SCENES() {
    return ['GameScene', 'TutorialScene', 'Level0Scene', 'Level1Scene', 'Level2Scene', 'Level3Scene'];
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const inGame = SettingsScene.GAMEPLAY_SCENES.includes(this.callerKey);

    // Dim the scene underneath
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.78);
    dim.fillRect(0, 0, W, H);

    // Panel
    const pw = 340, ph = 350;
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1c1c1c, 1);
    panel.fillRoundedRect(px, py, pw, ph, 12);
    panel.lineStyle(2, 0x444444, 1);
    panel.strokeRoundedRect(px, py, pw, ph, 12);

    this.add.text(W / 2, py + 32, 'SETTINGS', {
      fontSize: '26px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    const div = this.add.graphics();
    div.lineStyle(1, 0x3a3a3a, 1);
    div.lineBetween(px + 24, py + 58, px + pw - 24, py + 58);

    this.add.text(W / 2, py + 85, 'VOLUME', {
      fontSize: '12px', color: '#888888', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.createVolumeSlider(W / 2, py + 120);

    // Reset always nukes all game scenes and returns to menu
    this.createButton(W / 2, py + 200, 'RESET GAME', 0x4a1a1a, '#ff8888', () => {
      [...SettingsScene.GAMEPLAY_SCENES, 'SettingsScene', 'UIScene', 'TransitionScene'].forEach(key => {
        if (this.scene.isActive(key) || this.scene.isPaused(key)) this.scene.stop(key);
      });
      this.scene.start('MenuScene');
    });

    this.createButton(W / 2, py + 255, `FULLSCREEN: ${(this.scale.isFullscreen) ? "ON" : "OFF"}`, 0x2a2a2a, '#cccccc', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.createButton(W / 2, py + 310, 'BACK', 0x2a2a2a, '#cccccc', () => this.close());

    this.input.keyboard.once('keydown-ESC', () => this.close());

    if (inGame) this.scene.pause(this.callerKey);
  }

  close() {
    const inGame = SettingsScene.GAMEPLAY_SCENES.includes(this.callerKey);
    if (inGame) {
      // Clear stale mobile input so the player doesn't lurch on resume
      const ui = this.registry.get('uiInput');
      if (ui) Object.assign(ui, { left: false, right: false, jumpPressed: false, timeTravelPressed: false });
      this.scene.resume(this.callerKey);
    }
    this.scene.stop();
  }

  createVolumeSlider(cx, cy) {
    const trackW = 200, trackH = 6;
    const audio = this.registry.get('audioManager');
    const initial = audio ? audio.masterVolume : 1;
    let dragging = false;
    let vol = initial;

    const gfx = this.add.graphics();
    const valueLabel = this.add.text(cx + 118, cy, '', {
      fontSize: '12px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0, 0.5);

    const x0 = cx - trackW / 2;

    const redraw = (rawX) => {
      vol = Math.min(Math.max((rawX - x0) / trackW, 0), 1);
      const hx = x0 + vol * trackW;

      gfx.clear();
      gfx.fillStyle(0x3a3a3a, 1);
      gfx.fillRoundedRect(x0, cy - trackH / 2, trackW, trackH, 3);
      gfx.fillStyle(0x44aaff, 1);
      gfx.fillRoundedRect(x0, cy - trackH / 2, vol * trackW, trackH, 3);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(hx, cy, 9);

      valueLabel.setText(`${Math.round(vol * 100)}%`);
      if (audio) audio.setVolume(vol);
    };

    redraw(x0 + initial * trackW);

    const zone = this.add.zone(cx, cy, trackW + 20, 32).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (ptr) => { dragging = true; redraw(ptr.x); });
    this.input.on('pointermove', (ptr) => { if (dragging) redraw(ptr.x); });
    this.input.on('pointerup', () => { dragging = false; });
  }

  createButton(x, y, label, bgHex, textColor, callback) {
    const bw = 220, bh = 44;
    const gfx = this.add.graphics();

    const draw = (over) => {
      gfx.clear();
      gfx.fillStyle(bgHex, 1);
      gfx.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
      gfx.lineStyle(2, over ? 0x888888 : 0x404040, 1);
      gfx.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
    };

    draw(false);
    this.add.text(x, y, label, {
      fontSize: '15px', color: textColor, fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, bw, bh).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', callback);
  }
}
