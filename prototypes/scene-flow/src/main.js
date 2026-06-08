// Scene Flow Prototype — Time Thief
// Shows every scene in the game and how they connect.
// All visuals are drawn with Phaser.Graphics — no external assets required.

// ─── Shared helpers ───────────────────────────────────────────────────────────

function bg(scene, color) {
  scene.add.rectangle(0, 0, 800, 448, color).setOrigin(0).setAlpha(0.85);
}

function label(scene, text, y = 80) {
  scene.add.text(400, y, text, {
    fontSize: '28px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5);
}

function sublabel(scene, text, y) {
  scene.add.text(400, y, text, {
    fontSize: '13px', color: '#9aa3b8', fontFamily: 'monospace'
  }).setOrigin(0.5);
}

function btn(scene, x, y, text, next, w = 220, primary = false) {
  const h = 48;
  const gfx = scene.add.graphics();
  const draw = (over) => {
    gfx.clear();
    gfx.fillStyle(over ? 0x30374a : 0x1c2030, 1);
    gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    gfx.lineStyle(2, over ? 0xf5c518 : (primary ? 0xc9a23a : 0x4a5168), 1);
    gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  };
  draw(false);
  scene.add.text(x, y, text, {
    fontSize: primary ? '18px' : '14px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5);
  const zone = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
  zone.on('pointerover', () => draw(true));
  zone.on('pointerout',  () => draw(false));
  zone.on('pointerdown', () => {
    if (typeof next === 'function') next();
    else scene.scene.start(next);
  });
}

function flowArrow(scene, x, y, label_text) {
  const g = scene.add.graphics();
  g.lineStyle(1, 0x4a5168, 0.7);
  g.lineBetween(x, y, x, y + 18);
  g.fillStyle(0x4a5168, 0.7);
  g.fillTriangle(x, y + 22, x - 5, y + 14, x + 5, y + 14);
  if (label_text) {
    scene.add.text(x + 8, y + 6, label_text, {
      fontSize: '10px', color: '#4a5168', fontFamily: 'monospace'
    });
  }
}

// ─── BootScene ────────────────────────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() { this.scene.start('PreloadScene'); }
}

// ─── PreloadScene ─────────────────────────────────────────────────────────────
class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }
  create() {
    bg(this, 0x05060d);
    label(this, 'PRELOAD', 100);
    sublabel(this, 'Studio logo animation  ·  Asset loading bar  ·  System init', 140);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRoundedRect(200, 200, 400, 16, 4);

    const bar = this.add.graphics();
    bar.fillStyle(0x44aaff);
    bar.fillRoundedRect(202, 202, 0, 12, 3);

    this.tweens.addCounter({
      from: 0, to: 396, duration: 1200,
      onUpdate: (t) => {
        bar.clear();
        bar.fillStyle(0x44aaff);
        bar.fillRoundedRect(202, 202, t.getValue(), 12, 3);
      },
      onComplete: () => {
        sublabel(this, '→ Transitions to MenuScene', 240);
        this.time.delayedCall(400, () => this.scene.start('MenuScene'));
      }
    });

    sublabel(this, 'Auto-advances to menu when done', 290);
  }
}

// ─── MenuScene ────────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    bg(this, 0x070912);
    label(this, 'MENU', 60);
    sublabel(this, 'Animated castle backdrop  ·  Title with glow  ·  Navigation buttons', 95);

    flowArrow(this, 400, 115);

    btn(this, 400, 155, '▶  START GAME', 'TutorialScene', 260, true);

    const row2y = 220;
    btn(this, 270, row2y, 'CREDITS', 'CreditsScene', 200);
    btn(this, 530, row2y, 'SETTINGS', () => {
      this.scene.launch('SettingsScene', { caller: 'MenuScene' });
    }, 200);

    sublabel(this, 'Settings overlays the current scene (does not navigate away)', 268);

    // Flow diagram
    const dy = 310;
    sublabel(this, 'Complete scene graph from menu:', dy);
    const items = [
      [160, dy + 34, 'TutorialScene'],
      [400, dy + 34, 'CreditsScene'],
      [640, dy + 34, 'SettingsScene (overlay)'],
    ];
    const g = this.add.graphics();
    g.lineStyle(1, 0x4a5168, 0.5);
    for (const [x] of items) g.lineBetween(400, dy + 18, x, dy + 28);
    for (const [x, y, t] of items) {
      this.add.text(x, y, t, { fontSize: '11px', color: '#9aa3b8', fontFamily: 'monospace' }).setOrigin(0.5);
    }
  }
}

