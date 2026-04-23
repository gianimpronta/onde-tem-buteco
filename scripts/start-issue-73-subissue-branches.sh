#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-HEAD}"

if ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
  echo "Base ref inválida: $base_ref" >&2
  echo "Uso: $0 [base_ref]" >&2
  exit 1
fi

subissues=(
  "74:test/e2e-home-carregamento"
  "75:test/e2e-home-listagem-navegacao"
  "76:test/e2e-listagem-filtro-cidade"
  "77:test/e2e-listagem-filtro-bairro"
  "78:test/e2e-listagem-busca-nome"
  "79:test/e2e-listagem-sem-resultados"
  "80:test/e2e-listagem-detalhe-navegacao"
  "81:test/e2e-detalhe-renderizacao"
)

echo "Criando branches das sub-issues da #73 a partir de: $base_ref"

for entry in "${subissues[@]}"; do
  issue_number="${entry%%:*}"
  branch_name="${entry#*:}"

  if git show-ref --verify --quiet "refs/heads/$branch_name"; then
    echo "- #$issue_number -> $branch_name (já existe)"
    continue
  fi

  git branch "$branch_name" "$base_ref"
  echo "- #$issue_number -> $branch_name (criada)"
done

echo
echo "Resumo:"
git branch --list 'test/e2e-*' | sed 's/^/  /'
