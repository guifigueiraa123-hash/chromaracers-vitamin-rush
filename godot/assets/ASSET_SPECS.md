# Asset specs — new Muapi art (from scratch)

All outputs land in `godot/assets/generated/`. No prior tip assets.

Default model: **flux-schnell** → endpoint `flux-schnell-image` (override with `MUAPI_MODEL`).

## 1. silica_cluster_a / silica_cluster_b / silica_particle

| Field | Value |
|-------|--------|
| Type | Sprite sheet / isolated PNG, transparent BG |
| Style | Pixel-art friendly clumps, irregular rounded porous beads |
| Color | Purple / violet / indigo / lavender (`#321B72`–`#9B7BE8`) |
| Avoid | Perfect spheres, gems, rocks, vegetation |

**Prompt (cluster):**
```
game asset sprite, isolated on pure transparent background, dense purple indigo chromatographic silica gel packed-bed cluster, irregular porous rounded particles, pixel-art friendly shading, violet #5120A8 and lavender highlights, no character, no text, no neon, laboratory science aesthetic
```

**Prompt (particle):**
```
game asset sprite, isolated on pure transparent background, single small purple silica gel bead particle, porous irregular round, pixel-art friendly, indigo violet, no glow bloom, no text
```

**Files:** `silica_cluster_a.png`, `silica_cluster_b.png`, `silica_particle.png`

## 2. mobile_phase_floor

| Field | Value |
|-------|--------|
| Type | Seamless tileable strip (or wide plate) |
| Color | Deep blue → electric cyan streaks |
| Motion | Designed for UV scroll toward vanishing point |

**Prompt:**
```
seamless tileable game texture, top-down flowing chromatographic mobile phase liquid, deep blue #0066CC with cyan #00AEEF and turquoise streaks, directional flow lines toward horizon, arcade game readable, subtle highlights, no characters, no text, no purple
```

**File:** `mobile_phase_floor.png`

## 3. lab_ring

| Field | Value |
|-------|--------|
| Type | Dark metal curved ring segment or full torus bake |
| Color | `#102B55` / `#183B67` |
| Avoid | Cyan neon, sci-fi portal look |

**Prompt:**
```
game asset, laboratory chromatography column structural support ring, dark blue steel #102B55, matte metal, subtle technical bolts, no neon glow, isolated on transparent background, clean game-ready prop
```

**File:** `lab_ring.png` (optional; may stay procedural metal if gen fails)

## 4. analyte_molecule

| Field | Value |
|-------|--------|
| Type | 2–3 connected glowing nodes |
| Colors | cyan, magenta, orange, yellow |

**Prompt:**
```
game asset sprite, isolated transparent background, small analyte molecule made of 3 connected spheres with thin bonds, vibrant cyan magenta and orange, soft glow, pixel-art friendly, arcade collectible look, no text
```

**File:** `analyte_molecule.png`

## 5. vita_c_run (character — concept Vita C, new art)

| Field | Value |
|-------|--------|
| Type | Horizontal run spritesheet, rear 3/4 view |
| Frames | 8 frames preferred (or 4 — script will slice) |
| Look | Orange fruit head, green leaves, white lab coat, dark pants |

**Prompt:**
```
pixel art character spritesheet, 8 frames horizontal run cycle, rear three-quarter view, ChromaRacers Vita C: anthropomorphic orange fruit head with two green leaves, white lab coat, dark blue pants, brown shoes, thick black outline, arcade 16-bit style, transparent background, consistent size, no text, no scenery
```

**File:** `vita_c_run.png`

## 6. column_concept (moodboard, not runtime)

**Prompt:**
```
cinematic concept art, player racing inside giant glass chromatographic column, purple packed silica walls, bright blue liquid floor, pixel-art orange scientist character lower-middle, cyan vanishing light, arcade game, not spaceship corridor
```

**File:** `column_concept.png` (docs / art bible only)
