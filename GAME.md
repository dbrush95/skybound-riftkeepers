# Dallas: Skybound

A complete, original Mario-style side-scrolling platform game written in Python.
You play a scarf-wearing explorer crossing three worlds: Sunlit Meadow,
Twilight Works, and Aurora Ridge. All artwork and sound effects are generated
by the source code. No Nintendo artwork, music, characters or external assets
are included.

## Start on Windows

1. Install Python 3.10 or newer from https://www.python.org/downloads/ if needed.
   Select **Add Python to PATH** and the Python launcher during installation.
2. Extract this entire ZIP into a folder; do not run from inside the ZIP.
3. Double-click **PLAY_WINDOWS.bat**.

The launcher creates a private `.venv` beside the game and installs Pygame on
first use. Internet is needed for that first installation; gameplay is offline.
The game requires a desktop computer and keyboard. It does not run directly
inside the ChatGPT iPhone app.

## Manual start (Windows, macOS, Linux)

Open a terminal in this folder. On Windows, use `python`; on macOS/Linux,
substitute `python3` if needed:

```sh
python -m venv .venv
```

Activate with `.venv\Scripts\activate` in Windows Command Prompt, or
`source .venv/bin/activate` on macOS/Linux, then:

```sh
python -m pip install -r requirements.txt
python game.py
```

## Controls

| Action | Key |
| --- | --- |
| Move | A / D or left / right arrows |
| Jump | Space, W, or up arrow |
| Jump higher | Hold jump |
| Sprint | Hold Shift |
| Start / next world / retry | Enter |
| Pause / resume | P or Escape (Enter also resumes) |
| Toggle sound | M |
| Quit | Q or close the window |

Jump on the coral robots to defeat them. Touching their sides costs a life
unless you have a shield. Hit gold **?** blocks from below for a shield or a
coin. Shields absorb one enemy hit; they do not protect against falling.
Every 30 coins awards a life. Each world's midpoint beacon activates a
checkpoint. Reach the gold flag to advance; finish all three worlds to win.

You begin with five lives. Collected coins, defeated enemies, and used blocks
remain cleared when you respawn in that world. New games reset the campaign.
The local high score is saved to `.dallas_skybound.json` in your user home
folder. There are no accounts, tracking, or network calls in the game.

## Included features

- Three scrolling levels with distinct palettes, parallax scenery and particles
- Acceleration, variable jump height, a short grace period at edges, and buffered jumps
- Enemies, coins, reward blocks, shields, checkpoints and extra lives
- Title, pause, game-over, stage-complete and victory screens
- Synthesized sound effects; works silently when no audio device is available
- Fixed-step physics and a resizable, aspect-preserving window
- Local high score and an automated headless smoke test

## Customize your game

The full game is in **game.py**, with no omitted source or asset files.

- Edit `LEVELS` near the top to change levels or add more.
- Coordinates use a 48-pixel tile grid. Ground begins at row 10.
- `gaps=[(21, 23)]` removes ground in columns 21 and 22.
- `platforms=[(8, 8, 3)]` creates a three-tile platform starting at column 8, row 8.
- `boxes` contains `(column, row)` pairs; place blocks with space underneath
  for the player to jump into them.
- `enemies` contains ground-level column positions. Keep enemies out of gaps.
- `checkpoint` is a ground-level column; place it outside gaps.
- `JUMP`, `GRAVITY`, and movement speeds in `Player.update` control movement.
- `draw_player` controls your character's appearance.

## Verification

```sh
python game.py --test
```

Runs without a display and checks physics, rewards, level traversal, saves and
rendering, then writes `preview.png`. The test uses a temporary high-score file
so your personal score is untouched. This checks core behavior, but is not a
substitute for playing every possible route through every level.

## Troubleshooting

- **No module named pygame:** use the included launcher or install requirements
  with the same Python interpreter used to launch the game.
- **Python not found:** reinstall Python with PATH / launcher options enabled.
- **No audio:** press M; otherwise the game safely continues without sound.
- **Linux venv missing:** install your distribution's Python venv package.
- Keep `game.py` and `requirements.txt` beside `PLAY_WINDOWS.bat`.

This is source code, not a prebuilt executable. Windows launcher included;
automated game checks were run headlessly on Linux.
