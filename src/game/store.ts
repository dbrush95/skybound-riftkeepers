import { create } from "zustand";

export type Phase = "boot" | "title" | "play" | "pause" | "clear" | "over" | "credits" | "won";
export type Weapon =
  | "wrench"
  | "blaster"
  | "coil"
  | "bomb"
  | "groove"
  | "fusion"
  | "paint"
  | "hammer";

export type GameHud = {
  ready: boolean;
  phase: Phase;
  playerName: string;
  worldIndex: number;
  worldName: string;
  hp: number;
  maxHp: number;
  bolts: number;
  lives: number;
  score: number;
  highScore: number;
  weapon: Weapon;
  weaponName: string;
  melee: Weapon;
  meleeName: string;
  gun: Weapon;
  gunName: string;
  unlocked: Weapon[];
  banner: string;
  nixLine: string;
  combo: number;
  muted: boolean;
  grounded: boolean;
  hasShield: boolean;
  gateMeter: number;
  gommage: number;
  worldsCleared: number;
  hoverboots: boolean;
  swingshot: boolean;
  version: string;
};

const initial: GameHud = {
  ready: false,
  phase: "title",
  playerName: "",
  worldIndex: 0,
  worldName: "Hookhaven",
  hp: 4,
  maxHp: 4,
  bolts: 0,
  lives: 5,
  score: 0,
  highScore: 0,
  weapon: "blaster",
  weaponName: "Pulse Blaster",
  melee: "wrench",
  meleeName: "Omniwrench",
  gun: "blaster",
  gunName: "Pulse Blaster",
  unlocked: ["wrench", "blaster"],
  banner: "",
  nixLine: "",
  combo: 0,
  muted: false,
  grounded: true,
  hasShield: false,
  gateMeter: 0,
  gommage: 33,
  worldsCleared: 0,
  hoverboots: true,
  swingshot: false,
  version: "1.0.0",
};

export const useGameStore = create<GameHud>(() => ({ ...initial }));

export function resetHud(partial: Partial<GameHud> = {}) {
  useGameStore.setState({ ...initial, ...partial });
}
