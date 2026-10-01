# CHROMARACERS — Environment Asset Audit & Design Plan

**Status:** PLAN ONLY — no code changes, no asset replacement, no environment implementation in this stage.  
**Game:** Chromaracers: Vitamin Rush  
**Stack:** Three.js r180 (local), WebGL, client-only  
**Reference characters:** Vita C, Captain Caffeine, Aroma, Lady Paraben (64×64 pixel-art frames)  
**Race length:** 1500 m · **Lanes:** 3 · **Column radius (world units):** 10.4  

---

## 1. Diagnóstico atual

### 1.1 Estrutura do repositório (inspeção)

```
chromaracers-vitamin-rush/
├── index.html
├── README.md
├── docs/environment/          ← este plano
└── assets/
    ├── main.js                ← cena, spline, gameplay, ambiente (monólito)
    ├── styles.css
    ├── three.module.js
    ├── three.core.js
    ├── vita-c-run-final-spritesheet.png
    ├── captain-caffeine-*.png
    ├── aroma-*.png
    ├── silica-back.png        ← único texture ambiental “sílica/parede”
    └── detector-uv-vis.png    ← único sprite ambiental “detector”
```

Não existe hoje pasta `assets/environment/`. Quase todo o ambiente é **procedural** (geometria + `MeshBasicMaterial` / alguns `MeshStandardMaterial` em rivais).

### 1.2 Sistemas Three.js relevantes (comportamento — NÃO alterar nesta etapa)

| Sistema | Onde | Função |
|---|---|---|
| Spline | `buildTrackCurve` → `CatmullRomCurve3` | Espinha da pista 1500 m |
| Frame / world | `frameAt`, `worldAt` | Posição em distância + lane + lift |
| Lanes | `LANES = [-1,0,1]`, `laneWidth: 2.15` | Gameplay lateral |
| Câmera | 3ª pessoa atrás do player | `back 7.2`, `height 3.55`, FOV 62→71 boost |
| Ambiente | `envGroup`, `flowGroup` (+ detector sprite) | Anéis Torus + beads + tubos de fluxo (em `main`) |
| Qualidade | `qualityState.particleMul`, `ringStep` | Densidade / step de anéis |
| Loader | `THREE.TextureLoader` | Carrega `silica-back`, `detector-uv-vis`, sheets de personagens |
| Instancing | parcial / ausente em `main` atual | Beads são `Mesh` individuais; rewrite em PR paralelo usa `InstancedMesh` |
| Pooling | arrays `flowParticles`, obstacles, pickups, streaks | Recicla offsets; não há pool de texturas ambientais |
| Iluminação | Hemisphere + Directional + Point (accent) + FogExp2 | Estilizada, não cinematográfica |
| Detector | Sprite billboard no fim da corrida | `detector-uv-vis.png` |

### 1.3 O que produz cada leitura visual hoje

| Conceito | Produzido por | Tipo |
|---|---|---|
| Sílica | Esferas `Mesh` coloridas + mapa `silica-back.png` em shells cilíndricas | Procedural + 1 textura tiled |
| Paredes / coluna | `TorusGeometry` rings + `CylinderGeometry` shells com `silica-back` | Geometria + textura |
| Fluxo / “pista” | 3× `TubeGeometry` ciano por lane + glow | Procedural (lê como estrada) |
| Moléculas (gameplay) | Collectibles esferas; obstáculos sphere/icosa/bubble | Procedural |
| Moléculas (ambiente) | Poucas esferas no fluxo (`isMol`) | Procedural |
| Estruturas | Anéis Torus metálicos / cyan | Procedural (lê como portal/túnel) |
| Detector UV/Vis | Sprite `detector-uv-vis.png` | Asset 2D |
| Partículas / velocidade | Cubos/streaks pixel no boost | Procedural |

### 1.4 Diagnóstico crítico (Art Direction gap)

**Leitura desejada:**  
> “Corrida arcade 16-bit *dentro* de uma coluna cromatográfica.”

**Leitura atual (risco):**  
> “Corrida futurista em um túnel com faixas de luz e anéis.”

