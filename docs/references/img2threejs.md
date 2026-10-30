# Chromaracers × img2threejs

Upstream: [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs)  
Gallery: [img2threejs.io](https://img2threejs.io/)

## What it does

Turns a **reference image** into a **code-only procedural Three.js** `THREE.Group` factory (primitives, shaders, generated geometry) — quality-gated and animation-ready. Not photogrammetry, not downloaded mesh packs.

Fits Chromaracers because the shipping race is already Three.js (`index.html`, `assets/main.js`).

## Project wiring

| Piece | Location |
|-------|----------|
| Full skill (managed release) | `.cursor/skills/img2threejs` → `~/.img2threejs/releases/…` (gitignored symlink) |
| Chromaracers adapter skill | `.cursor/skills/chromaracers-img2threejs/SKILL.md` |
| Install | `bash scripts/install-img2threejs.sh` |
| Smoke | `bash scripts/img2threejs-smoke.sh` |
| Agent notes | `AGENTS.md` |
| Reconstruction state | `.img2threejs/` (gitignored) |

Official installer hosts: Claude / Codex / OpenCode / Hermes. **Cursor** is linked manually by the install script ([upstream INSTALL §7](https://github.com/img2threejs/img2threejs/blob/main/docs/INSTALL.md#7-other-coding-agents)).

## When to use vs other tools

| Tool | Use for |
|------|---------|
| **img2threejs** | Procedural **3D** props/characters from a photo → TypeScript Three.js factories |
| **SpriteCook** | 2D sprite generation / polish (hosted) |
| **Aseprite AI Artist** | Pixel edit/animate inside Aseprite (other PR) |

Do **not** replace shipping spritesheets with img2threejs unless the user asks for a 3D rebuild of that subject.

## Chromaracers subjects

| Subject | Reference ideas | Profile |
|---------|-----------------|---------|
| HPLC column / glass tunnel | Lab column photo or concept art | `generic` (object) |
| Silica beads / packed bed | Macro bead / gel photo | `generic` |
| UV-Vis detector | Instrument photo | `generic` |
| Vita C / Captain Caffeine / Aroma | Character turnaround | `character` |
| Neon arches / lab set dressing | Environment still | `generic` (or `environment` plugin if authorized) |

**Output target:** TypeScript factory modules under something like `assets/models/` or a path the user names — then import from `assets/main.js`. Keep Three.js local modules (`three.module.js` / `three.core.js`); do not introduce a CDN.

## Agent prompt (starter)

```text
Use the img2threejs skill (and chromaracers-img2threejs adapter).
Rebuild the object in <path-or-attachment> as a procedural Three.js model
for Chromaracers: Vitamin Rush. Keep proportions, silhouette and colours.
Follow quality gates. Prefer the generic or character profile as appropriate.
Report output files, render-review evidence, and where to wire it in assets/main.js.
```

## Commands

```bash
bash scripts/install-img2threejs.sh
bash scripts/img2threejs-smoke.sh
npx --yes img2threejs@latest doctor
# optional plugins:
# npx --yes @img2threejs/img2@latest install --yes
# npx --yes @img2threejs/img2@latest add character --yes
```

From the skill root (after install):

```bash
python3 forge/state.py init --help
python3 forge/next.py --state .img2threejs/state.json
```
