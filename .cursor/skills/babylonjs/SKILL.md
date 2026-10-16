---
name: babylonjs
description: >-
  Babylon.js WebGL/WebGPU engine reference for Cursor agents. Use when the user
  asks about Babylon.js, playground samples, or comparing Babylon to Three.js.
  Do not replace Chromaracers Three.js unless explicitly requested.
---

# Babylon.js (reference)

Upstream: [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js)

## What it is

Powerful TypeScript/JavaScript 3D engine (WebGL / WebGPU) with playground, inspector, and npm packages (`babylonjs`, ES6 packages).

## Chromaracers policy

- **Shipping game uses Three.js** (`assets/main.js`).
- Use this skill for research, prototypes in a sandbox, or an explicit Babylon port request.
- Do not add Babylon as a dependency to the race without the user asking.

## Quick links

| Resource | URL |
|----------|-----|
| Playground | https://playground.babylonjs.com/ |
| Docs | https://doc.babylonjs.com/ |
| Forum | https://forum.babylonjs.com/ |
| npm | `npm install babylonjs` |
| CDN (experiments only) | https://cdn.babylonjs.com/babylon.js |

## When prototyping

1. Prefer a separate folder (e.g. `prototypes/babylon/`) — not `assets/main.js`.
2. Use ES6 packages for tree-shaking when bundling.
3. Keep art/pipeline skills (`spritecook`, `ccgs-asset-spec`) engine-agnostic.
