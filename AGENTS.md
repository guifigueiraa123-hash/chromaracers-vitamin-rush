# Agent notes — Chromaracers

## Runtimes

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (shipping) | `index.html`, `assets/main.js` | Primary gameplay |

Do **not** replace the Three.js Chromaracers pipeline unless the user explicitly requests another engine.

## Art / 3D tooling

| Tool | Role | Setup |
|------|------|--------|
| **img2threejs** | Reference image → procedural Three.js code | `bash scripts/install-img2threejs.sh` |
| **SpriteCook** | Hosted 2D sprite gen (MCP) | `.cursor/mcp.json` |

### img2threejs

Upstream: [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs)

```bash
bash scripts/install-img2threejs.sh
bash scripts/img2threejs-smoke.sh
npx --yes img2threejs@latest doctor
```

- Full skill (gitignored symlink): `.cursor/skills/img2threejs`
- Chromaracers adapter: `.cursor/skills/chromaracers-img2threejs`
- Map: `docs/references/img2threejs.md`
- Local reconstruction state: `.img2threejs/` (gitignored)

After install, **restart the agent**, attach a reference image, and use the img2threejs skill. Prefer `generic` for lab props and `character` for racers.
