"""v0.1 snapshot — same source as repo-root game.py."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parents[2] / "game.py"), run_name="__main__")
