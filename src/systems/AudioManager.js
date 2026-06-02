export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.ctx = null;
    this.musicPlaying = false;
    this.bgMusic = null;
    this.masterVolume = 1;
  }

  setVolume(vol) {
    this.masterVolume = Math.min(Math.max(vol, 0), 1);
    if (this.bgMusic) this.bgMusic.setVolume(this.masterVolume * 0.5);
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  playTone(freq, duration, type = 'sine', volume = 0.1) {
    if (!this.enabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const scaledVolume = volume * this.masterVolume;
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(scaledVolume, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    this.playTone(400, 0.15, 'triangle', 0.1);
    setTimeout(() => this.playTone(600, 0.1, 'triangle', 0.08), 50);
  }

  // Short jarring descending blip — losing a life but surviving
  playHit() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
    gain.gain.setValueAtTime(0.15 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Three descending sawtooth tones — final game over
  playCaught() {
    if (!this.enabled || !this.ctx) return;
    [440, 330, 220].forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }, i * 200);
    });
  }

  // Ascending arpeggio — level clear
  playWin() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.35, 'triangle', 0.12), i * 110);
    });
  }

  playTimeSwitch() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    gain.gain.setValueAtTime(0.1 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  startMusic() {
    if (!this.enabled || this.musicPlaying) return;
    this.musicPlaying = true;

    // Use the loaded asset if available, otherwise fall back to the synth loop
    if (this.scene.cache.audio.exists('mainTheme')) {
      if (!this.bgMusic) {
        this.bgMusic = this.scene.sound.add('mainTheme', { loop: true, volume: this.masterVolume * 0.5 });
      }
      this.bgMusic.play();
    } else {
      this.playMusicLoop();
    }
  }

  playMusicLoop() {
    if (!this.musicPlaying) return;

    const notes = [262, 330, 392, 440, 392, 330];
    const pace = 500;

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