// ─── TutorialScene ────────────────────────────────────────────────────────────
class TutorialScene extends Phaser.Scene {
  constructor() { super('TutorialScene'); }
  create() {
    bg(this, 0x0a0c14);
    label(this, 'TUTORIAL', 60);
    sublabel(this, 'Level 0 map  ·  In-world hint signs  ·  Guards present  ·  Same engine as levels', 95);

    const signs = [
      'Welcome Thief!',
      'Move with arrow keys / touch buttons',
      'Press T or ⚡ to switch time period',
      'Watch out for guards!',
      'Get that money bag!',
    ];
    signs.forEach((s, i) => {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(60, 140 + i * 38, 680, 30, 4);
      this.add.text(80, 155 + i * 38, s, {
        fontSize: '13px', color: '#ffffff', fontFamily: 'monospace'
      });
    });

    sublabel(this, 'Win condition → advances to Level 1', 350);
    flowArrow(this, 400, 368);
    btn(this, 400, 408, 'COMPLETE TUTORIAL →', 'Level0Scene', 280, true);
  }
}

// ─── Shared gameplay scene factory ────────────────────────────────────────────
function makeLevel(key, index, title, guards, periods, nextScene) {
  return class extends Phaser.Scene {
    constructor() { super(key); }
    create() {
      bg(this, 0x080b12);
      label(this, title, 50);
      sublabel(this, `Guards: ${guards}  ·  ${periods}  ·  Objective: switch to correct period + reach goal`, 85);

      // Mini map mockup
      const mx = 80, my = 110, mw = 640, mh = 140;
      const g = this.add.graphics();
      g.lineStyle(1, 0x2a3040, 1);
      g.strokeRect(mx, my, mw, mh);
      g.fillStyle(0x0d1020, 1);
      g.fillRect(mx, my, mw, mh);

      // Floor
      g.fillStyle(0x2a3040, 1);
      g.fillRect(mx, my + mh - 14, mw, 14);

      // Platforms (schematic)
      const plats = [[180, 60], [320, 90], [480, 50], [580, 75]];
      g.fillStyle(0x3a4560, 1);
      for (const [px, py] of plats) g.fillRect(mx + px - 30, my + mh - py, 60, 8);

      // Player
      g.fillStyle(0x4488ff, 1);
      g.fillRect(mx + 20, my + mh - 28, 10, 18);

      // Guards
      const gx = [280, 460, 560].slice(0, guards);
      g.fillStyle(0xff4444, 1);
      for (const x of gx) {
        g.fillRect(mx + x - 5, my + mh - 28, 10, 18);
        g.fillCircle(mx + x, my + mh - 32, 5);
      }

      // Objective
      g.fillStyle(0xffcc00, 0.9);
      g.fillRect(mx + mw - 30, my + 20, 14, 14);

      sublabel(this, `[past tiles]  [present tiles]  — ${periods}`, my + mh + 16);

      // Lives
      const ly = 270;
      sublabel(this, 'Lives:', 268);
      const lg = this.add.graphics();
      for (let i = 0; i < 3; i++) {
        lg.fillStyle(0xff4444, 1);
        lg.fillCircle(450 + i * 24, 274, 8);
      }

      sublabel(this, 'Settings menu accessible via ≡ button', 305);

      const nLabel = nextScene === 'MenuScene' ? 'FINISH — Return to Menu' : `LEVEL CLEAR → ${nextScene}`;
      flowArrow(this, 400, 328);
      btn(this, 400, 368, nLabel, nextScene, 320, true);

      // Game-over path
      sublabel(this, 'Game Over → restart level', 415);
      btn(this, 400, 428, 'GAME OVER (restart)', key, 220);
    }
  };
}

