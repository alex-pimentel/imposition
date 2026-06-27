# AGENTS.md

## Objetivo do projeto
Este repositório contém uma aplicação Electron para montagem e imposição de imagens em páginas A4, com exportação para PDF.

## Regras de desenvolvimento
- mantenha a interface simples, clara e focada em produtividade
- preserve o fluxo de arraste e soltar para importação
- priorize a consistência entre preview e exportação
- sempre valide alterações com lint/build quando possível
- documente mudanças importantes em `dev-docs`

## Estrutura principal
- `packages/core` — lógica pura compartilhada (types, utils, layout algorithm)
- `packages/ui` — componentes React, hooks, store zustand, CSS
- `packages/electron` — app Electron (main + preload + renderer entry + webpack)
- `packages/web` — app Web (Vite + entry point + wrangler.toml)
- `dev-docs` — documentação técnica e operacional

## Commands
- `npm run build -w packages/web` — build web para Cloudflare Pages
- `npm run dev -w packages/web` — dev server web (Vite)
- `npm run build -w packages/electron` — build Electron (main + renderer)
- `npm start -w packages/electron` — dev server Electron (webpack)
- `npx wrangler pages deploy packages/web/dist --project-name=imposition` — deploy manual

## Observações importantes
- o app deve aceitar JPG, PNG e WEBP
- a página base inicial é A4
- o posicionamento automático deve ser determinístico e permitir tentativas com aleatoriedade
- a exportação para PDF deve refletir exatamente o layout visual
- ao alterar packages/core ou packages/ui, verificar build dos dois consumers (web + electron)
- nunca usar `workspace:*` (npm não suporta); usar `"*"` para referenciar workspace packages
