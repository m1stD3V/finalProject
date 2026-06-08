import PreloadScene from './PreloadScene.js';
import CinematicsMenuScene from './MenuScene.js';
import CreditsScene from '../../../src/scenes/CreditsScene.js';

// Three animated cinematics demonstrated here:
//   1. Studio intro  — monkey logo tween chain (PreloadScene)
//   2. Title screen  — procedural animated castle: clock, torches, embers, fog (MenuScene)
//   3. Credits       — castle backdrop with gold-trimmed team plaque (CreditsScene)

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 448,
  parent: 'game-container',
  backgroundColor: '#000000',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  pixelArt: true,
  roundPixels: true,
  input: { activePointers: 4 },
  scene: [PreloadScene, CinematicsMenuScene, CreditsScene]
};

new Phaser.Game(config);