const Level0Scene = makeLevel('Level0Scene', 0, 'LEVEL 1',  1, 'PAST map / PRESENT map', 'Level1Scene');
const Level1Scene = makeLevel('Level1Scene', 1, 'LEVEL 2',  3, 'Long map, two time periods', 'Level2Scene');
const Level2Scene = makeLevel('Level2Scene', 2, 'LEVEL 3',  1, 'Vertical castle, two periods', 'Level3Scene');
const Level3Scene = makeLevel('Level3Scene', 3, 'LEVEL 4',  4, 'Complex routes, past objective', 'MenuScene');

// ─── CreditsScene ─────────────────────────────────────────────────────────────
class CreditsScene extends Phaser.Scene {
  constructor() { super('CreditsScene'); }
  create() {
    bg(this, 0x070912);
    label(this, 'CREDITS', 60);
    sublabel(this, 'Castle backdrop (shared with menu)  ·  Gold-trimmed team plaque', 95);

    const members = [
      ['Ernie Jennison',         'Architecture Lead'],
      ['Waheed Khan',            'UI & Visual Polish'],
      ['Evangel Hightower-Rojas','Tutorial & Credits'],
      ['Serena Heath',           'Level Design & Art'],
      ['Joshua Peterson',        'Audio & Art Lead'],
    ];

    const g = this.add.graphics();
    g.fillStyle(0x0e1220, 0.9);
    g.fillRoundedRect(160, 130, 480, 190, 10);
    g.lineStyle(2, 0xc9a23a, 1);
    g.strokeRoundedRect(160, 130, 480, 190, 10);

    this.add.text(400, 157, '— DEVELOPED BY —', {
      fontSize: '14px', color: '#f5c518', fontFamily: 'monospace'
    }).setOrigin(0.5);

    members.forEach(([name, role], i) => {
      this.add.text(246, 182 + i * 26, name, { fontSize: '13px', color: '#e7ebf5', fontFamily: 'monospace' });
      this.add.text(554, 182 + i * 26, role, { fontSize: '11px', color: '#9aa3b8', fontFamily: 'monospace' }).setOrigin(1, 0);
    });

    flowArrow(this, 400, 336);
    btn(this, 400, 376, '← BACK TO MENU', 'MenuScene', 220, true);
  }
}

// ─── SettingsScene ────────────────────────────────────────────────────────────
class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }
  init(data) { this.callerKey = data?.caller || 'MenuScene'; }
  create() {
    // Dim underlay
    this.add.rectangle(0, 0, 800, 448, 0x000000, 0.6).setOrigin(0);

    const g = this.add.graphics();
    g.fillStyle(0x14182a, 1);
    g.fillRoundedRect(230, 90, 340, 268, 12);
    g.lineStyle(2, 0xc9a23a, 1);
    g.strokeRoundedRect(230, 90, 340, 268, 12);

    this.add.text(400, 120, 'SETTINGS', {
      fontSize: '22px', color: '#f5c518', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    sublabel(this, 'Volume slider (persisted via localStorage)', 162);
    sublabel(this, 'MUSIC: ON / OFF (persisted)', 186);
    sublabel(this, 'FULLSCREEN toggle', 210);
    sublabel(this, 'RESET GAME → returns to Menu', 234);

    sublabel(this, `Opened from: ${this.callerKey}`, 270);
    sublabel(this, 'Pauses caller scene while open', 290);

    btn(this, 400, 330, 'BACK', () => {
      this.scene.stop();
      if (this.callerKey) this.scene.resume(this.callerKey);
    }, 180, true);
  }
}

// ─── Game config ──────────────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 448,
  parent: 'game-container',
  backgroundColor: '#05060d',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [
    BootScene, PreloadScene, MenuScene, TutorialScene,
    Level0Scene, Level1Scene, Level2Scene, Level3Scene,
    CreditsScene, SettingsScene
  ]
};

new Phaser.Game(config);