| Problema | Evidência | Efeito |
|---|---|---|
| Anéis Torus | `geo.torusRing` / `torusInner` ao longo do spline | Portais / cyberpunk tunnel |
| Três tubos de fluxo sólidos | `mats.flow[li]` por lane | Estrada / rodovia neon |
| `silica-back.png` como wallpaper da parede | Tile em shell; composição com corredor central vazio | Parede “orgânica” / caverna, não packing granular discreto |
| Detector com grid floor + neon gateway | Arte do sprite | Portal futurista, não housing científico |
| Poucos assets ambientais | Só 2 PNGs de ambiente | Linguagem visual depende demais de geometria genérica |
| Sílica como esferas grandes lisas | Beads `sphereS` | Pode parecer pedra/bolha, não packing de sílica pixel |

**O que já funciona e deve ser preservado (comportamento):**  
spline, câmeras, 3 lanes, player/rivais sprites, obstáculos, collectibles, boost, 1500 m, HUD/menu/leaderboard, Three local sem CDN, progressão por setores, presença de um marco UV/Vis no fim.

### 1.5 Princípio visual (alvo)

```
COLUNA (espaço)
+ SÍLICA / FASE ESTACIONÁRIA (granular, nas paredes)
+ FASE MÓVEL (fluxo 3D ao redor do personagem)
+ MOLÉCULAS (tráfego ambient + gameplay separados)
+ INFRAESTRUTURA (escala técnica)
+ UV/VIS (marco científico final)
```

A pista **não** é uma estrada independente dentro de um túnel.  
O jogador corre **no volume interno da coluna**, no fluxo da fase móvel.

---

## 2. Inventário dos assets

### 2.1 Assets de personagem (referência de AD — não são ambiente)

| Asset | Dimensões | Formato | Transparência | Uso |
|---|---|---|---|---|
| `vita-c-run-final-spritesheet.png` | 512×64 (8×64×64) | PNG RGBA | Sim | Player Sprite, NearestFilter |
| `captain-caffeine-*.png` | 256–512 × 64 | PNG RGBA | Sim | Rival Sprite |
| `aroma-*.png` | 128–512 × 64 | PNG RGBA | Sim | Rival Sprite |
| Lady Paraben | — | Geometria procedural | — | Rival sem sheet |

**Traits de AD a espelhar no ambiente:** contorno preto forte, cores em blocos, highlights controlados (1–2 níveis), silhueta legível a ~64 px, sem blur, sem PBR.

### 2.2 Assets ambientais existentes

| Asset | Dimensões | Formato | Alpha | Uso atual no Three.js |
|---|---|---|---|---|
| `silica-back.png` | 960×540 | PNG RGBA | Canal alpha presente; fundo branco opaco nas áreas vazias | `MeshBasicMaterial.map` em shells cilíndricas, `RepeatWrapping` 4×2 (main) |
| `detector-uv-vis.png` | 640×420 | PNG RGBA | Sim (borda) | `Sprite` / `SpriteMaterial` no fim da corrida; scale ~10×6.6 world units |

### 2.3 “Assets” implícitos (procedurais — não são arquivos)

| ID lógico | Implementação | Família |
|---|---|---|
| silica-bead | `SphereGeometry` + material azul | Silica |
| column-ring | `TorusGeometry` | Column (problemático) |
| lane-flow-tube | `TubeGeometry` por lane | Mobile phase (problemático) |
| flow-particle | pequena esfera/cubo | Mobile phase |
| ambient-mol | esfera ocasional | Molecules |
| obstacle-* | sphere / icosa / bubble | Molecules (gameplay) |
| collectible-* | sphere colorida | Molecules (gameplay) |
| boost-streak | box along tangent | Speed FX |
| detector-housing | (ausente em main; só sprite) | UV/Vis |

---

## 3. Classificação KEEP / ADAPT / REPLACE / CREATE

### 3.1 Assets de arquivo

