# Agent notes — Chromaracers

## Runtimes

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (shipping) | `index.html`, `assets/main.js` | Do not replace with Babylon unless asked |
| **Godot 4** (optional) | `godot/` when scaffolded | Separate from shipping race |

## Game studio skills (CCGS)

From [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (MIT), adapted for Cursor:

```bash
bash scripts/install-game-studio.sh
```

| Piece | Location |
|-------|----------|
| Entry skill | `.cursor/skills/game-studio` |
| Workflow skills | `.cursor/skills/ccgs-*` (74) |
| Vendor (agents, hooks, docs) | `.cursor/vendor/claude-code-game-studios/` |

Prefer skill **`game-studio`**, then the matching `ccgs-*` skill. Default rigor: **minimal**.

## Engine & resource references

| Skill | Upstream |
|-------|----------|
| `babylonjs` | https://github.com/BabylonJS/Babylon.js |
| `magictools` | https://github.com/ellisonleao/magictools |

Offline mirrors: `docs/references/`.

## SpriteCook (optional, other PR)

When present: `.cursor/skills/spritecook*` and `scripts/install-spritecook.sh`.
