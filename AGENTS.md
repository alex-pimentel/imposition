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
- `src/main` — lógica do processo principal
- `src/renderer` — interface e preview
- `dev-docs` — documentação técnica e operacional

## Observações importantes
- o app deve aceitar JPG, PNG e WEBP
- a página base inicial é A4
- o posicionamento automático deve ser determinístico e permitir tentativas com aleatoriedade
- a exportação para PDF deve refletir exatamente o layout visual
