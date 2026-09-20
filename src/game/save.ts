const KEY = "skybound-riftkeepers-v2";
const SAVE_VERSION = 2;

export type SaveData = {
  version: number;
  playerName: string;
  highScore: number;
  muted: boolean;
  worldsCleared: number;
};

const defaults: SaveData = {
  version: SAVE_VERSION,
  playerName: "",
  highScore: 0,
  muted: false,
  worldsCleared: 0,
};

function migrate(raw: Partial<SaveData>): SaveData {
  return { ...defaults, ...raw, version: SAVE_VERSION };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("skybound-riftkeepers-v1");
    if (!raw) return { ...defaults };
    return migrate(JSON.parse(raw) as Partial<SaveData>);
  } catch {
    return { ...defaults };
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota */
  }
}
