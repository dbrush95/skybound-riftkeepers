const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyE",
  "KeyQ",
  "KeyF",
  "KeyJ",
  "KeyK",
  "KeyP",
  "Escape",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Tab",
  "Enter",
  "KeyM",
  "KeyC",
  "BracketLeft",
  "BracketRight",
]);

export type TouchActions = {
  jump: boolean;
  wrench: boolean;
  blaster: boolean;
  sprint: boolean;
  cycle: boolean;
};

function radialDeadzone(x: number, y: number, dz = 0.2) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  const nx = x * scale;
  const ny = y * scale;
  const mag = Math.hypot(nx, ny);
  if (mag < 1e-4) return { x: 0, y: 0 };
  const curved = Math.pow(Math.min(1, mag), 1.35);
  return { x: (nx / mag) * curved, y: (ny / mag) * curved };
}

export class Input {
  keys = new Set<string>();
  injected: string[] | null = null;
  touchX = 0;
  touchY = 0;
  private touchTargetX = 0;
  private touchTargetY = 0;
  touch: TouchActions = { jump: false, wrench: false, blaster: false, sprint: false, cycle: false };
  camX = 0;
  jumpQueued = 0;
  attackQueued = 0;
  shootQueued = 0;
  cycleQueued = 0;
  cycleDir = 1;
  just = new Set<string>();
  private prevHeld = new Set<string>();
  private prevTouchJump = false;
  private prevTouchWrench = false;
  private prevTouchCycle = false;
  private prevPadJump = false;
  private prevPadCycle = false;
  private unsubs: Array<() => void> = [];

  attach() {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (GAME_CODES.has(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    const clear = () => this.keys.clear();
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      this.cycleDir = e.deltaY > 0 ? 1 : -1;
      this.cycleQueued = 0.16;
      e.preventDefault();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    window.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.keys.clear();
    });
    this.unsubs.push(
      () => window.removeEventListener("keydown", down),
      () => window.removeEventListener("keyup", up),
      () => window.removeEventListener("blur", clear),
      () => window.removeEventListener("wheel", wheel),
    );
  }

  dispose() {
    for (const u of this.unsubs) u();
    this.unsubs = [];
  }

  setKeys(codes: string[]) {
    this.injected = codes.length ? codes : null;
  }

  setTouchStick(x: number, y: number) {
    const v = radialDeadzone(x, y, 0.18);
    this.touchTargetX = v.x;
    this.touchTargetY = v.y;
  }

  held(code: string) {
    if (this.injected) return this.injected.includes(code);
    return this.keys.has(code);
  }

  pressed(code: string) {
    return this.just.has(code);
  }

  tick(dt: number) {
    this.jumpQueued = Math.max(0, this.jumpQueued - dt);
    this.attackQueued = Math.max(0, this.attackQueued - dt);
    this.shootQueued = Math.max(0, this.shootQueued - dt);
    this.cycleQueued = Math.max(0, this.cycleQueued - dt);

    const k = 1 - Math.exp(-14 * dt);
    this.touchX += (this.touchTargetX - this.touchX) * k;
    this.touchY += (this.touchTargetY - this.touchY) * k;
    if (Math.hypot(this.touchTargetX, this.touchTargetY) < 0.02) {
      this.touchX *= 1 - Math.min(1, 18 * dt);
      this.touchY *= 1 - Math.min(1, 18 * dt);
    }

    const now = new Set(this.injected ?? [...this.keys]);
    this.just.clear();
    for (const code of now) {
      if (!this.prevHeld.has(code)) this.just.add(code);
    }
    this.prevHeld = now;

    if (this.just.has("Space")) this.jumpQueued = Math.max(this.jumpQueued, 0.16);
    if (this.just.has("KeyJ")) this.attackQueued = Math.max(this.attackQueued, 0.14);
    if (this.just.has("KeyF") || this.just.has("KeyK")) this.shootQueued = Math.max(this.shootQueued, 0.14);
    if (this.just.has("Tab") || this.just.has("BracketRight")) {
      this.cycleDir = 1;
      this.cycleQueued = Math.max(this.cycleQueued, 0.16);
    }
    if (this.just.has("BracketLeft")) {
      this.cycleDir = -1;
      this.cycleQueued = Math.max(this.cycleQueued, 0.16);
    }

    if (this.touch.jump && !this.prevTouchJump) this.jumpQueued = Math.max(this.jumpQueued, 0.16);
    this.prevTouchJump = this.touch.jump;
    if (this.touch.wrench && !this.prevTouchWrench) this.attackQueued = Math.max(this.attackQueued, 0.14);
    this.prevTouchWrench = this.touch.wrench;
    if (this.touch.blaster) this.shootQueued = Math.max(this.shootQueued, 0.06);
    if (this.touch.cycle && !this.prevTouchCycle) {
      this.cycleDir = 1;
      this.cycleQueued = Math.max(this.cycleQueued, 0.16);
    }
    this.prevTouchCycle = this.touch.cycle;
  }

  moveAxes() {
    let x = 0;
    let y = 0;
    if (this.held("KeyA") || this.held("ArrowLeft")) x -= 1;
    if (this.held("KeyD") || this.held("ArrowRight")) x += 1;
    if (this.held("KeyW") || this.held("ArrowUp")) y += 1;
    if (this.held("KeyS") || this.held("ArrowDown")) y -= 1;
    x += this.touchX;
    y += this.touchY;
    const pad = navigator.getGamepads?.()[0];
    if (pad && pad.mapping === "standard") {
      const lx = pad.axes[0] ?? 0;
      const ly = pad.axes[1] ?? 0;
      const stick = radialDeadzone(lx, -ly, 0.18);
      x += stick.x;
      y += stick.y;
      const padJump = !!pad.buttons[0]?.pressed;
      if (padJump && !this.prevPadJump) this.jumpQueued = Math.max(this.jumpQueued, 0.16);
      this.prevPadJump = padJump;
      if (pad.buttons[2]?.pressed) this.attackQueued = Math.max(this.attackQueued, 0.08);
      if (pad.buttons[1]?.pressed || pad.buttons[7]?.pressed) {
        this.shootQueued = Math.max(this.shootQueued, 0.06);
      }
      const padCycle = !!pad.buttons[3]?.pressed;
      if (padCycle && !this.prevPadCycle) {
        this.cycleDir = 1;
        this.cycleQueued = Math.max(this.cycleQueued, 0.16);
      }
      this.prevPadCycle = padCycle;
      const look = radialDeadzone(pad.axes[2] ?? 0, pad.axes[3] ?? 0, 0.16);
      this.camX += look.x;
    }
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    return { x, y };
  }

  sprinting() {
    return this.held("ShiftLeft") || this.held("ShiftRight") || this.touch.sprint;
  }

  camOrbit() {
    let v = this.camX;
    this.camX = 0;
    if (this.held("KeyQ")) v -= 1;
    if (this.held("KeyE") || this.held("KeyC")) v += 1;
    return v;
  }
}
