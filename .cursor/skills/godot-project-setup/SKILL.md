---
name: godot-project-setup
description: >-
  Scaffold a new Godot 4 project directory: project.godot, .gitignore, folders,
  main scene, input map stubs, and headless verification. Use when creating a
  brand-new Godot project or bootstrapping godot/ inside an existing repo.
---

# Godot Project Setup

## When to use

- “Cria um projeto Godot”
- “Scaffold Godot 4”
- Starting `godot/` beside an existing web game

Read and follow `godot-game` for architecture after scaffolding.

## Steps

### 1. Install engine if needed

```bash
bash scripts/install-godot.sh
godot --version
```

### 2. Create tree

```bash
GAME_DIR=godot   # or user-specified name
mkdir -p "$GAME_DIR"/{scenes,scripts,assets,autoload}
```

### 3. Write `project.godot` (minimal Godot 4)

Include at least:

- `config_version=5`
- `application/config/name`
- `application/run/main_scene="res://scenes/main.tscn"`
- `rendering/renderer/rendering_method="forward_plus"` (3D) or leave default for 2D

### 4. Main scene + script

- `scenes/main.tscn` — root `Node` or `Node3D` / `Node2D` matching genre
- `scripts/main.gd` — typed, `_ready()` prints a boot line for headless smoke

### 5. Godot `.gitignore`

Ignore `.godot/`, `.import/`, export dumps, `.mono/` if applicable. Never ignore `project.godot` or `*.tscn` / `*.gd`.

### 6. Verify

```bash
godot --headless --path "$GAME_DIR" --quit-after 1
```

Exit 0 / clean engine boot = success.

### 7. Hand off

Tell the user the folder path, main scene, and that `/godot-game` (or automatic skill load) continues feature work.
