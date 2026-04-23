# Kickoff das sub-issues da #73 (E2E)

Data: 2026-04-22  
Issue pai: #73 — `feat: criar testes end-to-end para os fluxos principais da aplicação`

## O que foi iniciado de forma prática

- Foi adicionado o script `scripts/start-issue-73-subissue-branches.sh` para criar, de forma idempotente, as branches de cada sub-issue da #73.
- O script aceita um `base_ref` opcional (padrão: `HEAD`) para decidir o ponto de criação das branches.
- As branches da #74 até #81 são criadas automaticamente com os nomes combinados para o fluxo E2E.

## Como executar

```bash
./scripts/start-issue-73-subissue-branches.sh
```

Ou informando explicitamente uma base (ex.: `main`):

```bash
./scripts/start-issue-73-subissue-branches.sh main
```

## Mapeamento oficial

| Sub-issue | Branch |
|---|---|
| #74 | `test/e2e-home-carregamento` |
| #75 | `test/e2e-home-listagem-navegacao` |
| #76 | `test/e2e-listagem-filtro-cidade` |
| #77 | `test/e2e-listagem-filtro-bairro` |
| #78 | `test/e2e-listagem-busca-nome` |
| #79 | `test/e2e-listagem-sem-resultados` |
| #80 | `test/e2e-listagem-detalhe-navegacao` |
| #81 | `test/e2e-detalhe-renderizacao` |
