# Modelo de dados

## Item de imagem
- `id`: identificador único
- `name`: nome do arquivo
- `src`: caminho ou URL base64 do arquivo
- `naturalWidth` / `naturalHeight`: dimensões reais da imagem
- `widthMm` / `heightMm`: tamanho usado no layout
- `copies`: quantidade de cópias
- `x` / `y`: posição no layout em pixels ou milímetros
- `rotation`: rotação aplicada
- `marginMm`: margem ao redor do item
- `visibleInSheet`: indica se o item deve ser renderizado na folha de imposição

## Página
- `pageSize`: A4 por padrão
- `marginsMm`: margem da área de impressão
- `gapMm`: espaçamento entre itens
- `layoutMode`: manual ou automático