| Asset | Classificação | Motivo objetivo |
|---|---|---|
| Character sheets (Vita/Captain/Aroma) | **KEEP** | Referência AD e gameplay; fora do escopo ambiental |
| `silica-back.png` | **REPLACE** | Composição com corredor central vazio reforça “pista”; esferas grandes tipo bolha/pérola; tiling em parede produz leitura de caverna/parede orgânica, não packing discreto de sílica. Não reutilizar como textura única da coluna. |
| `detector-uv-vis.png` | **REPLACE** | Contém gateway neon, grid floor e túnel — conflita com “não portal / não cyberpunk”. O painel com cromatograma é conceito útil, mas a peça completa não serve como housing científico modular. |
| `three.module.js` / `three.core.js` | **KEEP** | Runtime; fora do escopo artístico |
| `styles.css` / HUD | **KEEP** | UI; fora do escopo 3D ambiente |

### 3.2 Construções procedurais (direção para etapa futura de implementação — não alterar agora)

| Elemento | Classificação | Motivo |
|---|---|---|
| Torus rings | **REPLACE** (comportamento visual) | Leitura portal/túnel |
| 3 tubos de lane sólidos | **REPLACE** | Leitura estrada |
| Beads esféricos grandes | **ADAPT→CREATE sprites** | Ideia de packing ok; forma/material devem virar partículas pixel granulares |
| Flow particles | **ADAPT** | Manter comportamento; trocar aparência para sprites pixel |
| Boost streaks | **ADAPT** | Manter; alinhar a `flow-streak` / `flow-spark` |
| Detector sprite único | **REPLACE** por família modular UV/Vis | Housing + window + emitter separados |
| Obstáculos / collectibles | **ADAPT** (fase posterior) | Separar visualmente de ambient molecules; fora da prioridade 1–4 de ambiente |

### 3.3 Novos assets a CREATE

Ver seção 4 (Asset Families). Tudo marcado CREATE abaixo não existe como arquivo adequado hoje.

---

## 4. Asset Families

### A — SILICA / STATIONARY PHASE (prioridade 1)

| Nome | Classificação | Notas |
|---|---|---|
| `silica-particle-small` | CREATE | Grit / far & mid density |
| `silica-particle-medium` | CREATE | Mid packing bead |
| `silica-particle-large` | CREATE | Near / foreground bead |
| `silica-cluster-small` | CREATE | 3–5 beads fused, ainda granular |
| `silica-cluster-medium` | CREATE | Aglomerado wall-bound |
| `silica-cluster-large` | CREATE | Raro; âncora visual de packing |

**Deve parecer:** grãos/packing de sílica cromatográfica (esferas rígidas, poros sutis em pixel).  
**Não deve parecer:** pétala, flor, pedra, cristal afiado, coral, parede orgânica, bolha de sabão.

### B — MOBILE PHASE (prioridade 3)

| Nome | Classificação | Notas |
|---|---|---|
| `flow-particle-small` | CREATE | Solvente discreto |
| `flow-particle-medium` | CREATE | Corpo do fluxo |
| `flow-particle-large` | CREATE | Near, raro |
| `flow-streak` | CREATE | Boost / alta velocidade (pixel streak) |
| `flow-spark` | CREATE | Highlight pontual |

### C — MOLECULES (prioridade 4)

| Nome | Classificação | Notas |
|---|---|---|
| `molecule-blue-{s,m,l}` | CREATE | Ambient / neutral |
| `molecule-green-{s,m,l}` | CREATE | Ambient / vitamin cue |
| `molecule-orange-{s,m,l}` | CREATE | Ambient / energy cue |
| `molecule-red-{s,m,l}` | CREATE | Interferent cue (cuidado vs obstáculos) |
| `molecule-purple-{s,m,l}` | CREATE | Ambient / silica-adjacent |

Gameplay collectibles/obstacles permanecem logicamente separados; estes sprites são **tráfego ambiental** (categoria A do brief visual).

### D — COLUMN STRUCTURE (prioridade 2)

| Nome | Classificação | Notas |
|---|---|---|
| `column-wall` | CREATE | Tile/detail de parede interna (não panorama da coluna) |
| `column-wall-detail` | CREATE | Painel / packing retainer |
| `column-support` | CREATE | Strut lateral |
| `column-connector` | CREATE | Junta técnica |
| `column-bracket` | CREATE | Suporte curto |
| `column-tube` | CREATE | Capilar / canal lateral (não pista) |
| `column-light` | CREATE | Ponto de luz técnica |
| `column-sensor` | CREATE | Sensor pequeno |

