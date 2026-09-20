import type { TouchActions } from "./input";
import type { Weapon } from "./store";

export type GameAPI = {
  start: (name: string) => void;
  pause: () => void;
  resume: () => void;
  retry: () => void;
  nextWorld: () => void;
  toggleMute: () => void;
  setWeapon: (w: Weapon) => void;
  cycleWeapon: () => void;
  setTouchMove: (x: number, y: number) => void;
  setTouchLook: (dx: number) => void;
  setTouchAction: (a: keyof TouchActions, d: boolean) => void;
};
