# Coluna HPLC — brief Godot (Van Deemter)

## Skills usadas

| Skill | Papel |
|-------|--------|
| `godot-game` | Cenas tipadas, MultiMesh, partículas, smoke headless |
| `godot-project-setup` | Estrutura `godot/scenes` + `scripts` |
| Direção visual (art-bible / mocks) | Vidro + sílica + fluxo externo + setores dinâmicos |

## Conceito

- Túnel de **vidro** com **sílica** no interior (stationary phase).
- **Fora do tubo** (visível): moléculas / bandas de concentração (multipath).
- **Pista** = um dos caminhos possíveis (termo A da Van Deemter).
- Dinâmica: scroll das lanes, tráfego exterior, bandas, neon em fase, setores (fog).

## Rodar

```bash
godot --path godot
# smoke:
godot --headless --path godot --quit-after 2
```

Shipping do Chromaracers continua em Three.js; isto é lab / preview paralelo.
