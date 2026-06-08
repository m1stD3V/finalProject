// Wraps the main game's fully-animated MenuScene.
// Overrides buildButtons so Start Game replays the cinematic intro
// rather than trying to launch gameplay scenes that aren't registered.
import BaseMenuScene from '../../../src/scenes/MenuScene.js';

export default class CinematicsMenuScene extends BaseMenuScene {
  buildButtons(w, h) {
    this.createMenuButton(w / 2, 252, 'REPLAY INTRO', true, () => {
      const audio = this.registry.get('audioManager');
      if (audio) audio.stopMusic();
      this.scene.start('PreloadScene');
    });
    this.createMenuButton(w / 2, 336, 'CREDITS', false, () => {
      const audio = this.registry.get('audioManager');
      if (audio) { audio.resume(); audio.startMusic(); }
      this.scene.start('CreditsScene');
    });
  }
}