**Proibido:** anéis-portais atravessando a pista; faixas de rodovia; céu; arquitetura urbana.

### E — UV/VIS (prioridade 6)

| Nome | Classificação | Notas |
|---|---|---|
| `uvvis-housing` | CREATE (REPLACE do detector atual) | Corpo do detector |
| `uvvis-window` | CREATE | Janela óptica |
| `uvvis-emitter` | CREATE | Fonte UV/Vis |
| `uvvis-sensor` | CREATE | Sensor / photodiode stylized |
| `uvvis-panel` | CREATE | Painel com cromatograma simples (herda ideia do asset atual) |
| `uvvis-connector` | CREATE | Ligação coluna→detector |
| `uvvis-light` | CREATE | Glow pixel controlado |

Opcional (só se necessário depois do polish): `uvvis-label` (texto “UV/Vis” pixel). Não adicionar mais famílias agora.

---

## 5. Escala (personagens 64×64 como referência)

**Referência de mundo:** Vita C sprite scale ≈ `3.1` world units ≈ “personagem 64 px”.  
**Largura de lane:** 2.15 · **Raio da coluna:** 10.4 · **Distância da corrida:** 1500 m.

| Família | Tamanho asset (px) | Tamanho world (aprox.) | Distância / profundidade | Densidade / qtd. em cena (high) | Frequência |
|---|---|---|---|---|---|
| Silica particle S | 16×16 | 0.08–0.16 | Far wall (r≈9.5–11) | 250–350 instâncias visíveis na janela | Contínua |
| Silica particle M | 24×24 | 0.16–0.32 | Mid wall (r≈8.2–9.6) | 150–220 | Contínua |
| Silica particle L | 32×32 | 0.28–0.55 | Near wall (r≈7.0–8.4) | 80–120 | Contínua |
| Silica cluster S/M/L | 32–64 | 0.35–0.9 | Wall-bound only | 20–40 clusters no length total | A cada ~40–80 m |
| Flow particle S/M/L | 8–24 | 0.04–0.14 | Lanes ± jitter, lift 0–1 | 120–200 ativos (pool) | Contínua |
| Flow streak | 8×32 | 0.06×0.4–1.2 | Near player no boost | 8–16 | Só high speed/boost |
| Flow spark | 8×8 | 0.05–0.1 | Mid | 10–20 | Pulsos |
| Molecule S/M/L | 16 / 24 / 32 | 0.12–0.35 | Lanes + parallax lifts | 25–45 ambient | Contínua, velocidade variada |
| Column support/bracket | 32–64 | 0.2–0.5 thickness, length 2–3 | Lateral wall | ~40–60 ao longo dos 1500 m | A cada ~25–40 m |
| Column wall tile | 64×64 ou 128×128 | tiled on tube | BackSide wall | 1 material compartilhado | Contínua |
| UV/Vis housing | 128×128 (ou sheet modular) | housing ~8–12 wide | Fim (1450–1500) | 1 conjunto | Único marco |

**Regras de escala**

1. Sílica: **pequena e numerosa**; nunca maior que ~⅓ da altura do personagem no foreground.  
2. Moléculas ambient: legíveis, mas menores que collectibles/obstacles de gameplay.  
3. Infraestrutura: estabelece “isto é instrumento”, não decora a pista como arco.  
4. Detector: domina o campo só nos últimos ~50 m.

---

## 6. Paleta

| Papel | Cores (hex alvo) | Uso |
|---|---|---|
| Base / profundidade | `#0D1530` `#0C1830` `#151A3A` `#1A1540` | Fog, outer shell, vazio |
| Coluna / metal estilizado | `#1C2E4D` `#243A62` `#3A6EA8` | Housing, struts, brackets |
| Sílica | `#B8A0E8` `#7A6BC4` `#4A3A8A` + hi `#E8E0FF` | Packing beads |
| Fase móvel | `#5DE5FF` `#3ECFFF` `#9ADFFF` | Flow particles / streaks |
| Moléculas | Laranja `#F28C28` · Azul `#5DE5FF` · Verde `#43C95A` · Vermelho/magenta `#D9368A` · Roxo `#9B6DFF` | Ambient traffic |
| Accents | Ciano `#5DE5FF` · Magenta `#D9368A` · Laranja/dourado `#FFD447` / `#F28C28` | Painéis, UV, collectible cues |
| Contorno | `#0A0A12` / preto | Mesma linguagem dos personagens |

