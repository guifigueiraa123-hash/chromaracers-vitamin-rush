---
name: open-higgsfield
description: >-
  Open Higgsfield AI — open-source image/video/cinema/lip-sync studio (Flux,
  SDXL, Kling, etc. via Muapi). Use when generating concept art, column/silica
  refs, or cinematic stills for Chromaracers; or when comparing to paid
  Higgsfield. Do not commit API keys.
---

# Open Higgsfield AI (reference)

Upstream: [Autom8AI/Open-Higgsfield-AI](https://github.com/Autom8AI/Open-Higgsfield-AI)  
(fork/upstream lineage: [Anil-matcha/Open-Higgsfield-AI](https://github.com/Anil-matcha/Open-Higgsfield-AI); MIT)

Open-source alternative to **Higgsfield AI**: Image, Video, Lip Sync, and Cinema studios. Generation is powered by [Muapi.ai](https://muapi.ai) (BYOK API key in the app). Self-host with Node, use the hosted studio, or install the desktop app.

## Chromaracers policy

- **Godot lab from-scratch** (`godot/` + `scripts/muapi_generate_column_art.sh`): generate **new** silica / floor / Vita / molecules into `godot/assets/generated/` via Muapi (`MUAPI_API_KEY`). Do not reuse tip silica PNGs or the repo Vita sheet for that lab.
- Shipping Three.js race may still use existing repo sprites until explicitly regenerated.
- Do **not** replace the shipping Three.js race with generated video as the runtime.
- Do **not** commit Muapi / Higgsfield API keys. Store secrets in Cloud Agent env only when the user opts in.
- License-check every generated asset before shipping in-game.

## Ways to run

| Path | URL / command |
|------|----------------|
| Hosted (no install) | https://muapi.ai/open-higgsfield-ai |
| Repo | https://github.com/Autom8AI/Open-Higgsfield-AI |
| Local | `git clone` → `npm install` → `npm run dev` (needs Muapi key) |
| Desktop | Releases DMG / EXE on upstream GitHub Releases |

Auth to Muapi uses header `x-api-key` (submit → poll `predictions/{id}/result`).

## Cursor Higgsfield MCP (separate)

This Cloud Agent environment may expose a **Higgsfield** MCP namespace (commercial product). That MCP requires authentication (`mcp_auth`) and is **not** the same as Open Higgsfield AI.

| Tooling | What it is |
|---------|------------|
| Skill `open-higgsfield` | Open-source studio + Muapi workflow (this skill) |
| MCP `Higgsfield` | Cursor-connected commercial Higgsfield (auth required) |

Prefer this skill’s open studio / Muapi path unless the user explicitly asks to authenticate the Higgsfield MCP.

## When it helps Chromaracers

- Visual Target moodboards (glass column, purple packed silica, blue mobile-phase floor)
- Extra reference frames for Godot / Three.js art passes
- Cinema-style camera language (lens / focal) for stills — not as the game engine

## Offline note

Short mirror: `docs/references/open-higgsfield.md`
