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

    // Dim the scene underneath (keeps the castle menu faintly visible behind)
    const dim = this.add.graphics();
    dim.fillStyle(0x05060d, 0.74);
    dim.fillRect(0, 0, W, H);

    // Panel — stone with gold trim
    const pw = 340, ph = 350;
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x14182a, 1);
    panel.fillRoundedRect(px, py, pw, ph, 12);
    panel.lineStyle(2, 0xc9a23a, 1);
    panel.strokeRoundedRect(px, py, pw, ph, 12);

    this.add.text(W / 2, py + 32, 'SETTINGS', {
      fontSize: '26px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(2, 2, '#000000', 0);

    // Gold divider
    const div = this.add.graphics();
    div.lineStyle(2, 0xc9a23a, 0.7);
    div.lineBetween(px + 28, py + 58, px + pw - 28, py + 58);

    this.add.text(W / 2, py + 85, 'VOLUME', {
      fontSize: '12px', color: '#9aa3b8', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.createVolumeSlider(W / 2, py + 120);

    // Reset always nukes all game scenes and returns to menu
    this.createButton(W / 2, py + 200, 'RESET GAME', true, () => {
      [...SettingsScene.GAMEPLAY_SCENES, 'SettingsScene', 'UIScene', 'TransitionScene'].forEach(key => {
        if (this.scene.isActive(key) || this.scene.isPaused(key)) this.scene.stop(key);
      });
      this.scene.start('MenuScene');
    });

    this.createButton(W / 2, py + 255, `FULLSCREEN: ${(this.scale.isFullscreen) ? "ON" : "OFF"}`, false, () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.createButton(W / 2, py + 310, 'BACK', false, () => this.close());

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
      fontSize: '12px', color: '#f5c518', fontFamily: 'monospace'
    }).setOrigin(0, 0.5);

    const x0 = cx - trackW / 2;

    const redraw = (rawX) => {
      vol = Math.min(Math.max((rawX - x0) / trackW, 0), 1);
      const hx = x0 + vol * trackW;

      gfx.clear();
      gfx.fillStyle(0x2a2f42, 1);
      gfx.fillRoundedRect(x0, cy - trackH / 2, trackW, trackH, 3);
      gfx.fillStyle(0xf5c518, 1);
      gfx.fillRoundedRect(x0, cy - trackH / 2, vol * trackW, trackH, 3);
      gfx.fillStyle(0xf5c518, 1);
      gfx.fillCircle(hx, cy, 9);
      gfx.fillStyle(0xfff1c0, 1);
      gfx.fillCircle(hx, cy, 4);

      valueLabel.setText(`${Math.round(vol * 100)}%`);
      if (audio) audio.setVolume(vol);
    };

    redraw(x0 + initial * trackW);

    const zone = this.add.zone(cx, cy, trackW + 20, 32).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (ptr) => { dragging = true; redraw(ptr.x); });
    this.input.on('pointermove', (ptr) => { if (dragging) redraw(ptr.x); });
    this.input.on('pointerup', () => { dragging = false; });
  }

  // danger=true -> red-toned (Reset); otherwise gold-trimmed stone
  createButton(x, y, label, danger, callback) {
    const bw = 220, bh = 44;
    const fill = danger ? 0x3a1416 : 0x1c2030;
    const fillOver = danger ? 0x4a1a1c : 0x262c3e;
    const trim = danger ? 0xc0524f : 0xc9a23a;
    const trimOver = danger ? 0xff7a7a : 0xf5c518;
    const baseColor = danger ? '#ff9a9a' : '#d7dbe6';

    const gfx = this.add.graphics();
    const draw = (over) => {
      gfx.clear();
      gfx.fillStyle(over ? fillOver : fill, 1);
      gfx.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
      gfx.lineStyle(2, over ? trimOver : trim, 1);
      gfx.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
    };
    draw(false);

    const text = this.add.text(x, y, label, {
      fontSize: '15px', color: baseColor, fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, bw, bh).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { draw(true); text.setColor('#ffffff'); });
    zone.on('pointerout', () => { draw(false); text.setColor(baseColor); });
    zone.on('pointerdown', callback);

    return text;
  }
}