**Contraste:** não pintar tudo de azul — sílica lavanda + fluxo ciano + moléculas multicolor + accents laranja nos instrumentos.

---

## 7. Art Direction

### 7.1 Direção

**“Coluna cromatográfica 3D reinterpretada como jogo arcade pixel art 16-bit.”**

Referência obrigatória: sheets de Vita C / Captain / Aroma.

### 7.2 Regras positivas

- Pixel clusters; contornos definidos  
- Cores em blocos (2–4 tons por objeto)  
- Highlights controlados (canto superior)  
- Formas simples e legíveis  
- `NearestFilter` em sprites  
- Materiais simples no Three (`MeshBasic` / sprite)  
- Ciência na composição espacial (packing, fluxo, detector), não em texto explicativo  

### 7.3 Proibições

- Fotorealismo / PBR / metal realista  
- Blur, motion blur fotográfico, bloom excessivo  
- Anti-aliasing como linguagem visual (renderer já pode estar `antialias: false`)  
- Neon genérico cyberpunk  
- Túnel futurista, estrada, portal-argola, caverna, coral, céu, cidade  
- Panorama 2D gigante substituindo o 3D  
- Uma única imagem que “é a coluna inteira”

### 7.4 Asset vs comportamento

```
ASSET (PNG sprite / tile)     → aparência
THREE.JS                      → InstancedMesh / pool / spline follow
                              → profundidade, parallax, velocidade, setores
```

Nunca: um PNG 4K da coluna inteira como fundo.  
Sempre: peças pequenas × muitas instâncias ao longo do mesmo spline.

---

## 8. Prompts de geração (Skill)

Cada prompt abaixo é para assets **CREATE** ou **REPLACE**.  
Estilo compartilhado: **16-bit pixel art arcade, contorno preto, cores em bloco, fundo transparente, sem PBR, sem blur.**  
Perspectiva padrão: **orthographic / slightly 3⁄4** para props; **flat billboard-friendly** para partículas.  
Uso Three.js: `TextureLoader` + `Sprite` ou mapa em `InstancedMesh` (Plane/Box) com `NearestFilter`.

---

### 8.1 SILICA

#### Prompt — `silica-particle-small.png`

- **Nome:** silica-particle-small  
- **Finalidade:** grão de sílica far/mid (fase estacionária)  
- **Estilo:** 16-bit pixel art; 2–3 tons lavanda/violeta; 1 highlight branco-azulado; contorno preto  
- **Perspectiva:** frontal, esférico simplificado (quase círculo pixel)  
- **Paleta:** `#B8A0E8` `#7A6BC4` `#4A3A8A` `#E8E0FF` + outline `#0A0A12`  
- **Dimensões:** 16×16  
- **Transparência:** PNG RGBA; fundo 100% transparente  
- **Escala:** ~1/8 da altura do personagem 64×64  
- **Silhueta:** disco/esfera granular compacta  
- **Detalhes:** 1–2 poros pixel (dots escuros); sem brilho especular realista  
- **Limitações:** máximo 4 cores + outline  
- **Proibido:** pétala, flor, pedra irregular, cristal, coral, glow neon, sombra projetada  
- **Relação com personagens:** mesma dureza de contorno de Vita C; menos saturação que o laranja do personagem  
- **Uso Three.js:** InstancedMesh far layer; muitos; quase estáticos no wall band  

#### Prompt — `silica-particle-medium.png`

- Igual small, **24×24**, poros um pouco mais legíveis, highlight maior (2×2 px). Mid layer.

#### Prompt — `silica-particle-large.png`

- Igual small, **32×32**, near layer; ainda menor que ⅓ do personagem; packing bead óbvio.

