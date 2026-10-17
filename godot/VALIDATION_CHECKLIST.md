# Validation — Godot Visual Target

Against `docs/CHROMARACERS_VISUAL_TARGET.md` §13–§14 and reference image.

## Composition (Phase 1)

- [x] Camera behind Vita, looking toward vanishing point
- [x] Vita in lower-middle of frame
- [x] Continuous glass cylinder
- [x] Dark lab rings (not cyan neon portals)
- [x] Wide blue mobile-phase floor
- [x] Cyan vanishing / detector light

## Stationary / mobile / molecules (Phases 2–3)

- [x] Purple packed silica (coat + sprite MultiMesh)
- [x] Floor UV scroll toward camera direction
- [x] Interior colored molecules / clusters
- [x] Exterior traffic off by default

## Character / polish (Phases 4–5)

- [x] Vita Sprite3D billboard + run frames
- [x] Bloom reduced for readability
- [x] Sector fog tint only (no aggressive neon recolor)
- [x] Headless smoke passes
- [x] Captures: `.godot_captures/composition_{near,mid,far}.png`

## Anti-patterns avoided

- Not a flat 2D background
- Not a spaceship corridor / crystal cave / random particle tunnel
- Purple communicates stationary phase; cyan/blue the mobile phase
