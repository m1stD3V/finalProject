import GameScene from './GameScene.js';

export default class TutorialScene extends GameScene {
  constructor() {
    super('TutorialScene');
  }

  // getLevelConfig() inherited from GameScene — both use LEVELS[0]

  createPlayer() {
    super.createPlayer();
    // Render the player above the tutorial sign text
    this.player.depth += 1;
  }

  create() {
    super.create();
    this.addTutorialSigns();
  }

  addTutorialSigns() {
    const textRes = this.cameras.main.zoom * (window.devicePixelRatio || 1);
    const style = {
      fontSize: '9px', fill: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 6, y: 4 }, fontFamily: 'monospace',
    };
    const depth = this.player.depth - 1;

    this.welcomeSign = this.add.text(40, 100, 'Welcome Thief!', style)
      .setResolution(textRes);

    this.tutSign1 = this.add.text(
      this.welcomeSign.x,
      this.welcomeSign.y + this.welcomeSign.height,
      'Move by pressing the green\narrow buttons or by using the\narrow keys on your keyboard!',
      style
    ).setResolution(textRes).setDepth(depth);

    this.tutSign2 = this.add.text(160, 70,
      'Activate your clock by pressing the button\nor using the T key on your keyboard! Travel\nbetween the past and present to change your\nenvironment and sneak past the guards!',
      style
    ).setResolution(textRes).setDepth(depth);

    this.tutSign3 = this.add.text(500, 220, 'Watch out!', style)
      .setResolution(textRes).setDepth(depth);

    this.tutSign4 = this.add.text(400, 80,
      'Get that money bag! It\ncan only be picked up\nin a specific time period!',
      style
    ).setResolution(textRes).setDepth(depth);
  }
}