#### Prompt — `silica-cluster-small.png`

- **Nome:** silica-cluster-small  
- **Finalidade:** aglomerado de 3–4 beads fused  
- **Estilo / paleta:** idênticos à família sílica  
- **Dimensões:** 32×32  
- **Silhueta:** irregular mas **granular** (círculos sobrepostos), não blob orgânico  
- **Proibido:** forma de flor, coral, pedra  
- **Uso Three.js:** InstancedMesh wall-bound, baixa contagem  

#### Prompt — `silica-cluster-medium.png` / `silica-cluster-large.png`

- **48×48** e **64×64**; 5–8 beads; só wall; raros; nunca bloqueiam o centro da coluna.

---

### 8.2 COLUMN

#### Prompt — `column-wall.png`

- **Nome:** column-wall  
- **Finalidade:** tile da parede interna da coluna (steel/glass científico estilizado + hint de packing)  
- **Estilo:** 16-bit; painéis em blocos; sem perspectiva de túnel infinito no tile  
- **Perspectiva:** flat tile seamless (ou quase)  
- **Paleta:** base `#1C2E4D` `#243A62`, detalhes `#3A6EA8`, micro-sílica `#7A6BC4`  
- **Dimensões:** 128×128  
- **Transparência:** opaco ou alpha só em furos de packing; preferir opaco + overlay separado  
- **Silhueta:** quadrado tile; bordas que tilem  
- **Detalhes:** rivets pixel, micro-grid técnico sutil, **sem** faixa de estrada, **sem** neon chase  
- **Proibido:** céu, janela para exterior, grid floor, portal, logo genérico sci-fi  
- **Uso Three.js:** `map` em `TubeGeometry` BackSide **ou** painéis instanciados; repeat controlado  

#### Prompt — `column-wall-detail.png`

- **64×64** painel retainer / frit hint; montado pontualmente nas paredes.

#### Prompt — `column-support.png`

- **32×64** strut vertical/horizontal pixel; azul metálico estilizado; contorno preto.  
- **Uso:** InstancedMesh laterais seguindo spline.

#### Prompt — `column-connector.png` / `column-bracket.png`

- **32×32** juntas e brackets; poucos pixels de accent ciano (1 fila).

#### Prompt — `column-tube.png`

- **48×16** segmento de tubo/capilar; **não** é lane de corrida; fica na parede/teto da coluna.

#### Prompt — `column-light.png` / `column-sensor.png`

- **16×16** / **24×24** emissive-looking pixels (ciano/magenta controlado); pontos técnicos.

---

### 8.3 MOBILE PHASE

#### Prompt — `flow-particle-small.png`

- **8×8** pixel solvent; ciano `#5DE5FF` + 1 tom mais escuro; fundo transparente; sem trail.  
- Billboard / instanced.

#### Prompt — `flow-particle-medium.png` / `flow-particle-large.png`

- **16×16** / **24×24**; mesmo idioma; large raro no near field.

#### Prompt — `flow-streak.png`

- **8×32** (vertical no asset = along tangent no Three via quaternion); pixel streak para boost; alpha soft nas pontas **em degraus pixel**, não blur gaussiano.  
- **Proibido:** motion blur fotográfico.

#### Prompt — `flow-spark.png`

- **8×8** spark/diamond pixel; accent branco-ciano.

---

### 8.4 MOLECULES (ambient)

Para cada cor (blue, green, orange, red, purple), gerar **small 16 / medium 24 / large 32**.

#### Prompt template — `molecule-{color}-{size}.png`

- **Finalidade:** molécula ambiental atravessando a coluna (não collectible, não obstacle)  
- **Estilo:** 16-bit; forma tipo hexágono/bola simples com 1–2 “átomos” satélite opcionais (máx. 3 círculos)  
- **Perspectiva:** flat / slight 3⁄4  
- **Paleta:** cor da família + 1 sombra + 1 highlight + outline preto  
- **Transparência:** sim  
- **Silhueta:** legível a distância; não parecer power-up de UI (evitar estrela/cruz)  
- **Proibido:** texto, glow bloom, transparency soft brush  
- **Relação:** saturação similar aos accents dos personagens, mas escala menor  
- **Uso Three.js:** pool de Sprites/Meshes ambient; velocidades e lifts variados; **não** colidem  

