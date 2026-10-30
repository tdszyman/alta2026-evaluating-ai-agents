#!/usr/bin/env python3
"""Assemble the standalone workshop, including its canonical data and prompts."""

import argparse
import shutil
from pathlib import Path


def stage(destination: Path) -> None:
    workshop = Path(__file__).resolve().parent.parent / "workshop"
    destination = destination.resolve()
    if destination == workshop or workshop in destination.parents:
        raise ValueError("Stage outside workshop/ to avoid copying source onto itself")
    # Remove obsolete modules from earlier layouts. Guided pages and both
    # compatibility redirects are copied from app/ below.
    for name in ("core.mjs", "storage.mjs", "ui.mjs", "report.js", "report.css", "data", "prompts", "advanced/app.js"):
        obsolete = destination / name
        if obsolete.is_symlink() or obsolete.is_file():
            obsolete.unlink()
        elif obsolete.is_dir():
            shutil.rmtree(obsolete)
    shutil.copytree(workshop / "app", destination, dirs_exist_ok=True)
    for name in ("data", "prompts"):
        shutil.copytree(workshop / name, destination / "advanced" / name, dirs_exist_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    stage(parser.parse_args().destination)
