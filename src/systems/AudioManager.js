// Polished AudioManager for PoC
// Generates pleasant synthesized tones using the Web Audio API
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.ctx = null;
    this.musicPlaying = false;
    this.bgMusic = null;
  }

  // Initialize AudioContext
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      this.enabled = false;
    }
  }

  // Resume context (required after user interaction)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a synthesized tone with volume envelope
  playTone(freq, duration, type = 'sine', volume = 0.1) {
    if (!this.enabled || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Quick attack and smooth decay
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Bubbly jump sound
  playJump() {
    this.playTone(400, 0.15, 'triangle', 0.1);
    setTimeout(() => this.playTone(600, 0.1, 'triangle', 0.08), 50);
  }

  // Swish sound for time travel
  playTimeSwitch() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Looping background music
  startMusic() {
    if (!this.enabled || this.musicPlaying) return;

    if (!this.bgMusic) {
      this.bgMusic = this.scene.sound.add('mainTheme', {
        loop: true,
        volume: 0.5
      });
    }

    this.bgMusic.play();
    this.musicPlaying = true;
  }

  // Simple 4-bar minimalist loop
  playMusicLoop() {
    if (!this.musicPlaying) return;
    
    const notes = [262, 330, 392, 440, 392, 330]; // C, E, G, A, G, E
    const pace = 500; // ms per note

    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.musicPlaying) this.playTone(freq, 0.4, 'sine', 0.03);
      }, i * pace);
    });

    this.musicTimer = setTimeout(() => this.playMusicLoop(), notes.length * pace);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.bgMusic) this.bgMusic.stop();
    clearTimeout(this.musicTimer);
  }
}
