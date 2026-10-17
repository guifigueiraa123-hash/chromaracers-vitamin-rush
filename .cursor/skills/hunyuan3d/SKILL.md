---
name: hunyuan3d
description: >-
  Tencent Hunyuan3D-2.1 — open image-to-3D with production-oriented PBR textures.
  Use when generating high-fidelity meshes/materials for Chromaracers props on a
  local GPU, or pointing to the HF demo. Community license with territory limits.
---

# Hunyuan3D 2.1 (image → 3D + PBR)

Upstream: [Tencent-Hunyuan/Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1)

Open image-to-shape + **PBR paint** pipeline (shape DiT ~3.3B, paint ~2B). Official site / HF models / Gradio demo. VRAM (upstream): ~10 GB shape, ~21 GB texture, ~29 GB both.

## License (read before use)

**Tencent Hunyuan 3D 2.1 Community License** — not MIT/Apache.

- **Territory:** license does **not** apply in the **EU, UK, or South Korea**.
- Products/services with **>1M monthly active users** need a separate commercial license from Tencent.
- Distribution/notice requirements apply; see upstream `LICENSE` / `Notice.txt`.
- Do not use Outputs to improve unrelated AI models (per license rules of use).

Agents must flag these constraints before suggesting Hunyuan assets in shipping Chromaracers builds.

## Chromaracers policy

- Strong candidate for **local** silica / prop / molecule meshes with PBR look (vs Stable-Dreamfusion research WIP).
- Prefer **HF demo** or user’s GPU box; Cloud Agents usually lack 29 GB VRAM — do not assume this runs in the cloud VM.
- Do **not** replace the Three.js shipping race or commit multi‑GB weights into the repo.
- Compare with skills `modly` (simpler local image→mesh GUI) and `stable-dreamfusion` (older research stack).

## Quick links

| Resource | URL |
|----------|-----|
| Repo | https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 |
| Official site | https://3d.hunyuan.tencent.com |
| HF models | https://huggingface.co/tencent/Hunyuan3D-2.1 |
| HF demo | https://huggingface.co/spaces/tencent/Hunyuan3D-2.1 |
| Report | https://arxiv.org/pdf/2506.15442 |
| ComfyUI community | https://github.com/visualbruno/ComfyUI-Hunyuan3d-2-1 |

## Local install sketch (user machine)

```bash
# Python 3.10 + torch 2.5.1+cu124 (per upstream)
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
# then follow hy3dpaint custom_rasterizer build steps in upstream README
```

Import only small exported glTF/GLB into Chromaracers after visual + license review.

## Offline note

Short mirror: `docs/references/hunyuan3d.md`
