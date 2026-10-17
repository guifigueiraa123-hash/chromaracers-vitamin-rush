#!/usr/bin/env python3
"""Generate Chromaracers Godot lab art via Muapi (Open Higgsfield backend).

Requires env MUAPI_API_KEY. Does not print the key.
Usage:
  python3 scripts/muapi_generate_column_art.py
  MUAPI_MODEL=flux-schnell python3 scripts/muapi_generate_column_art.py --only vita_c_run
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "godot" / "assets" / "generated"
BASE = "https://api.muapi.ai"

# Model id → API endpoint path segment (from Open-Higgsfield models.js)
ENDPOINTS = {
    "flux-schnell": "flux-schnell-image",
    "flux-dev": "flux-dev-image",
    "nano-banana": "nano-banana",
}

ASSETS = [
    {
        "id": "silica_cluster_a",
        "aspect_ratio": "1:1",
        "prompt": (
            "game asset sprite, isolated on pure transparent background, dense purple indigo "
            "chromatographic silica gel packed-bed cluster, irregular porous rounded particles, "
            "pixel-art friendly shading, violet #5120A8 and lavender highlights, no character, "
            "no text, no neon, laboratory science aesthetic"
        ),
    },
    {
        "id": "silica_cluster_b",
        "aspect_ratio": "1:1",
        "prompt": (
            "game asset sprite, isolated on pure transparent background, second variation of "
            "purple violet silica gel packed-bed cluster, irregular porous beads, pixel-art "
            "friendly, indigo #321B72 and #7138D4, no character, no text"
        ),
    },
    {
        "id": "silica_particle",
        "aspect_ratio": "1:1",
        "prompt": (
            "game asset sprite, isolated on pure transparent background, single small purple "
            "silica gel bead particle, porous irregular round, pixel-art friendly, indigo violet, "
            "no glow bloom, no text"
        ),
    },
    {
        "id": "mobile_phase_floor",
        "aspect_ratio": "16:9",
        "prompt": (
            "seamless tileable game texture, top-down flowing chromatographic mobile phase liquid, "
            "deep blue #0066CC with cyan #00AEEF and turquoise streaks, directional flow lines, "
            "arcade game readable, subtle highlights, no characters, no text, no purple"
        ),
    },
    {
        "id": "lab_ring",
        "aspect_ratio": "1:1",
        "prompt": (
            "game asset, laboratory chromatography column structural support ring, dark blue steel "
            "#102B55, matte metal, subtle technical bolts, no neon glow, isolated on transparent "
            "background, clean game-ready prop"
        ),
    },
    {
        "id": "analyte_molecule",
        "aspect_ratio": "1:1",
        "prompt": (
            "game asset sprite, isolated transparent background, small analyte molecule made of "
            "3 connected spheres with thin bonds, vibrant cyan magenta and orange, soft glow, "
            "pixel-art friendly, arcade collectible look, no text"
        ),
    },
    {
        "id": "vita_c_run",
        "aspect_ratio": "16:9",
        "prompt": (
            "pixel art character spritesheet, 8 frames horizontal run cycle, rear three-quarter "
            "view, ChromaRacers Vita C: anthropomorphic orange fruit head with two green leaves, "
            "white lab coat, dark blue pants, brown shoes, thick black outline, arcade 16-bit "
            "style, transparent background, consistent size, no text, no scenery"
        ),
    },
    {
        "id": "column_concept",
        "aspect_ratio": "16:9",
        "prompt": (
            "cinematic concept art, player racing inside giant glass chromatographic column, "
            "purple packed silica walls, bright blue liquid floor, pixel-art orange scientist "
            "character lower-middle, cyan vanishing light, arcade game, not spaceship corridor"
        ),
    },
]


def _request(method: str, url: str, key: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Content-Type": "application/json",
            "x-api-key": key,
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")[:300]
        raise RuntimeError(f"HTTP {e.code} {url}: {err}") from e


def submit_and_poll(key: str, endpoint: str, prompt: str, aspect_ratio: str) -> str:
    payload = {"prompt": prompt, "aspect_ratio": aspect_ratio}
    submit = _request("POST", f"{BASE}/api/v1/{endpoint}", key, payload)
    request_id = submit.get("request_id") or submit.get("id")
    if not request_id:
        url = (
            submit.get("url")
            or (submit.get("outputs") or [None])[0]
            or (submit.get("output") or {}).get("url")
        )
        if url:
            return url
        raise RuntimeError(f"No request_id in submit response: {list(submit.keys())}")

    poll_url = f"{BASE}/api/v1/predictions/{request_id}/result"
    for attempt in range(1, 61):
        time.sleep(2.0)
        data = _request("GET", poll_url, key)
        status = str(data.get("status", "")).lower()
        if status in ("completed", "succeeded", "success"):
            url = (
                (data.get("outputs") or [None])[0]
                or data.get("url")
                or (data.get("output") or {}).get("url")
            )
            if not url:
                raise RuntimeError(f"Completed but no url: {json.dumps(data)[:200]}")
            return url
        if status in ("failed", "error"):
            raise RuntimeError(f"Generation failed: {data.get('error') or data}")
        print(f"  … poll {attempt}/60 status={status or 'pending'}", flush=True)
    raise RuntimeError("Timed out polling Muapi")


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "chromaracers-muapi/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        dest.write_bytes(resp.read())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="Comma-separated asset ids to generate")
    args = parser.parse_args()

    key = os.environ.get("MUAPI_API_KEY", "").strip()
    if not key:
        print("ERROR: MUAPI_API_KEY is not set. Add it as a Cloud Agent secret, then re-run.", file=sys.stderr)
        return 2

    model = os.environ.get("MUAPI_MODEL", "flux-schnell").strip()
    endpoint = ENDPOINTS.get(model, model)
    OUT.mkdir(parents=True, exist_ok=True)

    selected = ASSETS
    if args.only:
        wanted = {x.strip() for x in args.only.split(",") if x.strip()}
        selected = [a for a in ASSETS if a["id"] in wanted]
        missing = wanted - {a["id"] for a in selected}
        if missing:
            print(f"ERROR: unknown ids: {missing}", file=sys.stderr)
            return 2

    print(f"[muapi] model={model} endpoint={endpoint} out={OUT}")
    manifest = {"model": model, "endpoint": endpoint, "assets": []}

    for asset in selected:
        dest = OUT / f"{asset['id']}.png"
        print(f"[muapi] generating {asset['id']} …", flush=True)
        try:
            url = submit_and_poll(key, endpoint, asset["prompt"], asset["aspect_ratio"])
            download(url, dest)
            print(f"[muapi] wrote {dest} ({dest.stat().st_size} bytes)")
            manifest["assets"].append({"id": asset["id"], "path": str(dest.relative_to(ROOT)), "ok": True})
        except Exception as exc:  # noqa: BLE001 — report per-asset failure
            print(f"[muapi] FAIL {asset['id']}: {exc}", file=sys.stderr)
            manifest["assets"].append({"id": asset["id"], "ok": False, "error": str(exc)})

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    failed = [a for a in manifest["assets"] if not a.get("ok")]
    print(f"[muapi] done — ok={len(manifest['assets']) - len(failed)} fail={len(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