Cores:

| Suffix | Hex principal |
|---|---|
| blue | `#5DE5FF` |
| green | `#43C95A` |
| orange | `#F28C28` |
| red | `#D9368A` |
| purple | `#9B6DFF` |

---

### 8.5 UV/VIS (REPLACE de `detector-uv-vis.png`)

#### Prompt — `uvvis-housing.png`

- **Nome:** uvvis-housing  
- **Finalidade:** corpo do detector UV/Vis no fim da coluna  
- **Estilo:** 16-bit instrumento analítico arcade; bloco técnico; **sem** gateway de corrida  
- **Perspectiva:** 3⁄4 frontal (billboard-friendly)  
- **Paleta:** `#1C2E4D` `#243A62` `#3A6EA8` + accents ciano/laranja pontuais  
- **Dimensões:** 128×128  
- **Transparência:** sim (fora da silhueta)  
- **Silhueta:** housing retangular com abertura central da coluna (não arco de neon)  
- **Detalhes:** painéis, parafusos pixel, entrada da coluna integrada  
- **Proibido:** grid floor, estrada, portal circular neon, sky, texto longo (exceto espaço para panel separado)  
- **Relação:** mesma linguagem blocky dos lab coats dos personagens  
- **Uso Three.js:** Sprite ou plano no `detectorGroup`; escala cresce 1450→1500 m  

#### Prompt — `uvvis-window.png`

- **64×64** janela óptica; vidro estilizado em pixels ciano/lavanda; sem realismo.

#### Prompt — `uvvis-emitter.png` / `uvvis-sensor.png`

- **32×32** fonte UV e sensor; accents `#C9A0FF` / `#5DE5FF`.

#### Prompt — `uvvis-panel.png`

- **64×40** (ou 64×64) tela com **cromatograma pixel** (linha + 2–3 picos) e label curta `UV/Vis`.  
- Herda a *ideia* do painel do asset atual; **sem** redesenhar o gateway inteiro.

#### Prompt — `uvvis-connector.png`

- **64×32** flange coluna↔detector.

#### Prompt — `uvvis-light.png`

- **16×16** glow pixel (quadrado/diamante); AdditiveBlending no Three; intensidade controlada.

---

## 9. Estrutura de pastas proposta

Adaptada à árvore atual (tudo sob `assets/`), sem mover personagens nesta etapa:

```
assets/
├── main.js
├── styles.css
├── three.module.js
├── three.core.js
├── vita-c-*.png
├── captain-caffeine-*.png
├── aroma-*.png
├── silica-back.png              ← legado (REPLACE; manter até migração)
├── detector-uv-vis.png          ← legado (REPLACE; manter até migração)
└── environment/
    ├── silica/
    │   ├── silica-particle-small.png
    │   ├── silica-particle-medium.png
    │   ├── silica-particle-large.png
    │   ├── silica-cluster-small.png
    │   ├── silica-cluster-medium.png
    │   └── silica-cluster-large.png
    ├── flow/
    │   ├── flow-particle-small.png
    │   ├── flow-particle-medium.png
    │   ├── flow-particle-large.png
    │   ├── flow-streak.png
    │   └── flow-spark.png
    ├── molecules/
    │   ├── molecule-blue-small.png
    │   ├── … (5 cores × 3 tamanhos)
    ├── column/
    │   ├── column-wall.png
    │   ├── column-wall-detail.png
    │   ├── column-support.png
    │   ├── column-connector.png
    │   ├── column-bracket.png
    │   ├── column-tube.png
    │   ├── column-light.png
    │   └── column-sensor.png
    └── uvvis/
        ├── uvvis-housing.png
        ├── uvvis-window.png
        ├── uvvis-emitter.png
        ├── uvvis-sensor.png
        ├── uvvis-panel.png
        ├── uvvis-connector.png
        └── uvvis-light.png
```

