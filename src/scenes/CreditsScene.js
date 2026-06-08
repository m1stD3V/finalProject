// Castle-themed credits screen for Time Thief
// Drop-in replacement for src/scenes/CreditsScene.js
// Shares the menu's look (sky, castle, torches) but quieter, with the team
// listed on a gold-trimmed stone plaque. Back -> MenuScene, unchanged.
export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const groundY = h - 54;

    this.buildSky(w, h);
    this.buildStars(w);
    this.buildMoon(620, 64);
    this.buildCastle(w, groundY);
    this.buildGround(w, h, groundY);

    this.buildTorch(132, 150);
    this.buildTorch(w - 132, 150);

    this.add.text(24, 22, 'CREDITS', {
      fontSize: '32px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold',
    }).setDepth(11).setShadow(2, 2, '#000000', 0);

    this.buildPlaque(w, h);
    this.buildVignette(w, h);

    this.createMenuButton(w / 2, h - 46, 'BACK', () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('MenuScene');
    });
  }

  // -- Shared scenery --------------------------------------------------------
  buildSky(w, h) {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x222a4a, 0x222a4a, 0x070912, 0x070912, 1);
    g.fillRect(0, 0, w, h);
  }

  buildStars(w) {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xcdd6f0, 1);
    const stars = [[60, 40], [140, 90], [560, 50], [690, 40], [440, 70], [780, 90]];
    for (const [x, y] of stars) g.fillCircle(x, y, Phaser.Math.Between(1, 2));
    for (const [x, y] of [[140, 90], [560, 50], [690, 40]]) {
      const s = this.add.circle(x, y, 1.6, 0xffffff).setDepth(1);
      this.tweens.add({
        targets: s, alpha: 0.25, duration: Phaser.Math.Between(900, 1600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 800),
      });
    }
  }

  buildMoon(x, y) {
    this.add.circle(x, y, 30, 0xece7d2, 0.16).setDepth(1);
    this.add.circle(x, y, 21, 0xece7d2).setDepth(2);
    this.add.circle(x + 8, y - 5, 16, 0x141a32, 0.55).setDepth(2);
  }

  buildCastle(w, groundY) {
    const g = this.add.graphics().setDepth(3);
    const win = 0xffb347;
    this.tower(g, -10, groundY, 150, 250, 0x05070f, win);
    this.tower(g, w - 140, groundY, 150, 274, 0x04050c, win);

    const keepW = 300, keepX = (w - keepW) / 2, keepH = 160;
    g.fillStyle(0x070a16, 1);
    g.fillRect(keepX, groundY - keepH, keepW, keepH);
    this.battlements(g, keepX, groundY - keepH, keepW, 30, 15, 0x070a16);

    g.fillStyle(win, 0.85);
    g.fillRect(keepX + 46, groundY - 104, 8, 14);
    g.fillRect(keepX + keepW - 54, groundY - 104, 8, 14);
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
    g.lineBetween(0, groundY + 6, w, groundY + 6);
  }

  buildTorch(x, y) {
    this.add.rectangle(x, y + 14, 6, 24, 0x3a2a12).setDepth(7);
    const glow = this.add.circle(x, y, 26, 0xff8c1e, 0.20).setDepth(6);
    const flame = this.add.ellipse(x, y - 4, 11, 17, 0xffb347).setDepth(8);
    const core = this.add.ellipse(x, y - 2, 5, 9, 0xfff1c0).setDepth(8);
    this.tweens.add({
      targets: [flame, core], scaleY: 1.3, scaleX: 0.85,
      duration: 220, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      delay: Phaser.Math.Between(0, 200),
    });
    this.tweens.add({
      targets: glow, alpha: 0.32, scale: 1.14,
      duration: 360, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
  }

  // -- Credits plaque --------------------------------------------------------
  buildPlaque(w, h) {
    const pw = w * 0.62, ph = 168;
    const px = (w - pw) / 2, py = h / 2 - ph / 2 - 6;

    const g = this.add.graphics().setDepth(9);
    g.fillStyle(0x0e1220, 0.82);
    g.fillRoundedRect(px, py, pw, ph, 10);
    g.lineStyle(2, 0xc9a23a, 1);
    g.strokeRoundedRect(px, py, pw, ph, 10);

    const cx = w / 2;
    this.add.text(cx, py + 28, '\u2014 DEVELOPED BY \u2014', {
      fontSize: '16px', color: '#f5c518', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(cx, py + 96,
      'Ernie Jennison  \u00b7  Waheed Khan\n\n' +
      'Evangel Hightower-Rojas  \u00b7  Serena Heath\n\n' +
      'Joshua Peterson',
      { fontSize: '17px', color: '#e7ebf5', fontFamily: 'monospace', align: 'center', lineSpacing: 6 }
    ).setOrigin(0.5).setDepth(10);
  }

  buildVignette(w, h) {
    const g = this.add.graphics().setDepth(10);
    const steps = 16, depth = 80, th = depth / steps + 1;
    for (let i = 0; i < steps; i++) {
      const inset = depth * (i / steps);
      g.fillStyle(0x05060d, 0.05);
      g.fillRect(inset, inset, w - 2 * inset, th);
      g.fillRect(inset, h - inset - th, w - 2 * inset, th);
      g.fillRect(inset, inset, th, h - 2 * inset);
      g.fillRect(w - inset - th, inset, th, h - 2 * inset);
    }
  }

  // -- Button (matches menu styling) -----------------------------------------
  createMenuButton(x, y, label, callback) {
    const bw = 200, bh = 48;
    const bg = this.add.graphics().setDepth(12);
    const draw = (over = false) => {
      bg.clear();
      bg.fillStyle(over ? 0x30374a : 0x262b3a, 1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
      bg.lineStyle(2, over ? 0xf5c518 : 0xc9a23a, 1);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
    };
    draw();

    const text = this.add.text(x, y, label, {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(13);

    const zone = this.add.zone(x, y, bw, bh).setDepth(14).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      draw(true);
      this.tweens.killTweensOf(text);
      this.tweens.add({ targets: text, scale: 1.04, duration: 90 });
    });
    zone.on('pointerout', () => {
      draw(false);
      this.tweens.killTweensOf(text);
      this.tweens.add({ targets: text, scale: 1, duration: 90 });
    });
    zone.on('pointerdown', () => { draw(true); callback(); });
    zone.on('pointerup', () => draw(false));
  }
}
