import type { Weapon } from "./store";

export const DEFAULT_CAPTAIN = "Rook Vane";

export const NIX_LINES = {
  boot: "Congratulations. You are the last Riftkeeper. The last one died arguing with a vending machine. Try to do better.",
  boot2: "Left boot is the expensive one. Try not to pawn it.",
  crate: "That crate owed us money.",
  gate: "Gate sealed. Island might live. Don't make it a personality.",
  hungry: "Gate's hungry. Smash more crates. Make it rain bolts.",
  primed: "Gate primed. Get in there before Vesper aims it.",
  hover: "Hoverboots online. Don't look down. That's a personality.",
  swing: "Swing-shot live. Grapple the glow. Try not to eat a wall.",
  vendor: "Mama Coil. She'll sell you nanotech if you stop breaking her stalls.",
  die: "That was the job. The falling is extra.",
  vesper: "Vesper wants the Fracture aimed. We want it closed. Guess who brought a wrench.",
};

export type WeaponId = Weapon;

export type WeaponDef = {
  id: WeaponId;
  name: string;
  slot: number;
  kind: "melee" | "gun" | "beam" | "bomb" | "stun";
  unlockAt: number;
  color: number;
  damage: number;
  cooldown: number;
};

export const WEAPONS: WeaponDef[] = [
  { id: "wrench", name: "Omniwrench", slot: 1, kind: "melee", unlockAt: 0, color: 0xc67b3a, damage: 1, cooldown: 0.32 },
  { id: "blaster", name: "Pulse Blaster", slot: 2, kind: "gun", unlockAt: 0, color: 0x7ad4d4, damage: 1, cooldown: 0.18 },
  { id: "coil", name: "Shock Coil", slot: 3, kind: "beam", unlockAt: 1, color: 0x66ddff, damage: 1, cooldown: 0.22 },
  { id: "bomb", name: "Bomb Glove", slot: 4, kind: "bomb", unlockAt: 2, color: 0xff8844, damage: 2, cooldown: 0.55 },
  { id: "groove", name: "Groovitron", slot: 5, kind: "stun", unlockAt: 3, color: 0xff66cc, damage: 0, cooldown: 1.1 },
  { id: "fusion", name: "Fusion Rifle", slot: 6, kind: "gun", unlockAt: 4, color: 0xc8ff88, damage: 2, cooldown: 0.38 },
  { id: "paint", name: "Paintbrush Cannon", slot: 7, kind: "gun", unlockAt: 6, color: 0xff88aa, damage: 2, cooldown: 0.28 },
  { id: "hammer", name: "Mega Smash", slot: 8, kind: "melee", unlockAt: 8, color: 0xffe08a, damage: 3, cooldown: 0.46 },
];

export function weaponById(id: WeaponId) {
  return WEAPONS.find((w) => w.id === id) ?? WEAPONS[0]!;
}

export function unlockedWeapons(cleared: number): WeaponId[] {
  return WEAPONS.filter((w) => w.unlockAt <= cleared).map((w) => w.id);
}

export const WORLDS_STORY = [
  {
    name: "Hookhaven",
    intro: "Brass sky-port. Mama Coil's stall. A baby gate tearing the market.",
    nix: "A gate just ate the fruit stand. Wrench first. Then the boom.",
    close: "Hookhaven holds. For now. Ship pad's hot.",
  },
  {
    name: "Coral Reach",
    intro: "Reef islands. Coral war-bots. The original starter threat.",
    nix: "Don't lick the coral. It licks back.",
    close: "Reef sealed. Something bigger is swimming the Fracture.",
  },
  {
    name: "Bonewild",
    intro: "Ark jungle shard. Living megafauna. Try not to become lunch.",
    nix: "Hoverboots online. The expensive boot. The left one.",
    close: "Jungle's still breathing. That's the point.",
  },
  {
    name: "Crash Canyons",
    intro: "Crate canyons. Spin-smash lanes. Timing jumps. Classic.",
    nix: "Swing-shot live. Grapple the glow. Don't make it a personality.",
    close: "Canyons closed. Bolts everywhere. You're welcome.",
  },
  {
    name: "Neon Docks",
    intro: "Night market. Wanted heat if you wreck stalls. Don't.",
    nix: "If you smash a stall, Mama Coil invoices the sky.",
    close: "Docks dim. Heat drops. Vesper's still paying in dinosaur bone.",
  },
  {
    name: "Ringfall",
    intro: "Broken ring fragment. Gold Hollowborn. Meat the rifle.",
    nix: "Gold armor. Fusion Rifle. Do the math.",
    close: "Ring fragment parked. Don't salute the ruins.",
  },
  {
    name: "Cap Isles",
    intro: "Bounce pads. Secret blocks. Flagpole gate. Keep jumping.",
    nix: "Thimble would love this. You have a wrench. Close enough.",
    close: "Flag's down. Gate's shut. Cute world. Moving on.",
  },
  {
    name: "Paintveil",
    intro: "Living oil-paint soldiers. Dodge. Parry. Then the boom.",
    nix: "They look painted. They walk off the canvas anyway.",
    close: "Canvas dried. Liora would call that a dress rehearsal.",
  },
  {
    name: "Crystal Spire",
    intro: "Anchor Stone ruins. Party specials. Summon-lite gadget.",
    nix: "Seven stones. This is one. Don't drop it.",
    close: "Crystal seated. The Spire of Binding just noticed us.",
  },
  {
    name: "Smash Deck",
    intro: "Vesper's flagship. Items rain. Final gate. Don't miss.",
    nix: "Vesper aims the Fracture at Hookhaven. We slam the seventh Anchor instead.",
    close: "That was the job. Don't make it a personality.",
  },
] as const;

export const END_COPY = {
  credits: "The sky knits. One island still falls — the one Vesper stood on.",
  receipt: "Vendor receipt: 12,000 bolts of emotional damage.",
  card: "Ai has come a long way, but we are only at the beginning of the frontier. Keep the world moving forward. Thanks for playing. If you feel inclined, you can donate to me on X ",
} as const;
