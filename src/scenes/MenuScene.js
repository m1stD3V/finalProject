// Time Thief menu — embers, fog, parallax, and vignette polish
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
    this.buildClock(w / 2, 138, 86);
    this.buildCastle(w, groundY);
    this.buildGateRift(w / 2, groundY - 36);
    this.buildGround(w, h, groundY);
    this.buildFog(w, groundY);

    this.buildTorch(96, groundY - 70);
    this.buildTorch(w - 96, groundY - 70);

    this.buildThief(190, groundY);
    this.buildTitle(w, h);
    this.buildVignette(w, h);
    this.buildButtons(w, h);
  }

  buildSky(w, h) {
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x222a4a, 0x222a4a, 0x070912, 0x070912, 1);
    g.fillRect(0, 0, w, h);

    const rift = this.add.ellipse(w / 2, h * 0.30, w * 0.34, h * 0.9, 0x6a55dc, 0.10).setDepth(1);
    this.tweens.add({
      targets: rift, alpha: 0.2, scaleX: 1.1,
      duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
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

  buildClock(cx, cy, r) {
    const gold = 0xf5c518, depth = 2, alpha = 0.18;

    const g = this.add.graphics().setDepth(depth).setAlpha(alpha);
    g.lineStyle(2, gold, 1);
    g.strokeCircle(cx, cy, r);
    g.strokeCircle(cx, cy, r * 0.8);

    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    numerals.forEach((n, i) => {
      const a = Phaser.Math.DegToRad(i * 30);
      const nx = cx + Math.sin(a) * (r * 0.88);
      const ny = cy - Math.cos(a) * (r * 0.88);
      this.add.text(nx, ny, n, {
        fontSize: '12px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(depth).setAlpha(alpha);
    });

    const minute = this.add.rectangle(cx, cy, 2.5, r * 0.66, gold)
      .setOrigin(0.5, 1).setDepth(depth).setAlpha(alpha);
    const hour = this.add.rectangle(cx, cy, 3, r * 0.48, gold)
      .setOrigin(0.5, 1).setDepth(depth).setAlpha(alpha * 0.8);
    this.add.circle(cx, cy, 4, gold).setDepth(depth).setAlpha(alpha);

    this.tweens.add({ targets: minute, angle: 360, duration: 9000, repeat: -1 });
    this.tweens.add({ targets: hour, angle: 360, duration: 54000, repeat: -1 });
  }

  buildCastle(w, groundY) {
    const g = this.add.graphics().setDepth(3);
    const win = 0xffb347;

    g.fillStyle(0x0a0e1e, 1);
    g.fillRect(w * 0.06, groundY - 170, w * 0.18, 170);
    g.fillRect(w * 0.76, groundY - 188, w * 0.18, 188);

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

  buildGateRift(cx, cy) {
    const layers = [
      this.add.ellipse(cx, cy, 60, 90, 0x5a96e6, 0.18).setDepth(4),
      this.add.ellipse(cx, cy, 40, 64, 0x966beb, 0.30).setDepth(4),
      this.add.ellipse(cx, cy, 22, 40, 0xc8b6ff, 0.45).setDepth(4),
    ];
    this.tweens.add({
      targets: layers, scaleX: 1.18, alpha: '+=0.12',
      duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
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

  buildFog(w, groundY) {
    const mkFog = (y, alpha, color) => {
      const f = this.add.ellipse(w / 2, y, w * 1.3, 70, color, alpha).setDepth(6);
      this.tweens.add({
        targets: f, x: w / 2 + 40,
        duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    };
    mkFog(groundY + 6, 0.10, 0x8090b4);
    mkFog(groundY + 40, 0.07, 0x8090b4);
  }

  buildTorch(x, y) {
    this.add.rectangle(x, y + 14, 6, 26, 0x3a2a12).setDepth(7);
    const glow = this.add.circle(x, y, 28, 0xff8c1e, 0.22).setDepth(6);
    const flame = this.add.ellipse(x, y - 4, 11, 17, 0xffb347).setDepth(8);
    const core = this.add.ellipse(x, y - 2, 5, 9, 0xfff1c0).setDepth(8);

    this.tweens.add({
      targets: [flame, core], scaleY: 1.3, scaleX: 0.85,
      duration: 220, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      delay: Phaser.Math.Between(0, 200),
    });
    this.tweens.add({
      targets: glow, alpha: 0.34, scale: 1.14,
      duration: 360, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    for (let i = 0; i < 3; i++) {
      const ember = this.add.circle(x + Phaser.Math.Between(-3, 3), y, 1.5, 0xffb347).setDepth(8);
      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(40, 60),
        x: x + Phaser.Math.Between(-8, 8),
        alpha: 0,
        duration: Phaser.Math.Between(1600, 2600),
        repeat: -1,
        delay: i * 700,
        onRepeat: () => { ember.y = y; ember.alpha = 0.9; },
      });
    }
  }

  buildThief(x, groundY) {
    this.add.ellipse(x, groundY - 2, 70, 14, 0x000000, 0.35).setDepth(8);

    const thief = this.add.sprite(x, groundY - 2, 'player')
      .setOrigin(0.5, 1).setScale(3.5).setDepth(9).setFlipX(true);
    if (this.anims.exists('idle')) thief.play('idle');

    this.tweens.add({
      targets: thief, y: groundY - 5,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
  }

  buildTitle(w, h) {
    const style = { fontSize: '64px', fontFamily: 'monospace', fontStyle: 'bold' };

    this.add.text(w / 2 + 5, 96 + 6, 'TIME THIEF', { ...style, color: '#000000' })
      .setOrigin(0.5).setDepth(10).setAlpha(0.6);

    const title = this.add.text(w / 2, 96, 'TIME THIEF', { ...style, color: '#f5c518' })
      .setOrigin(0.5).setDepth(11);
    title.setShadow(0, 0, '#f5c518', 18, false, true);

    const glint = this.add.text(w / 2, 96, 'TIME THIEF', { ...style, color: '#fff6c8' })
      .setOrigin(0.5).setDepth(11).setAlpha(0);
    this.tweens.add({
      targets: glint, alpha: 0.55,
      duration: 280, yoyo: true, hold: 60, repeat: -1, repeatDelay: 3200, ease: 'Sine.inOut',
    });

    this.add.text(w / 2, 152, '- SLIP BETWEEN PAST AND PRESENT -', {
      fontSize: '15px', color: '#9aa3b8', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(11);

    this.tweens.add({
      targets: [title, glint], y: 92,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
  }

  buildVignette(w, h) {
    const g = this.add.graphics().setDepth(10);
    const steps = 16, depth = 90, th = depth / steps + 1;
    for (let i = 0; i < steps; i++) {
      const inset = depth * (i / steps);
      g.fillStyle(0x05060d, 0.05);
      g.fillRect(inset, inset, w - 2 * inset, th);
      g.fillRect(inset, h - inset - th, w - 2 * inset, th);
      g.fillRect(inset, inset, th, h - 2 * inset);
      g.fillRect(w - inset - th, inset, th, h - 2 * inset);
    }
  }

  buildButtons(w, h) {
    this.createMenuButton(w / 2, 252, 'START GAME', true, () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('Level0Scene');
    });
    this.createMenuButton(w / 2 - 120, 330, 'CREDITS', false, () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('CreditsScene');
    });
    this.createMenuButton(w / 2 + 120, 330, 'SETTINGS', false, () => {
      this.scene.launch('SettingsScene', { caller: 'MenuScene' });
    });
  }

  createMenuButton(x, y, label, primary, callback) {
    const bw = primary ? 260 : 200;
    const bh = primary ? 56 : 48;

    const bg = this.add.graphics().setDepth(12);
    const draw = (over = false) => {
      bg.clear();
      bg.fillStyle(over ? (primary ? 0x30374a : 0x262c3e) : (primary ? 0x262b3a : 0x1c2030), 1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
      bg.lineStyle(2, over ? 0xf5c518 : (primary ? 0xc9a23a : 0x4a5168), 1);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 8);
    };
    draw();

    const text = this.add.text(x, y, label, {
      fontSize: primary ? '26px' : '20px',
      color: primary ? '#ffffff' : '#d7dbe6',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(13);

    const zone = this.add.zone(x, y, bw, bh).setDepth(14).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      draw(true); text.setColor('#ffffff');
      this.tweens.add({ targets: [bg, text], scale: 1.04, duration: 90 });
    });
    zone.on('pointerout', () => {
      draw(false); text.setColor(primary ? '#ffffff' : '#d7dbe6');
      this.tweens.add({ targets: [bg, text], scale: 1, duration: 90 });
    });
    zone.on('pointerdown', callback);
  }
}
