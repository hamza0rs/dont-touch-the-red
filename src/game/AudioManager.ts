export class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicTimer: number | null = null;

  setEnabled(sound: boolean, music: boolean) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    if (!music) this.stopMusic();
  }

  private context(): AudioContext | null {
    if (!this.soundEnabled && !this.musicEnabled) return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(frequency: number, duration: number, type: OscillatorType, gainValue: number, channel: 'sound' | 'music' = 'sound') {
    if (channel === 'sound' && !this.soundEnabled) return;
    if (channel === 'music' && !this.musicEnabled) return;
    const ctx = this.context();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  start() {
    this.tone(260, 0.05, 'sine', 0.02);
    window.setTimeout(() => this.tone(410, 0.08, 'sine', 0.025), 55);
    if (this.musicEnabled) this.startMusic();
  }

  move() { this.tone(185, 0.035, 'square', 0.012); }
  click() { this.tone(320, 0.035, 'triangle', 0.01); }
  coin() { this.tone(740, 0.06, 'triangle', 0.018); }
  power() { this.tone(920, 0.08, 'triangle', 0.022); }
  hit() { this.tone(80, 0.18, 'sawtooth', 0.032); }
  combo() { this.tone(680, 0.06, 'sine', 0.016); window.setTimeout(() => this.tone(910, 0.06, 'sine', 0.012), 40); }
  gameOver() { this.tone(220, 0.11, 'sawtooth', 0.02); window.setTimeout(() => this.tone(110, 0.2, 'sawtooth', 0.025), 85); }
  record() { this.tone(520, 0.07, 'triangle', 0.018); window.setTimeout(() => this.tone(780, 0.07, 'triangle', 0.018), 80); }

  private startMusic() {
    if (this.musicTimer !== null) return;
    const notes = [220, 277, 330, 277, 247, 311, 370, 311];
    let index = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      this.tone(notes[index % notes.length], 0.12, 'triangle', 0.008, 'music');
      index += 1;
    }, 420);
  }

  private stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  destroy() {
    this.stopMusic();
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
  }
}
