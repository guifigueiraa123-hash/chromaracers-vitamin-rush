---
name: bullet3
description: >-
  Bullet Physics (bullet3 / PyBullet) reference for Cursor agents. Use when the
  user asks about rigid-body physics, collision, PyBullet, or integrating Bullet
  with a game engine. Chromaracers does not ship Bullet unless explicitly requested.
---

# Bullet Physics SDK (reference)

Upstream: [bulletphysics/bullet3](https://github.com/bulletphysics/bullet3)

Real-time collision detection and multi-physics simulation (C++ SDK). **PyBullet** Python bindings are the common path for robotics / RL / quick experiments.

## Chromaracers policy

- The Three.js race uses lightweight / custom motion — **no Bullet dependency** today.
- Use this skill when designing physics, comparing engines, or prototyping collisions.
- Do not vendor the full Bullet tree into this repo; link and optionally add a thin WASM/native binding only if the user requests it.

## Quick links

| Resource | URL |
|----------|-----|
| Repo | https://github.com/bulletphysics/bullet3 |
| PyBullet site | https://pybullet.org |
| Forums | https://bulletphysics.github.io |
| PyBullet quickstart | https://docs.google.com/document/d/10sXEhzFRSnvFcl3XxNGhnD4N2SedqwdAvK3dsihxVUA |

## PyBullet smoke (optional local experiment)

```bash
pip3 install pybullet --upgrade --user
python3 -c "import pybullet as p; print('pybullet', p.getAPIVersion())"
```

## When wiring into a game

1. Prefer engine-native physics first (Godot Physics, PlayCanvas rigidbody, cannon/ammo with Three.js) unless Bullet-specific features are required.
2. Keep simulation timestep and collision layers documented if adding Bullet.
3. Store prototypes under `prototypes/bullet/` — not in shipping `assets/main.js`.
