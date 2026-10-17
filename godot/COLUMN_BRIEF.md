# Godot lab — from scratch

## Intent

Rebuild the HPLC column **preview lab** with **new Muapi art** only.  
Uses Chromaracers **concept/direction** (`docs/CHROMARACERS_VISUAL_TARGET.md`) — does **not** reuse tip silica PNGs, old column scripts, or the repo Vita sheet.

## Skills

| Skill | Role |
|-------|------|
| `godot-game` / `godot-project-setup` | Fresh project, typed GDScript, smoke |
| `open-higgsfield` | Muapi BYOK generation |
| Art bible | `godot/ART_BIBLE.md` |
| Asset specs + prompts | `godot/assets/ASSET_SPECS.md` |

## Generate art

```bash
# requires Cloud Agent secret MUAPI_API_KEY
bash scripts/muapi_generate_column_art.sh
```

Outputs → `godot/assets/generated/*.png`

## Run

```bash
godot --path godot
godot --headless --path godot --quit-after 2
```

Shipping Chromaracers remains Three.js.
