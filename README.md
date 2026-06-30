<div align="center">
  <h1>📐 imposition</h1>
  <p><strong>A4 image imposition and PDF export — Electron + Web</strong></p>
  <p>Desktop and web application for arranging images on A4 sheets with visual preview, automatic positioning, and PDF export</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/electron-35-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
    <img src="https://img.shields.io/badge/react-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/typescript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/webpack-5-8DD6F9?style=for-the-badge&logo=webpack&logoColor=white" alt="Webpack">
    <img src="https://img.shields.io/badge/zustand-5-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand">
    <img src="https://img.shields.io/badge/jsPDF-4-6DB33F?style=for-the-badge&logo=adobe&logoColor=white" alt="jsPDF">
    <img src="https://img.shields.io/badge/docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  </p>

  <p>
    <a href="https://github.com/alex-pimentel/imposition/actions/workflows/ci.yml"><img src="https://github.com/alex-pimentel/imposition/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
    <a href="https://github.com/alex-pimentel/imposition/actions/workflows/lint.yml"><img src="https://github.com/alex-pimentel/imposition/actions/workflows/lint.yml/badge.svg?branch=main" alt="Lint"></a>
    <a href="https://github.com/alex-pimentel/imposition/actions/workflows/build.yml"><img src="https://github.com/alex-pimentel/imposition/actions/workflows/build.yml/badge.svg?branch=main" alt="Build"></a>
  </p>
</div>

---

## 🚀 Features

- **Import images** — Drag & drop JPG, PNG, and WEBP files
- **A4 canvas** — Visual preview of the A4 sheet with all items
- **Manual adjustments** — Resize, rotate, reposition, and set copy count per item
- **Duplicate items** — Quick duplication of existing elements
- **Auto layout** — Deterministic automatic positioning with optional randomness
- **Area efficiency** — Real-time calculation of printable area usage
- **PDF export** — Generate a PDF that exactly mirrors the visual layout

---

## 🏗️ Architecture

```
         ┌─────────────────────────────────────────────────┐
         │                 packages/ui                      │
         │  React components, hooks (useDrag, useResize,    │
         │  useRotate), Zustand store                       │
         └────────────────┬────────────────────────────────┘
                          │ imports
         ┌────────────────▼────────────────────────────────┐
         │               packages/core                      │
         │  Types, calculations, layout algorithm,          │
         │  imposition engine, area metrics                 │
         └────────┬───────────────────────┬────────────────┘
                  │                       │
         ┌────────▼────────┐    ┌────────▼────────────┐
         │  packages/web   │    │  packages/electron   │
         │  Vite + React   │    │  Webpack + Electron  │
         │  Cloudflare     │    │  Desktop app         │
         │  Pages deploy   │    │  PDF save dialog     │
         └────────┬────────┘    └────────┬────────────┘
                  │                      │
         ┌────────▼────────┐             │
         │  Docker/Nginx   │             │
         │  :8080           │             │
         └─────────────────┘             │
                                   ┌─────▼──────┐
                                   │  Electron  │
                                   │  :1212     │
                                   └────────────┘
```

---

## 🛠️ Stack

| Layer         | Technology                                                                        |
| ------------- | --------------------------------------------------------------------------------- |
| **Desktop**   | [Electron 35](https://www.electronjs.org/) + [Webpack 5](https://webpack.js.org/) |
| **Web**       | [Vite 6](https://vite.dev/) + [React 19](https://react.dev/)                      |
| **Language**  | [TypeScript 5.8](https://www.typescriptlang.org/)                                 |
| **State**     | [Zustand 5](https://github.com/pmndrs/zustand)                                    |
| **PDF**       | [jsPDF 4](https://github.com/parallax/jsPDF)                                      |
| **Layout**    | Custom deterministic algorithm (optional randomness)                              |
| **Container** | [Docker Compose](https://docs.docker.com/compose/)                                |
| **CI/CD**     | [GitHub Actions](https://github.com/features/actions)                             |
| **Deploy**    | [Cloudflare Pages](https://pages.cloudflare.com/)                                 |

---

## 📦 Project Structure

```
imposition/
├── packages/
│   ├── core/                  # Shared logic
│   │   └── src/
│   │       ├── calculations.ts
│   │       ├── constants.ts
│   │       ├── image.ts
│   │       ├── layout.ts      # Imposition algorithm
│   │       ├── types.ts
│   │       └── utils.ts
│   │
│   ├── ui/                    # React components & state
│   │   └── src/
│   │       ├── components/    # ItemCard, PagePreview, Sidebar, Toolbar…
│   │       ├── hooks/         # useDrag, useResize, useRotate
│   │       └── store.ts       # Zustand store
│   │
│   ├── electron/              # Desktop app
│   │   ├── src/main/          # Electron main process
│   │   ├── src/renderer/      # Electron renderer entry
│   │   ├── assets/            # App icons
│   │   └── .erb/              # Webpack configs & scripts
│   │
│   └── web/                   # Web version
│       └── src/
│           └── main.tsx       # Vite entry point
│
├── docker-compose.yml         # Development container
├── Dockerfile                  # Nginx production build
├── dev-docs/                   # Technical documentation
└── .github/workflows/          # CI/CD pipelines
```

---

## ⚡ Quick Start

```bash
# Prerequisites: Node.js 18+, npm

git clone git@github.com:alex-pimentel/imposition.git
cd imposition
npm install
```

### Web (development)

```bash
npm run dev -w packages/web
# → http://localhost:5173
```

### Electron (development)

```bash
npm start -w packages/electron
# → Electron window :1212
```

### Docker

```bash
docker compose up --build
# → http://localhost:8080
```

---

## 🔄 How it Works

1. **Import** — Drag & drop images onto the canvas
2. **Arrange** — Resize, rotate, and position each item manually
3. **Auto-layout** — Run automatic positioning to fill the A4 sheet optimally
4. **Export** — Generate a PDF that preserves the exact visual layout

```
User uploads images → Manual arrangement / Auto-layout → PDF export
                              ↕
                    Zustand store (state)
                              ↕
               Core calculations (positions, area)
```

---

## 🧪 Commands

```bash
npm run dev -w packages/web            # Web dev server (Vite)
npm run build -w packages/web          # Build web for production
npm start -w packages/electron         # Electron dev (webpack)
npm run build -w packages/electron     # Build electron for production
npm run lint                           # ESLint all packages
npm test                               # Run tests (if configured)
docker compose up --build              # Docker web serve
```

---

## ☁️ Deploy

The web version is deployed on **Cloudflare Pages**.
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://pages.cloudflare.com/)

Manual deploy:

```bash
npm run build -w packages/web
npx wrangler pages deploy packages/web/dist --project-name=imposition
```

The desktop version can be packaged with `electron-builder` for Windows, macOS, and Linux.

---

## 📄 License

[MIT](LICENSE) © 2026

---

<div align="center">
  <sub>Built with ❤️ using Electron, React, TypeScript, and Docker</sub>
  <br />
  <a href="https://imposition.pimentel.dev/" target="_blank"><strong>try it now →</strong></a>
</div>
