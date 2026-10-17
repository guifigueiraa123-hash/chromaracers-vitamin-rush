# Art Bible — Chromaracers HPLC Column Lab (from scratch)

**Rigor:** minimal · **Stack:** Godot 4.7 lab only (Three.js shipping untouched)  
**Skills:** `ccgs-art-bible` workflow · `open-higgsfield` / Muapi · `godot-game` · `godot-project-setup`  
**Direction source (concept only):** `docs/CHROMARACERS_VISUAL_TARGET.md` + reference image  
**Rule:** no reuse of prior tip silica PNGs, old `column_environment.gd`, or repo Vita sheets — **new art only**.

---

## 1. Core identity

The player races **inside a giant chromatographic column**.

Arcade, not simulation. Readable hierarchy beats effects.

| Must communicate | Must not become |
|------------------|-----------------|
| HPLC column + racing game | Spaceship corridor |
| Purple stationary phase | Crystal cave / purple fantasy |
| Blue mobile-phase floor | Underwater tunnel |
| Pixel Vita C in 3D volume | Random particle tunnel |

## 2. Hierarchy

1. Vita C (player)
2. Blue mobile-phase floor (race path)
3. Glass column + purple silica walls
4. Interior analyte molecules
5. Fog / soft FX

## 3. Palette (locked)

```
MOBILE PHASE     #0066CC  #00AEEF  #19D9FF  #0050A8
STATIONARY PHASE #321B72  #5120A8  #7138D4  #9B7BE8
MOLECULE ACCENTS #00D9FF  #FF4FD8  #FF9F1C  #FFD166
STRUCTURE        #102B55  #183B67  #284C78
LIGHT            #6FEAFF
```

Purple = silica only. Cyan/blue = floor + vanishing light.

## 4. Character — Vita C (new art)

- Compact **pixel-art** scientific racer
- Orange fruit head + green leaves, white lab coat, dark pants
- Rear 3/4 run cycle preferred for tunnel camera
- Nearest-neighbor; no smooth cartoon filter
- Generated via Muapi (`open-higgsfield`); never commit API keys

## 5. Environment layers

| Layer | Look |
|-------|------|
| Glass | Semi-transparent cylinder; subtle lab identity |
| Rings | Dark metal section rings — subordinate, not neon portals |
| Silica | Dense purple packed-bed clusters on walls (new sprites) |
| Floor | Wide flowing blue/cyan liquid ribbon |
| Molecules | 2–5 node colorful analytes inside the tube |
| Vanishing | Bright cyan disc / detector glow far ahead |

## 6. Camera

Third-person arcade: behind and slightly above Vita, looking down the column. Vita stays lower-middle. FOV moderately wide.

## 7. Generation pipeline

1. Author prompts in `assets/ASSET_SPECS.md`
2. `bash scripts/muapi_generate_column_art.sh` → `godot/assets/generated/`
3. Godot loads **only** from `res://assets/generated/`
4. License: Muapi/model terms — review before any shipping reuse

## 8. KEEP / REPLACE vs old lab

| Old adapted lab | This project |
|-----------------|--------------|
| Tip silica PNGs | REPLACE — regenerate |
| Repo Vita sheet | REPLACE — regenerate |
| Cyan neon rings / lanes | REPLACE — art bible above |
| Procedural-only cyan beads | REPLACE — new textures + fresh scripts |
