# CHROMARACERS: VITAMIN RUSH

Arcade de corrida cromatográfica em Three.js/WebGL (client-side).

## Estrutura

```
chromaracers-vitamin-rush/
├── index.html
├── README.md
└── assets/
    ├── main.js
    ├── styles.css
    ├── three.module.js
    ├── three.core.js          # dependência local do Three r180 (sem CDN)
    ├── vita-c-run-final-spritesheet.png
    ├── detector-uv-vis.png
    └── silica-back.png
```

> `three.module.js` importa `./three.core.js` localmente. Ambos devem ser publicados juntos.
## Executar localmente

Serve a pasta raiz por HTTP (módulos ES não abrem via `file://`):

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080/`.

## GitHub Pages

1. Push para `main` (ou branch configurada no Pages).
2. Settings → Pages → Source: Deploy from branch → `/` (root).
3. URL: `https://guifigueiraa123-hash.github.io/chromaracers-vitamin-rush/`

Sem backend, CDN ou instalação.

## Configuração da corrida

Em `assets/main.js`:

```js
const GAME_CONFIG = {
  raceDistance: 1500, // 1000 | 1500 | 2000 | 3000
  ...
};
```

## Controles

- Desktop: ← → / A D · Espaço (item/boost) · R
- Mobile: swipe + botões touch
