# Imposição A4

Aplicação desktop em Electron para montar e organizar imagens em páginas A4 com preview visual, ajustes por item, posicionamento automático e exportação para PDF.

## Funcionalidades principais

- importação de imagens em JPG, PNG e WEBP
- suporte inicial a página A4
- ajuste manual de tamanho, cópias, posição e rotação por item
- duplicação de itens
- posicionamento automático com opção de aleatoriedade
- cálculo de aproveitamento da área de impressão
- exportação para PDF

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
git clone git@github.com:alex-pimentel/imposition.git
cd imposition
npm install
```

## Desenvolvimento

```bash
npm start
```

## Build para produção

```bash
npm run package
```

## Estrutura do projeto

- `src/main` — processo principal do Electron
- `src/renderer` — interface e preview
- `dev-docs` — documentação técnica e operacional

## Documentação

Consulte [dev-docs/README.md](dev-docs/README.md) para detalhes sobre arquitetura, fluxo de uso e exportação.

## Repositório

- GitHub: https://github.com/alex-pimentel/imposition

## Licença

Este projeto utiliza a licença definida no repositório.
