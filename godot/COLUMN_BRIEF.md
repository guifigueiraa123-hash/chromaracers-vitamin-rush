# Coluna HPLC — brief Godot (Visual Target)

## Direction

Full visual spec (do not invent a parallel look):

- [`docs/CHROMARACERS_VISUAL_TARGET.md`](../docs/CHROMARACERS_VISUAL_TARGET.md)
- Reference: [`docs/reference_chromaracers_column.jpg`](../docs/reference_chromaracers_column.jpg)
- Lab art lock: [`ART_BIBLE_COLUMN.md`](ART_BIBLE_COLUMN.md)

## Skills

| Skill | Papel |
|-------|--------|
| `godot-game` | Cenas tipadas, MultiMesh, partículas, smoke headless, Web export |
| `godot-project-setup` | Estrutura `godot/scenes` + `scripts` |
| `ccgs-art-bible` / Visual Target | Paleta §11, hierarquia §1, anti-lista §13 |
| `ccgs-asset-spec` | Sílica / piso / moléculas / Vita |
| `open-higgsfield` | Moodboards opcionais (não runtime) |

## Conceito (Van Deemter + referência)

- Túnel de **vidro** com anéis **lab/metal** (não neon sci-fi).
- **Sílica roxa** packed nas paredes (stationary phase).
- **Piso** = fase móvel azul/ciano larga com scroll de velocidade.
- Moléculas coloridas **dentro** do tubo.
- Vita C pixel no lower-middle; vanishing point ciano.

## Rodar

```bash
godot --path godot
godot --headless --path godot --quit-after 2
# screenshots (optional):
godot --path godot --script res://tools/capture_views.gd
```

Shipping Chromaracers continua em **Three.js**; isto é lab / preview paralelo.
