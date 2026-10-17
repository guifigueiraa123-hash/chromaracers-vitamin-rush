# Architecture analysis — Visual Target Phase 1

Reference: `docs/CHROMARACERS_VISUAL_TARGET.md` + `reference/reference_chromaracers_column.jpg`

## Current scene graph (`assets/main.js`)

```text
scene
├── lights (hemi, key, accent, columnFill)
├── envGroup       → Tube wall + section rings
├── silicaGroup    → Instanced stationary-phase sprites
├── flowGroup      → corridor motes (not a race floor)
├── infraGroup     → struts / panels
├── detectorGroup  → UV/Vis instrument
├── vita (Sprite)  → player
└── camera         → PerspectiveCamera, spline follow
```

Coordinate system (KEEP): `buildTrackCurve` → `frameAt` / `worldAt` → lanes / distance.

## REPLACE / ADAPT / KEEP (Phase 1 only)

| Piece | Verdict | Action |
|---|---|---|
| Spline, `frameAt`, `worldAt`, lanes, race loop | KEEP | Untouched gameplay |
| Vita sprite / rivals / obstacles / pickups / HUD | KEEP | Framing only |
| Camera follow pattern | ADAPT | Tune back/height/lookAhead for lower-middle composition |
| Column `TubeGeometry` shell | ADAPT | Continuous glass; upper arc more open/transparent |
| Section rings | ADAPT | Keep thick tori as lab section delimiters |
| Silica packing | ADAPT | Re-anchor to `columnRadius`; dense purple wall bed |
| Flow motes as “mobile phase” | REPLACE | Real blue/cyan **floor ribbon** along spline |
| Distant detector | ADAPT | Always-visible far cyan destination |
| Infra / ambient molecules / particle polish | DEFER | Hide for Phase 1 composition |

## Phase 1 deliverable

Structural composition only: camera + column + stationary walls + mobile-phase floor + distant cyan + player. No decorative particle polish, no gameplay changes.
