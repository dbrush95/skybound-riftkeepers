#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = "/workspace";
const version = readFileSync(join(root, "VERSION"), "utf8").trim();
const outDir = join(root, "downloads", `Skybound-Riftkeepers-v${version}-Windows`);
const zipPath = join(root, "downloads", `Skybound-Riftkeepers-v${version}-Windows.zip`);
const electronSrc = "/tmp/electron-win";
const publicDir = "/tmp/pack-www";

if (!existsSync(electronSrc + "/electron.exe")) throw new Error("Electron Windows build missing");
if (!existsSync(join(publicDir, "index.html"))) throw new Error("pack-www missing index.html");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
execSync(`cp -a ${electronSrc}/. ${outDir}/`);
const appDir = join(outDir, "resources", "app");
mkdirSync(appDir, { recursive: true });
cpSync(join(root, "packaging/electron/main.cjs"), join(appDir, "main.cjs"));
cpSync(join(root, "packaging/electron/package.json"), join(appDir, "package.json"));
const www = join(appDir, "www");
mkdirSync(www, { recursive: true });
execSync(`cp -a ${publicDir}/. ${www}/`);
execSync(`mv ${join(outDir, "electron.exe")} ${join(outDir, "Skybound.exe")}`);

writeFileSync(
  join(outDir, "README.txt"),
  `Skybound: Riftkeeper  v${version}  Gate Closed
=========================================
Double-click Skybound.exe to play. No install.

Enter your captain name on the title card (default Rook Vane).

  WASD / arrows     move
  Space             tap jump, tap AGAIN in the air for double jump
                    hold to float down
  J / left click    wrench (always melee)
  F / K / right click  fire equipped gun
  1-8 / Tab / wheel switch gadgets
  Shift             sprint
  Q / E             orbit camera
  Esc               pause

Touch: stick bottom-left, buttons bottom-right.
Score, bolts, lives, and Nix stay at the TOP.

Ten worlds. Smash crates, fill the gate, walk in.

This pack is the SAME 3D game as the live preview.
Do not mix with the Python game or the small Native zip.
`,
);

const versionDir = join(root, "downloads", `v${version}`);
mkdirSync(versionDir, { recursive: true });

execSync(`python3 - <<'PY'
import zipfile, os, shutil
src = ${JSON.stringify(outDir)}
dest = ${JSON.stringify(zipPath)}
version_dest = ${JSON.stringify(join(versionDir, `Skybound-Riftkeepers-v${version}-Windows.zip`))}
with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(src):
        for f in files:
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, os.path.dirname(src)))
shutil.copy2(dest, version_dest)
print("wrote", dest, os.path.getsize(dest))
print("copy", version_dest)
PY`);
console.log("windows pack ready", zipPath);
