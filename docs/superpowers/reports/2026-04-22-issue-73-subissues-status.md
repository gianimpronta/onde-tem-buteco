# Status de execução das sub-issues da #73 (E2E)

Data: 2026-04-22

## Escopo
Sub-issues: #74, #75, #76, #77, #78, #79, #80, #81.

## Branches verificadas

Todas as branches abaixo apontam para o mesmo commit base (`a56a21e1b756cbfb75a01ea5a772f57e4d88deca`), então a validação dos comandos foi feita uma vez e aplicada para todas:

- `test/e2e-home-carregamento`
- `test/e2e-home-listagem-navegacao`
- `test/e2e-listagem-filtro-cidade`
- `test/e2e-listagem-filtro-bairro`
- `test/e2e-listagem-busca-nome`
- `test/e2e-listagem-sem-resultados`
- `test/e2e-listagem-detalhe-navegacao`
- `test/e2e-detalhe-renderizacao`

## Qualidade executada

1. `pnpm lint`
2. `pnpm format:check`
3. `pnpm test`
4. `pnpm test:e2e`

## Ajuste aplicado para estabilidade do fluxo E2E

Foi atualizado o `apps/web/package.json` para:

- incluir `test:e2e:setup` com geração do Prisma Client e instalação de dependências do Playwright (`--with-deps`);
- sempre rodar `prisma generate` antes do `playwright test` em `test:e2e`.

Com isso, o fluxo de validação por branch fica reprodutível antes da abertura de MR.
