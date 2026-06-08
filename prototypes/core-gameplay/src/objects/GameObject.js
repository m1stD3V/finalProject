export default class GameObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.period = config.period || 'both';
    this.objectType = config.type || 'generic';
  }

  onPeriodChange(newPeriod) {
    const visible = this.period === 'both' || this.period === newPeriod;
    this.setVisible(visible);
    if (this.body) this.body.enable = visible;
  }
}
