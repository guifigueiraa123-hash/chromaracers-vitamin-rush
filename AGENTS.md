# Agent notes — Chromaracers

## Runtimes

| Runtime | Location | Notes |
|---------|----------|--------|
| **Three.js web race** (shipping) | `index.html`, `assets/main.js` | Primary gameplay |
| **Godot 4** (optional lab) | `godot/` (other PRs) | Not a full race migration |

Do **not** replace the Three.js Chromaracers pipeline unless the user explicitly requests a Godot migration.

## Pixel-art tooling

| Tool | Role | Config |
|------|------|--------|
| **Aseprite AI Artist** | Draw / animate / export **inside Aseprite** (live window or `--headless`) | `.cursor/mcp.json` → `aseprite-ai-artist` |
| **SpriteCook** | Hosted generation / polish / tilesets (API or OAuth) | `.cursor/mcp.json` → `spritecook` |

Prefer **Aseprite AI Artist** when the user has Aseprite open (or headless with `ASEPRITE_PATH`) and wants controllable pixel edits. Prefer **SpriteCook** for cloud generation when Aseprite is unavailable.

Chromaracers mapping: `docs/references/aseprite-ai-artist.md`.

### Setup (Aseprite AI Artist)

Upstream: [with-pebbly/aseprite-ai-artist](https://github.com/with-pebbly/aseprite-ai-artist)

```bash
bash scripts/install-aseprite-ai-artist.sh
# or: npx @pebbly/aseprite-ai-artist install cursor --project --agents
npx @pebbly/aseprite-ai-artist install-extension   # then restart Aseprite
bash scripts/aseprite-ai-artist-smoke.sh
```

Requires **Aseprite 1.3+** and **Node 22.6+**. Cloud Agents without Aseprite cannot draw; report `preflight` failure instead of editing PNG/ASE files on disk.

<!-- aseprite-ai-artist:start -->
## Pixel art in Aseprite

This project has `aseprite-ai-artist` wired in as an MCP server. It draws into
the Aseprite window that is open on this machine — not into files on disk.

**Before any pixel-art work:**

1. Call `preflight`. If `ready` is false, stop and tell the person. Do **not**
   fall back to editing `.aseprite` or `.png` files directly: they would not see
   the change in their open editor, and their next save would overwrite it.
2. Call `sprite_info`. Layer names, frame count and palette come from the
   document, never from assumption.
3. Read the workflow that matches the task. The server exposes them as MCP
   resources — `skill://draw`, `skill://animate`,
   `skill://review` and others — and the craft rules as `rules://index`.
   Start with `rules://00-core-principles`.

**While working:**

- **Batch.** One `draw` call carrying every operation is correct; forty calls
  carrying one each is wrong. Every call is one undo step for the person.
- **Look at your work.** After drawing, call `look` — op `preview` for the
  overall read, op `ascii` for exact pixel positions, op `filmstrip` to review
  an animation. A tool result saying "412 pixels changed" is not evidence that
  the sprite is right.
- **Keep the palette.** `draw` and `recolor` snap colours to the sprite's
  palette by perceptual distance. If a colour you want is far from every palette
  entry, say so and ask before widening the palette.
- **Do not change what was not asked about.** No resizing, re-indexing,
  flattening or overwriting without a request.

**Before saying anything is finished:** call `validate`, fix every error, and
report the warnings you chose not to fix along with the reason.
<!-- aseprite-ai-artist:end -->
