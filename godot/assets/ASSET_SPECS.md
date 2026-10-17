# Asset specs — column lab (minimal)

Aligned to Visual Target + `ART_BIBLE_COLUMN.md`.

## silica_wall

- Source: `assets/silica/silica-*.png` (from Three.js tip PRs)
- Use: MultiMesh quads, `TEXTURE_FILTER_NEAREST`, purple tint
- Placement: packed on cylinder wall; clear floor corridor

## mobile_phase_floor

- Procedural BoxMesh + emission scroll UV
- Colors: `#0066CC` / `#00AEEF` / `#19D9FF`
- Motion: UV offset toward vanishing point only

## analyte_molecules

- Interior MultiMesh spheres + 3-node clusters
- Palette: cyan / magenta / orange / yellow / violet
- Exterior traffic: off by default (`show_exterior_traffic`)

## vita_c

- `assets/characters/vita-c-run-final-spritesheet.png` (512×64, 8×64 frames)
- Sprite3D billboard, nearest filter, lower-middle framing
