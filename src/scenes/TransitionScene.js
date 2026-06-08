// Simple fade transition for PoC
export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super('TransitionScene');
  }

  create(data) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, W, H);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 200,
      onUpdate: (t) => {
        overlay.clear();
        overlay.fillStyle(0x000000, t.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => {
        if (data.callback) data.callback();
        this.tweens.addCounter({
          from: 1,
          to: 0,
          duration: 200,
          onUpdate: (t) => {
            overlay.clear();
            overlay.fillStyle(0x000000, t.getValue());
            overlay.fillRect(0, 0, W, H);
          },
          onComplete: () => this.scene.stop()
        });
      }
    });
  }
}
