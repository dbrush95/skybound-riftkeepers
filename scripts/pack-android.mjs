#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = "/workspace";
const sdk = "/tmp/android-sdk";
const bt = join(sdk, "build-tools/34.0.0");
const androidJar = join(sdk, "platforms/android-34/android.jar");
const src = join(root, "packaging/android");
const work = "/tmp/apk-work";
const publicDir = "/tmp/pack-www-android";
const outApk = join(root, "downloads", "Skybound-Riftkeepers.apk");

if (!existsSync(join(bt, "aapt2"))) throw new Error("build-tools missing");
if (!existsSync(join(publicDir, "index.html"))) throw new Error("android www missing");

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
mkdirSync(join(root, "downloads"), { recursive: true });

const assets = join(work, "assets/www");
mkdirSync(assets, { recursive: true });
execSync(`cp -a ${publicDir}/. ${assets}/`);

execSync(`${bt}/aapt2 compile --dir ${src}/res -o ${work}/res.zip`);
mkdirSync(join(work, "gen"), { recursive: true });
execSync(
  `${bt}/aapt2 link -o ${work}/app-unaligned.apk --manifest ${src}/AndroidManifest.xml -I ${androidJar} --java ${work}/gen -A ${work}/assets ${work}/res.zip --auto-add-overlay`,
);

mkdirSync(join(work, "classes"), { recursive: true });
execSync(
  `javac --release 17 -cp ${androidJar} -d ${work}/classes ${src}/src/com/skybound/riftkeepers/MainActivity.java ${work}/gen/com/skybound/riftkeepers/R.java`,
);
execSync(`${bt}/d8 --lib ${androidJar} --output ${work} $(find ${work}/classes -name '*.class')`);

execSync(`python3 - <<'PY'
import zipfile
apk = "/tmp/apk-work/app-unaligned.apk"
dex = "/tmp/apk-work/classes.dex"
with zipfile.ZipFile(apk, "a", compression=zipfile.ZIP_DEFLATED) as z:
    z.write(dex, "classes.dex")
print("dex added")
PY`);

execSync(`${bt}/zipalign -f -p 4 ${work}/app-unaligned.apk ${work}/app-aligned.apk`);

const ks = join(work, "debug.keystore");
execSync(
  `keytool -genkeypair -keystore ${ks} -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Skybound,O=Riftkeepers,C=US"`,
);
execSync(
  `${bt}/apksigner sign --ks ${ks} --ks-pass pass:android --key-pass pass:android --out ${outApk} ${work}/app-aligned.apk`,
);
console.log("apk ready", outApk);
execSync(`${bt}/apksigner verify ${outApk}`);
console.log("apk verified");
