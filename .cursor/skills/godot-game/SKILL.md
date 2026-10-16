---
name: godot-game
description: >-
  Build and iterate Godot 4 games from Cursor: scaffold projects, write typed
  GDScript, design scenes/signals, run headless checks with the local Godot
  binary, and export or package playable prototypes. Use when the user asks to
  create a Godot game, port a prototype to Godot, add Godot scenes/scripts, or
  validate a Godot project with the engine CLI.
---

# Godot Game (Cursor)

Use this skill whenever the task is to **generate or evolve a game in Godot 4**
inside Cursor (including Cloud Agents).

## Engine binary

Prefer this order:

1. `godot` on `PATH` (`godot --version`)
2. `./tools/godot/godot` (workspace symlink)
3. If missing: run `bash scripts/install-godot.sh` (needs network)

Target version: **Godot 4.7.x stable** (Linux x86_64 editor binary).

Useful CLI:

```bash
godot --version
godot --headless --path <project_dir> --quit-after 1
godot --headless --path <project_dir> --script res://addons/...  # optional
godot --headless --path <project_dir> --export-release "Linux" build/game.x86_64
```

Do **not** commit the ~140 MB `Godot_v*` binary. Keep `tools/godot/.gitkeep` and the install script only.

## Default stack

| Choice | Default |
|--------|---------|
| Engine | Godot 4.7+ |
| Language | **GDScript** (typed) |
| Rendering | Forward+ (3D) / Mobile if targeting low-end |
| Physics | Project default (Jolt if available on this version) |
| VCS | Commit `.godot/` ignore via standard Godot `.gitignore` |

Prefer GDScript unless the user explicitly asks for C# / GDExtension.

## Project layout

```
<game>/
  project.godot
  icon.svg
  .gitignore          # Godot standard
  scenes/
    main.tscn
    player.tscn
    ...
  scripts/
    main.gd
    player.gd
    ...
  assets/             # art, audio (optional SpriteCook imports)
  autoload/           # only true globals
```

If the repo already has a Three.js / web game (e.g. Chromaracers), **do not replace it** unless asked. Put the Godot game in a sibling folder such as `godot/` or `games/<name>/`.

## Architecture rules

1. **Composition over deep inheritance** — behaviors as child nodes / components.
2. **Scenes are reusable** — one root, clear responsibility, instantiate via `PackedScene`.
3. **Typed GDScript** — `var speed: float`, `func take_damage(amount: int) -> void:`.
4. **Signals for decoupling** — `signal died`, `health_changed.connect(...)`, never string `connect()`.
5. **Autoloads sparingly** — `EventBus`, `GameState`, `Audio` only; never scene-node caches.
6. **Data as Resources** — items/stats as `.tres`, not hardcoded magic numbers.
7. **Free nodes** — `queue_free()`; do not connect signals inside `_process`.

## Naming

- Files/scenes: `snake_case.gd` / `snake_case.tscn`
- `class_name`: `PascalCase`
- Functions/vars: `snake_case`; private: `_prefix`
- Constants: `SCREAMING_SNAKE_CASE`
- Signals: past tense (`hit_landed`, `race_finished`)

## Workflow (every Godot game request)

1. Confirm target folder (new `godot/` vs existing project).
2. Ensure Godot binary via install script if needed.
3. Scaffold `project.godot` + main scene + player/world stubs.
4. Implement the requested feature in small scenes/scripts.
5. Run headless smoke: `godot --headless --path <dir> --quit-after 1`.
6. Commit sources only (no editor binary, no `.godot/` cache unless required).

## Chromaracers / race-game notes

When porting or mirroring Chromaracers concepts:

- Keep **lane-based movement**, spline/path follow, and sector fog as separate systems.
- Prefer `Path3D` / `PathFollow3D` or a custom spline resource for the column track.
- Silica / environment art: import PNGs as textures; do not bake gameplay into art.
- Do not delete the existing Three.js `assets/main.js` pipeline unless the user asks for a full migration.

## SpriteCook (optional)

If SpriteCook MCP is available in the session, use it for pixel-art assets and save under `assets/`. If MCP is missing, use placeholders or existing repo art — do not block the game scaffold.

## Anti-patterns

- Rewriting the whole web game unprompted
- Untyped GDScript everywhere
- Giant autoload “Managers”
- Committing Godot editor binaries
- Assuming editor GUI is available in Cloud Agents (use `--headless`)
