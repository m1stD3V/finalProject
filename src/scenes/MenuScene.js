// Time Thief menu — added moon and stars
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const groundY = h - 92;

    this.buildSky(w, h);
    this.buildStars(w, h);
    this.buildMoon(620, 70);
    this.buildCastle(w, groundY);
    this.buildGround(w, h, groundY);
    this.buildTitle(w, h);
    this.buildButtons(w, h);
  }

  buildSky(w, h) {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x222a4a, 0x222a4a, 0x070912, 0x070912, 1);
    g.fillRect(0, 0, w, h);
  }

  buildStars(w, h) {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xcdd6f0, 1);
    const stars = [
      [60, 40], [140, 90], [210, 50], [300, 110], [360, 60], [430, 95],
      [500, 45], [560, 130], [690, 55], [740, 110], [90, 150], [780, 60],
    ];
    for (const [x, y] of stars) g.fillCircle(x, y, Phaser.Math.Between(1, 2));
    for (const [x, y] of [[140, 90], [430, 95], [690, 55]]) {
      const s = this.add.circle(x, y, 1.6, 0xffffff).setDepth(1);
      this.tweens.add({
        targets: s, alpha: 0.2, duration: Phaser.Math.Between(900, 1600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 800),
      });
    }
  }

  buildMoon(x, y) {
    this.add.circle(x, y, 34, 0xece7d2, 0.16).setDepth(1);
    this.add.circle(x, y, 24, 0xece7d2).setDepth(2);
    this.add.circle(x + 9, y - 6, 19, 0x141a32, 0.55).setDepth(2);
  }

  buildCastle(w, groundY) {
    const g = this.add.graphics().setDepth(3);
    const win = 0xffb347;
    this.tower(g, -10, groundY, 150, 230, 0x05070f, win);
    this.tower(g, w - 140, groundY, 150, 252, 0x04050c, win);

    const keepW = 260, keepX = (w - keepW) / 2, keepH = 150;
    g.fillStyle(0x070a16, 1);
    g.fillRect(keepX, groundY - keepH, keepW, keepH);
    this.battlements(g, keepX, groundY - keepH, keepW, 28, 15, 0x070a16);

    g.fillStyle(0x05060d, 1);
    g.fillRect(keepX + keepW / 2 - 28, groundY - 70, 56, 70);
    g.fillCircle(keepX + keepW / 2, groundY - 70, 28);

    g.fillStyle(win, 0.85);
    g.fillRect(keepX + 40, groundY - 96, 8, 14);
    g.fillRect(keepX + keepW - 48, groundY - 96, 8, 14);
  }

  tower(g, x, groundY, towerW, towerH, color, win) {
    g.fillStyle(color, 1);
    g.fillRect(x, groundY - towerH, towerW, towerH);
    this.battlements(g, x, groundY - towerH, towerW, 24, 13, color);
    g.fillStyle(win, 0.8);
    g.fillRect(x + towerW / 2 - 4, groundY - towerH + 70, 8, 14);
  }

  battlements(g, x, topY, width, merlonW, merlonH, color) {
    g.fillStyle(color, 1);
    for (let mx = x; mx < x + width; mx += merlonW * 2) {
      g.fillRect(mx, topY - merlonH, merlonW, merlonH);
    }
  }

  buildGround(w, h, groundY) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x0a0d1c, 1);
    g.fillRect(0, groundY, w, h - groundY);
    g.lineStyle(1, 0x161a2b, 0.8);
    for (let x = 0; x < w; x += 48) g.lineBetween(x, groundY + 6, x, h);
    g.lineBetween(0, groundY + 6, w, groundY + 6);
  }

  buildTitle(w, h) {
    this.add.text(w / 2 + 5, 102, 'TIME THIEF', {
      fontSize: '64px', color: '#000000', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10).setAlpha(0.5);
    this.add.text(w / 2, 96, 'TIME THIEF', {
      fontSize: '64px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);
    this.add.text(w / 2, 152, 'Proof of Concept', {
      fontSize: '18px', color: '#9aa3b8', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(11);
  }

  buildButtons(w, h) {
    this.createMenuButton(w / 2, 252, 'START GAME', () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('Level0Scene');
    });
    this.createMenuButton(w / 2 - 120, 330, 'CREDITS', () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('CreditsScene');
    });
    this.createMenuButton(w / 2 + 120, 330, 'SETTINGS', () => {
      this.scene.launch('SettingsScene', { caller: 'MenuScene' });
    });
  }

  createMenuButton(x, y, label, callback) {
    const bg = this.add.graphics().setDepth(12);
    const draw = (over = false) => {
      bg.clear();
      bg.fillStyle(over ? 0x555555 : 0x333333);
      bg.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
      bg.lineStyle(2, over ? 0x44aaff : 0x666666);
      bg.strokeRoundedRect(x - 120, y - 30, 240, 60, 10);
    };
    draw();
    const text = this.add.text(x, y, label, {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(13);
    const zone = this.add.zone(x, y, 240, 60).setDepth(14).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', callback);
  }
}
