type SfxName = "jump" | "coin" | "hit" | "stomp" | "clear" | "power" | "swing" | "blast" | "land" | "explode" | "ui";

export class GameAudio {
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private musicTimer = 0;
  private musicStep = 0;
  private world = 0;
  private playingMusic = false;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx.gain.value = 0.7;
      this.music.gain.value = 0.18;
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.applyMute();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyMute();
  }

  private applyMute() {
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.02);
  }

  play(name: SfxName) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const c = this.ctx;
    const now = c.currentTime;
    const burst = (freqs: number[], dur: number, type: OscillatorType, vol = 0.12) => {
      freqs.forEach((hz, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.value = hz * (1 + (Math.random() * 2 - 1) * 0.03);
        g.gain.setValueAtTime(vol, now + i * 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + dur);
        o.connect(g);
        g.connect(this.sfx!);
        o.start(now + i * 0.03);
        o.stop(now + i * 0.03 + dur + 0.02);
      });
    };
    switch (name) {
      case "jump":
        burst([340, 520], 0.12, "triangle", 0.1);
        break;
      case "coin":
        burst([880, 1320], 0.1, "square", 0.07);
        break;
      case "hit":
        burst([180, 90], 0.18, "sawtooth", 0.1);
        break;
      case "stomp":
        burst([220, 110], 0.14, "square", 0.11);
        break;
      case "clear":
        burst([523, 659, 784, 1046], 0.22, "triangle", 0.1);
        break;
      case "power":
        burst([440, 554, 659], 0.16, "triangle", 0.09);
        break;
      case "swing":
        burst([140, 90], 0.08, "sawtooth", 0.07);
        break;
      case "blast":
        burst([620, 280], 0.09, "square", 0.08);
        break;
      case "land":
        burst([90], 0.08, "sine", 0.06);
        break;
      case "explode":
        burst([160, 80, 40], 0.22, "sawtooth", 0.1);
        break;
      case "ui":
        burst([520], 0.07, "sine", 0.06);
        break;
    }
  }

  startMusic(world: number) {
    this.world = world;
    this.playingMusic = true;
    this.musicStep = 0;
  }

  stopMusic() {
    this.playingMusic = false;
  }

  tick(dt: number) {
    if (!this.playingMusic || !this.ctx || !this.music || this.muted) return;
    this.musicTimer += dt;
    const step = 0.28;
    if (this.musicTimer < step) return;
    this.musicTimer -= step;
    const scales = [
      [196, 247, 294, 330, 392, 494],
      [165, 196, 220, 262, 330, 392],
      [147, 175, 220, 262, 330, 440],
      [185, 220, 277, 330, 370, 440],
      [165, 196, 247, 294, 370, 440],
      [131, 156, 196, 233, 311, 392],
      [196, 233, 294, 349, 415, 523],
      [175, 220, 262, 330, 392, 523],
      [147, 175, 220, 294, 370, 440],
      [110, 147, 185, 220, 277, 370],
    ];
    const scale = scales[this.world] ?? scales[0];
    const note = scale[this.musicStep % scale.length]!;
    this.musicStep += 1;
    const c = this.ctx;
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = note;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    o.connect(g);
    g.connect(this.music);
    o.start(now);
    o.stop(now + 0.28);
  }
}
