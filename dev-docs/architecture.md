# Arquitetura

## Visão geral
O projeto usa Electron com React e TypeScript. A aplicação é dividida entre:
- processo principal (`src/main`)
- processo de renderização (`src/renderer`)
- preload para comunicação segura

## Responsabilidades
### Processo principal
- criar e controlar a janela da aplicação
- lidar com arquivos e exportação
- acessar sistema de arquivos e recursos locais

### Processo de renderização
- montar a interface do usuário
- gerenciar estado da composição
- exibir preview da página A4
- permitir edição manual e automática

## Estrutura sugerida para evolução
- `src/renderer/components` — componentes visuais
- `src/renderer/hooks` — hooks reutilizáveis
- `src/renderer/state` — estado da aplicação
- `src/main/ipc` — handlers IPC
- `src/shared` — tipos e utilidades compartilhadas
