# Chromaracers × Aseprite AI Artist

Upstream: [with-pebbly/aseprite-ai-artist](https://github.com/with-pebbly/aseprite-ai-artist) (`@pebbly/aseprite-ai-artist`).

## What this is

MCP server + workflows so a coding agent **paints inside Aseprite** (live window or headless batch). Not a PNG generator behind your back: mutations are one Ctrl+Z each, and tools refuse with `doNotFallBackToDisk` when Aseprite is not attached.

## Project wiring

| Piece | Location |
|-------|----------|
| Cursor MCP | `.cursor/mcp.json` → `aseprite-ai-artist` (`npx … serve`) |
| Codex | `.codex/config.toml` |
| Gemini CLI | `.gemini/settings.json` |
| Claude Code (project) | `.mcp.json` |
| VS Code | `.vscode/mcp.json` |
| OpenCode | `.opencode/opencode.json` |
| Agent rules | `AGENTS.md` (official block + Chromaracers notes) |
| Cursor skill | `.cursor/skills/aseprite/SKILL.md` |
| Install | `bash scripts/install-aseprite-ai-artist.sh` (`install --all --project`) |
| Smoke | `bash scripts/aseprite-ai-artist-smoke.sh` |
| Doctor | `npx @pebbly/aseprite-ai-artist doctor` |

## Workflows (MCP prompts / `skill://`)

Default entry: **`aseprite:studio`**.

| Workflow | Use for Chromaracers |
|----------|----------------------|
| `aseprite:studio` | Any open-ended pixel request |
| `aseprite:brief` | Decide size / palette / view once |
| `aseprite:concept` | Spec + optional concept sheet before drawing |
| `aseprite:new` | Fresh `.aseprite` document |
| `aseprite:palette` | Match Vita C / silica / lab look |
| `aseprite:draw` | Silhouette + flats |
| `aseprite:shade` | Volume without breaking palette |
| `aseprite:rig` | Separable limbs before animation |
| `aseprite:animate` | Run / jump / hit / victory cycles |
| `aseprite:tileset` | Column wall / silica patterns |
| `aseprite:fix` | Edit an existing sheet already open |
| `aseprite:review` | Cold critique before ship |
| `aseprite:export` | Spritesheet / GIF / PNGs into `assets/` |
| `aseprite:submit` | Optional gallery PR (upstream community) |

## Asset targets in this repo

Ship into `assets/` for the Three.js race (`index.html`, `assets/main.js`).

| Subject | Examples already in `assets/` | Suggested Aseprite work |
|---------|-------------------------------|-------------------------|
| Vita C | `vita-c-*.png`, run sheets | Idle / run / collect / hurt cycles |
| Captain Caffeine | `captain-caffeine-*.png` | Attack / boost / victory polish |
| Aroma | `aroma-*.png` | Side / wave / skid consistency |
| Lab props | `detector-uv-vis.png`, `silica-back.png` | Column / detector / silica tiles |

**Pipeline:** `aseprite:studio` → (brief/concept if open-ended) → draw/shade → animate → review → **export into `assets/`** → smoke the web race (`python3 -m http.server`).

## Live vs headless

| Mode | When |
|------|------|
| **Live** (default) | Local Desktop with Aseprite open — user watches and can undo |
| **Headless** | CI / Cloud Agent with `ASEPRITE_PATH` and `install … --headless` |

Cloud Agents **without** Aseprite: call `preflight`, report failure, stop. Never edit shipping PNGs as a substitute.

## vs SpriteCook

| | Aseprite AI Artist | SpriteCook |
|--|--------------------|------------|
| Needs | Local/headless Aseprite | API key or OAuth |
| Output | Document in Aseprite → export | Hosted generate / polish |
| Best for | Precise pixel control, animation tags | Fast concept / batch gen |

They can chain: SpriteCook draft → open in Aseprite → `aseprite:fix` / `animate` → export.