**Convenções:** kebab-case; PNG RGBA; potenciais de 2; `NearestFilter` no load; sem atlas obrigatório na v1 (atlas opcional na etapa de polish de performance).

---

## 10. Estratégia de integração (futura — NÃO implementar agora)

1. **Comportamento permanece no spline** (`frameAt` / `worldAt`). Assets só substituem aparência.  
2. **Silica / column props** → `InstancedMesh` + materiais compartilhados; frustum culling.  
3. **Flow / molecules** → object pool; atualizar offset por `dt * speed * profile`.  
4. **Lanes** → densidade/bias de partículas de fluxo, **não** tubos brancos/ciano sólidos.  
5. **Column wall** → tube contínuo ou segmentos; **sem** Torus portal rings.  
6. **UV/Vis** → `detectorGroup` modular (housing + window + panel + light); approach 1450–1500.  
7. **Qualidade** → respeitar `particleMul` / fewer particles.  
8. **Migração** → manter `silica-back.png` / `detector-uv-vis.png` até os novos assets estarem plugged; depois remover referências.  
9. **Separação lógica** → ambient molecules ≠ collectibles ≠ obstacles (já separado no gameplay; reforçar no visual).  
10. **GitHub Pages** → todos os PNGs locais; sem CDN.

---

## 11. Ordem de execução recomendada

| Ordem | Família | Por quê |
|---|---|---|
| **1** | Sílica | É o maior gap de leitura “fase estacionária”; define se o espaço é coluna ou caverna/túnel |
| **2** | Parede / estrutura da coluna | Fecha o volume espacial; dá escala instrumental; remove dependência de anéis |
| **3** | Fase móvel | Substitui a metáfora de estrada; envolve o personagem no solvente |
| **4** | Moléculas ambient | Vida + parallax; só depois da coluna/fluxo existirem senão poluem leitura |
| **5** | Infraestrutura (supports, sensors, tubes) | Refina escala científica; densidade baixa |
| **6** | UV/Vis | Marco final; precisa do vocabulário visual da coluna já estabelecido |
| **7** | Polish / atlas / densidade por setor | Só após aprovação visual 1–6 |

### Pipeline por asset family

```
gerar PNGs (Skill) → revisar AD vs personagens → importar em assets/environment/**
→ (etapa futura) wire no Three sem mudar gameplay → testar setores 0–300 / curva / boost / 1450–1500
```

### Critério de pronto do plano (esta etapa)

- [x] Inventário e diagnóstico  
- [x] KEEP / ADAPT / REPLACE / CREATE  
- [x] Families + escala + paleta + AD  
- [x] Prompts de geração  
- [x] Pasta proposta + ordem  
- [ ] **Fora de escopo agora:** gerar assets, alterar `main.js`, substituir PNGs, implementar ambiente  

---

## 12. Apêndice — Checklist visual de aprovação (para etapas futuras)

Após assets + integração, o ambiente só é aprovado se:

1. Sem HUD, ainda parece coluna cromatográfica?  
2. Sílica identificável (granular, não pedra/coral)?  
3. Fase móvel perceptível (fluxo 3D, não faixas de estrada)?  
4. Moléculas atravessam a coluna em profundidades diferentes?  
5. Ambiente segue curvas/subidas/descidas do spline?  
6. A pista deixou de parecer rodovia?  
7. Personagens parecem *dentro* do volume?  
8. Estética casa com sprites 16-bit?  
9. UV/Vis parece instrumento da coluna (não portal)?  
10. Legível em alta velocidade?

---

## 13. Resumo executivo

| Item | Decisão |
|---|---|
| `silica-back.png` | **REPLACE** |
| `detector-uv-vis.png` | **REPLACE** (conceito do painel → `uvvis-panel`) |
| Personagens | **KEEP** (referência AD) |
| Famílias a criar | silica (6) · flow (5) · molecules (15) · column (8) · uvvis (7) |
| Integração | só em etapa futura; spline/lanes/gameplay intocados neste plano |
| Próximo passo prático | gerar família **Sílica** com os prompts 8.1 |

---

*Documento gerado na etapa de auditoria/planejamento. Nenhuma alteração de código ou assets de jogo foi feita.*
