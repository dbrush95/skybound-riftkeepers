#!/bin/sh
set -eu
ZIG=/tmp/native-tools/zig-x86_64-linux-0.16.0/zig
RL=/tmp/native-tools/raylib-5.5_win64_mingw-w64
OUT=/workspace/downloads/v0.5.0/Skybound.exe
mkdir -p /workspace/downloads/v0.5.0
"$ZIG" cc -target x86_64-windows-gnu -O2 -std=c99 \
  -I "$RL/include" \
  /workspace/native/skybound.c \
  "$RL/lib/libraylib.a" \
  -lopengl32 -lgdi32 -lwinmm -luser32 -lshell32 -lkernel32 \
  -Wl,--subsystem,windows \
  -o "$OUT"
ls -lh "$OUT"
python3 - <<'PY'
p=open("/workspace/downloads/v0.5.0/Skybound.exe","rb").read(2)
print("PE/MZ" if p==b"MZ" else "NOT A WINDOWS EXE", p)
PY
