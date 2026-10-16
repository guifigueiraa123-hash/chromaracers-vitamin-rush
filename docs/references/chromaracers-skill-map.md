# Chromaracers — mapa de skills (obrigatório)

## Esclarecimento: GitHub ≠ autenticação SpriteCook

Enviar / clonar o repositório [SpriteCook/cursor-plugin](https://github.com/SpriteCook/cursor-plugin) (ou `spritecook-mcp`) **instala skills e configura o cliente MCP**.  
Isso **não** cria créditos nem autentica a conta SpriteCook.

Para **gerar** arte ainda falta **uma** destas opções:

1. Secret de ambiente `SPRITECOOK_API_KEY` (https://app.spritecook.ai/api-keys), ou  
2. OAuth em Cursor Settings → Tools & MCP → spritecook.

Sem isso, as skills SpriteCook só orientam o fluxo; as tools de geração não rodam.

---

## Como usar (regra)

1. Escolha o **objetivo** na tabela.  
2. Leia a skill de entrada da família.  
3. Execute as skills listadas **nessa ordem**.  
4. Engines de referência (`babylonjs`, `playcanvas`, `bullet3`) **não** substituem o Three.js shipping sem pedido explícito.

**Shipping:** Three.js (`index.html`, `assets/main.js`).  
**Lab opcional:** Godot (`godot/`, PR #24).

---

## A) SpriteCook — arte do Chromaracers

| Skill | Onde / objetivo no Chromaracers |
|-------|----------------------------------|
| `spritecook` | Entrada: qualquer pedido de sprite/arte |
| `spritecook-org` | Mapa dos repos oficiais (plugin, MCP, assets CC0) |
| `spritecook-connect-mcp` | Conectar conta quando tools faltam / 401 |
| `spritecook-workflow-essentials` | Créditos, manifests, downloads seguros, defaults |
| `spritecook-generate-sprites` | Vita C, Captain Caffeine, Aroma, props, ícones |
| `spritecook-animate-assets` | Run / jump / hit / victory sheets dos personagens |
| `spritecook-polish-sprites` | Limpar halo/alpha após geração (sílica, chars) |
| `spritecook-generate-tilesets` | Padrões de parede / sílica / chão (se tile-based) |
| `spritecook-use-dual-grid-tilesets` | Tilesets dual-grid para paredes da coluna |
| `spritecook-build-ui-kits` | HUD, botões, painéis do menu da corrida |
| `spritecook-use-presets` | Manter estilo entre gerações (mesmo personagem) |
| `spritecook-upload-assets` | Subir PNG local p/ editar/animar no SpriteCook |
| `spritecook-use-assets-in-godot` | Exportar arte p/ lab Godot (`godot/`) |

**Pipeline típico arte:**  
`spritecook` → `workflow-essentials` → `generate-sprites` → `polish` → (`animate` se sheet) → integrar em `assets/`.

---

## B) Godot — lab / migração opcional

| Skill | Onde / objetivo no Chromaracers |
|-------|----------------------------------|
| `godot-project-setup` | Scaffold / validar `godot/` |
| `godot-game` | Portar protótipos, cenas, GDScript, smoke headless |

**Só se** o usuário pedir migração ou novo jogo em Godot. Não troca o race Three.js sozinho.

---

## C) Game studio (CCGS) — processo para melhorar o jogo

Entrada: `game-studio` → `ccgs-help` / `ccgs-start`.

### C1. Onboarding & rota

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `game-studio` | Índice do estúdio para este repo |
| `ccgs-start` | Onboarding / rigor (usar **minimal**) |
| `ccgs-help` | Catálogo de skills CCGS |
| `ccgs-onboard` | Trazer novo colaborador ao projeto |
| `ccgs-adopt` | Adotar CCGS num repo já existente (este) |
| `ccgs-project-stage-detect` | Detectar estágio atual da corrida |
| `ccgs-settings` | Ajustar rigor/automation |
| `ccgs-setup-engine` | Pin engine = **Three.js** (não Babylon/PlayCanvas) |

### C2. Design da corrida (HPLC / Vitamin Rush)

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-brainstorm` | Novas mecânicas (boost, powerups, modos) |
| `ccgs-quick-design` | Brief de 1 página para um sistema |
| `ccgs-map-systems` | Mapa: track, lanes, silica, detector, HUD |
| `ccgs-design-system` | Desenhar um sistema (ex.: boost caféina) |
| `ccgs-design-review` | Revisar GDD/sistema |
| `ccgs-review-all-gdds` | Auditoria de docs de design |
| `ccgs-propagate-design-change` | Propagar mudança (ex.: 1500m → novo length) |
| `ccgs-balance-check` | Tuning velocidade, lanes, coleta |
| `ccgs-scope-check` | Evitar scope creep fora da corrida |

### C3. Arte / conteúdo (com SpriteCook)

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-art-bible` | Direção visual (coluna, sílica, personagens) |
| `ccgs-asset-spec` | Spec + prompt por asset (antes do SpriteCook) |
| `ccgs-asset-audit` | Inventário do que falta em `assets/` |
| `ccgs-content-audit` | Conteúdo vs. design |
| `ccgs-consistency-check` | Consistência visual/design |

### C4. UX / UI

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-ux-design` | Fluxo menu → race → results |
| `ccgs-ux-review` | Review de HUD / controles |
| `ccgs-team-ui` | Passada focada em UI |
| `ccgs-create-control-manifest` | Controles (teclado/touch) documentados |

### C5. Arquitetura (Three.js)

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-create-architecture` | Arquitetura de `assets/main.js` / módulos |
| `ccgs-architecture-decision` | ADR (ex.: InstancedMesh sílica) |
| `ccgs-architecture-review` | Review de fronteiras |
| `ccgs-reverse-document` | Documentar o que já está no código |

### C6. Entrega de features

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-create-epics` | Épicos (Env 3.2, personagens, HUD) |
| `ccgs-create-stories` | Stories implementáveis |
| `ccgs-story-readiness` | Story pronta p/ dev? |
| `ccgs-estimate` | Estimativa relativa |
| `ccgs-dev-story` | Implementar uma story no código |
| `ccgs-story-done` | Fechar com evidência |
| `ccgs-prototype` | Spike rápido (câmera, fog, beads) |
| `ccgs-vertical-slice` | Slice jogável ponta a ponta |
| `ccgs-sprint-plan` / `ccgs-sprint-status` | Planejar sprints |
| `ccgs-milestone-review` | Review de marco |
| `ccgs-gate-check` | Gate de fase |

### C7. QA / performance

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-qa-plan` | Plano de QA da corrida |
| `ccgs-smoke-check` | Smoke: carrega, corre, detecta |
| `ccgs-soak-test` | Sessão longa (memory/FPS) |
| `ccgs-regression-suite` | Regressão após PRs de sílica/coluna |
| `ccgs-test-setup` / `ccgs-test-helpers` | Harness de testes |
| `ccgs-test-evidence-review` | Evidência (screenshot/vídeo) |
| `ccgs-test-flakiness` | Flakes |
| `ccgs-playtest-report` | Relatório de playtest |
| `ccgs-perf-profile` | FPS fog/sílica/instancing |
| `ccgs-bug-report` / `ccgs-bug-triage` | Bugs da corrida |
| `ccgs-team-qa` | Passada QA |

### C8. Polish / áudio / narrativa / live-ops

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-team-polish` | Polish visual/feel |
| `ccgs-team-audio` | SFX/música da corrida |
| `ccgs-team-narrative` | Lore vitamina / HPLC (leve) |
| `ccgs-team-level` | Layout do track 1500m |
| `ccgs-team-combat` | Só se houver combate (hoje: limitado) |
| `ccgs-team-live-ops` | Eventos / seasons (futuro) |
| `ccgs-localize` | PT/EN strings UI |

### C9. Release & manutenção

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `ccgs-code-review` | Review de PRs |
| `ccgs-tech-debt` | Dívida em `main.js` |
| `ccgs-security-audit` | Audit leve (deps, XSS) |
| `ccgs-changelog` / `ccgs-patch-notes` | Notas de versão |
| `ccgs-hotfix` / `ccgs-day-one-patch` | Hotfix pós-ship |
| `ccgs-launch-checklist` / `ccgs-release-checklist` | Checklist de release |
| `ccgs-team-release` | Passada de release |
| `ccgs-retrospective` | Retro de sprint |
| `ccgs-skill-test` / `ccgs-skill-improve` | Manutenção das próprias skills CCGS |

---

## D) Referências de engine / recursos (não trocam o shipping)

| Skill | Uso no Chromaracers |
|-------|---------------------|
| `magictools` | Achar assets/áudio/ferramentas externas |
| `babylonjs` | Comparar / protótipo isolado — **não** substituir Three.js |
| `playcanvas` | Idem |
| `bullet3` | Física pesada — só se pedir física Bullet |

---

## Ordem recomendada para aprimorar o Chromaracers

1. **Arte dos chars/sílica** — família SpriteCook (+ `ccgs-asset-spec` se quiser specs).  
2. **Feel / balance** — `ccgs-design-system` → `ccgs-balance-check` → `ccgs-dev-story`.  
3. **Perf coluna/sílica** — `ccgs-perf-profile` → `ccgs-smoke-check`.  
4. **HUD/UX** — `ccgs-ux-design` → SpriteCook UI kit.  
5. **Godot** — só com pedido explícito de migração/lab (`godot-game`).
