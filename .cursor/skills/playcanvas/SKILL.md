---
name: playcanvas
description: >-
  PlayCanvas WebGL2/WebGPU engine reference for Cursor agents. Use when the user
  asks about PlayCanvas, pc.Application, create-playcanvas, or comparing
  PlayCanvas to Three.js/Babylon. Do not replace Chromaracers Three.js unless
  explicitly requested.
---

# PlayCanvas Engine (reference)

Upstream: [playcanvas/engine](https://github.com/playcanvas/engine)

Open-source game engine on **WebGL2** and **WebGPU** for browser 3D apps and games.

## Chromaracers policy

- **Shipping race uses Three.js** (`assets/main.js`).
- Use this skill for research, sandbox prototypes, or an explicit PlayCanvas port.
- Do not add `playcanvas` as a dependency to the shipping race without the user asking.

## Quick links

| Resource | URL |
|----------|-----|
| User manual | https://developer.playcanvas.com/user-manual/engine/ |
| API reference | https://api.playcanvas.com/engine/ |
| Examples | https://playcanvas.com/examples/ |
| Forum | https://forum.playcanvas.com |
| npm | `npm install playcanvas` |
| Scaffold | `npm create playcanvas@latest` |

## Minimal usage (sandbox only)

```js
import { Application, Entity, Color, FILLMODE_FILL_WINDOW } from 'playcanvas';
// Prefer prototypes/playcanvas/ — not assets/main.js
```

Keep art pipelines (`spritecook`, `ccgs-asset-spec`) engine-agnostic.
