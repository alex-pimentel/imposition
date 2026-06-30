# UI Renovation — ShadcnUI + Tailwind v4

## Resumo

Esta branch (`feat/ui-renovation`) aplica um redesign visual na aplicação de imposição A4, adotando o tema dark padrão do ShadcnUI com cor base `slate` e Tailwind CSS v4.

## Mudanças principais

### Fundação

- **Tailwind CSS v4** configurado em `packages/ui` com CSS-based theme (`@import "tailwindcss"`, `@theme`).
- **Tema dark slate** do ShadcnUI em `packages/ui/src/styles/globals.css`.
- Componentes base do Shadcn criados em `packages/ui/src/components/ui/`:
  - `button`, `input`, `label`, `slider`, `switch`, `tooltip`, `context-menu`, `separator`.
- Utilitário `cn()` criado em `packages/ui/src/lib/utils.ts`.
- Configuração dos bundlers:
  - **Web (Vite):** plugin `@tailwindcss/vite`.
  - **Electron (webpack):** `postcss-loader` + `@tailwindcss/postcss`.

### Store e modelo

- Removido campo `visibleInSheet` — visibilidade agora é controlada por `copies === 0`.
- Nova action `removeFromList(id)` — remove item permanentemente.
- Ações `sendToBack(id)` / `bringToFront(id)` — reordena camadas.
- `alignCenter(id, axis)` — centraliza horizontal/vertical na página.
- `setInteractiveGrid(enabled)` — ativa/desativa grid visual e snapping.
- `setCanvasZoom(zoom)` / `setCanvasPan(pan)` / `resetCanvasView()` — zoom/pan.
- `pageMarginMm` — margem global da página aplicada a novos itens e no auto-place.

### Sidebar e listagem

- Upload drag-and-drop com área estilizada (sem botão "+ Add New Image").
- `ItemCard` reformulado com controles de cópias (+/-) e lixeira.
- Campo "Margem da página (mm)" com tooltip explicativo.
- `StatsCard` simplificado (barra de estatísticas apenas com contagem e aproveitamento).

### Toolbar

- Cabeçalho com nome do arquivo e botões "Remove" / "Reset Position".
- Campos digitáveis de largura/altura.
- Rotação com input numérico + slider sincronizado.
- Tooltips de ajuda ("Rotação em graus", "Espaço mínimo ao redor do item").
- Margem editável por item (herda da margem da página por padrão).

### Canvas

- Grid visual (linhas a cada 10mm) com toggle "Grid" no topo.
- Snapping com linhas guia tracejadas durante arraste.
- Menu de contexto nos itens: Duplicate, Rotate 90°, Send to Back, Bring to Front, Align Center, Remove from list.
- HUD de zoom no canto inferior esquerdo.
- Gauge "Resumo da Folha" no canto inferior direito.
- Pan com clique esquerdo/médio na área vazia; scroll vertical sem Ctrl.
- Zoom com Ctrl + scroll.

### Makefile

- `make dev` / `make electron` / `make build-web` / `make build-electron` / `make lint`

## Correções de bugs

- Rotação de imagens no PDF: ângulo negado (`-rotation`) para alinhar direção CSS × PDF.
- Scroll vertical adicionado para navegar quando zoom > 100%.
- Grid visual corrigido para usar branco puro com linhas cinza.

## Validação

- `npm run build -w packages/web` ✅
- `npm run build:renderer -w packages/electron` ✅
- `npm run lint` ✅

## Próximos passos possíveis

- Adicionar atalhos de teclado para ações frequentes.
- Migrar ícones restantes de `react-icons` para `lucide-react`.
