// Import game scenes
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import TransitionScene from './scenes/TransitionScene.js';

// Simplified PoC configuration
const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 448,
  parent: 'game-container',
  backgroundColor: '#222222',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1100 },
      debug: false
    }
  },
  pixelArt: true,
  roundPixels: true,
  antiAlias: false,
  autoRound:true,
  resolution: window.devicePixelRatio || 1,
  scene: [BootScene, PreloadScene, MenuScene, SettingsScene, CreditsScene, TutorialScene, GameScene, UIScene, TransitionScene]
};

new Phaser.Game(config);