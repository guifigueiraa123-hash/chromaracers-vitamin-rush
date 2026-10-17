---
name: stable-dreamfusion
description: >-
  Stable-Dreamfusion — PyTorch text-to-3D / image-to-3D (NeRF + Stable Diffusion)
  by ashawkey. Use when researching or running local DreamFusion-style mesh
  generation. WIP quality; prefer threestudio for newer pipelines. Needs GPU.
---

# Stable-Dreamfusion (text/image → 3D research)

Upstream: [ashawkey/stable-dreamfusion](https://github.com/ashawkey/stable-dreamfusion) (Apache-2.0)

PyTorch reimplementation of **DreamFusion** using **Stable Diffusion** (+ Instant-NGP NeRF backbone options). Supports text-to-3D, image-to-3D, and mesh export. **Work-in-progress** — many prompts fail; upstream recommends [threestudio](https://github.com/threestudio-project/threestudio) for newer/better 3D generation.

## Chromaracers policy

- Reference / R&D for **local GPU** 3D asset experiments (column props, silica forms).
- Do **not** block shipping Three.js or Godot lab work on DreamFusion training runs.
- Do **not** commit multi‑GB checkpoints into the Chromaracers repo.
- Cloud Agents typically **cannot** train this (GPU + long jobs) — document commands for the user’s machine; prefer Modly for a simpler local image→mesh GUI when that fits.

## Quick links

| Resource | URL |
|----------|-----|
| Repo | https://github.com/ashawkey/stable-dreamfusion |
| Install | `pip install -r requirements.txt` |
| Colab (Instant-NGP) | linked from upstream README |
| Newer stack | https://github.com/threestudio-project/threestudio |

## Typical local flow (user GPU)

```bash
git clone https://github.com/ashawkey/stable-dreamfusion.git
cd stable-dreamfusion
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# see upstream README for Zero-1-to-3 / Omnidata weights if image-conditioned
```

Export meshes only after visual QA; keep outputs out of git unless small and explicitly requested.

## Offline note

Short mirror: `docs/references/stable-dreamfusion.md`
