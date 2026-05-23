// Base class for all game objects in Time Thief
// Extends Phaser's Arcade Sprite to provide physics and period-specific visibility
export default class GameObject extends Phaser.Physics.Arcade.Sprite {
  // @param {Phaser.Scene} scene - The scene this object belongs to
  // @param {number} x - Horizontal position
  // @param {number} y - Vertical position
  // @param {string} texture - The texture key to use for this object
  // @param {Object} config - Configuration object
  // @param {string} [config.period='both'] - The time period this object exists in ('past', 'present', or 'both')
  // @param {string} [config.type='generic'] - A string identifying the type of object
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture);
    
    // Add this object to the scene's update list and display list
    scene.add.existing(this);
    // Add physics body to this object
    scene.physics.add.existing(this);
    
    // Period-specific properties
    this.period = config.period || 'both';
    this.objectType = config.type || 'generic';
    this.persistentState = config.persistentState || null;
  }

  // Handle visibility and physics state when the time period changes
  // @param {string} newPeriod - The new time period ('past' or 'present')
  onPeriodChange(newPeriod) {
    const visible = this.period === 'both' || this.period === newPeriod;
    this.setVisible(visible);
    
    // Enable or disable physics based on period visibility
    if (this.body) {
      this.body.enable = visible;
    }
  }

  // Check if this object is active in a specific period
  // @param {string} period - The period to check
  // @returns {boolean} True if the object should be active
  isActiveInPeriod(period) {
    return this.period === 'both' || this.period === period;
  }
}
