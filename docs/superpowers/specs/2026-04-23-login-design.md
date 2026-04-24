# Login Design - onde-tem-buteco

**Data:** 2026-04-23  
**Escopo:** Redesign visual da rota `/login` com foco em produto/app, tom acolhedor e quente

---

## Contexto

A tela atual de login esta funcional, mas visualmente pobre: titulo isolado, um unico botao e nenhum contexto sobre por que o usuario deveria entrar. O resultado parece uma tela solta, sem relacao clara com o resto do app.

O objetivo do redesign e manter o fluxo de autenticacao exatamente como esta hoje, mas transformar a pagina em uma entrada coerente com o produto: conta para salvar favoritos, registrar visitas e retomar o proprio roteiro.

---

## Objetivo de Produto

A nova tela deve comunicar tres coisas de forma imediata:

1. Entrar serve para continuar usando o app, nao para cumprir uma burocracia.
2. A conta e util porque salva favoritos, visitas e roteiro.
3. O caminho principal e unico: entrar com Google.

---

## Direcao Escolhida

Direcao final: **card unico centralizado**.

Motivos:
- Mais limpa do que a versao split.
- Mais forte em mobile.
- Reduz o risco de excesso visual.
- Mantem contexto suficiente de produto sem competir com o CTA.

---

## Estrutura da Pagina

### Fundo

Fundo com degradiente quente em tons de cafe, cobre e ambar, com profundidade visual. Nao usar preto chapado.

Elementos de apoio podem existir no fundo, mas de forma sutil:
- halos quentes
- gradientes radiais
- superficies translucidas leves

O fundo deve criar atmosfera sem disputar atencao com o card principal.

### Area superior

Acima do card, uma faixa curta de contexto:
- eyebrow pequeno indicando a conta do app
- titulo principal orientado a utilidade
- subtitulo curto explicando o valor da conta

Mensagem esperada:
- titulo na linha de "Entre e continue seu mapa de botecos"
- subtitulo sobre salvar favoritos, acompanhar visitas e retomar roteiro

### Card principal

O card central deve ser o ponto focal absoluto da tela.

Conteudo interno:
- marca simplificada ou bloco visual curto no topo
- label pequena "Entrar"
- titulo do card
- texto curto explicando o login
- dois beneficios compactos
- CTA principal "Entrar com Google"
- linha curta de confianca, por exemplo "Login simples, sem senha para criar"

O card deve ter:
- superficie clara e quente
- cantos bem arredondados
- sombra forte o bastante para destacar do fundo
- espacamento generoso

### Apoio inferior

Abaixo do card pode existir uma faixa com 2 ou 3 blocos pequenos reforcando utilidade:
- roteiro salvo
- conta util
- experiencia pronta para mobile

Esses blocos sao secundarios. Se causarem ruido, podem ser reduzidos ou removidos.

---

## Hierarquia de Conteudo

Prioridade visual:

1. CTA de login
2. Titulo principal da pagina
3. Titulo e texto do card
4. Beneficios compactos
5. Apoios secundarios

Regra principal: nada pode competir com o botao de login.

---

## Conteudo de UX

O texto deve seguir estas regras:
- curto
- utilitario
- sem tom institucional
- sem promessas exageradas

O foco e continuidade de uso do app, nao "boas-vindas" genericas.

Evitar:
- textos longos
- explicacoes tecnicas sobre OAuth
- linguagem publicitaria demais

---

## Responsividade

### Desktop

- contexto superior centralizado
- card com largura controlada, sem ficar largo demais
- opcionalmente uma faixa inferior com apoios secundarios

### Mobile

- manter tudo em uma coluna
- reduzir espacos verticais, mas preservar respiro
- manter o botao em largura total
- garantir que o card apareca logo sem necessidade de muito scroll

O layout precisa funcionar bem primeiro em mobile e depois escalar para desktop.

---

## Acessibilidade

- contraste suficiente entre fundo, superficie e texto
- CTA com destaque visual e area confortavel de toque
- hierarquia sem depender so de cor
- textos curtos e legiveis
- manter semantica simples: `main`, titulo principal, formulario e botao

---

## O que nao muda

- O fluxo de autenticacao continua usando `signIn("google")`.
- Nao ha mudanca de rota, provider ou comportamento de backend.
- Nao ha criacao de novo passo de cadastro.
- Nao ha dependencia de novas bibliotecas de UI.

---

## Implementacao Prevista

Arquivo principal:
- `apps/web/app/(auth)/login/page.tsx`

Escopo esperado:
- reestruturar o markup da pagina
- aplicar classes Tailwind para o novo layout
- manter a action server-side atual

Extracao de componente so deve acontecer se melhorar legibilidade real. Nao ha necessidade previa de criar varios componentes.

---

## Validacao

O redesign sera considerado correto quando:

1. A tela parar de parecer vazia ou provisoria.
2. O valor da conta ficar claro em poucos segundos.
3. O CTA for o elemento mais evidente da pagina.
4. A experiencia funcionar bem em desktop e mobile.
5. O fluxo de login continuar identico ao atual.

---

## Fora de Escopo

- alterar o fluxo de autenticacao
- adicionar outros provedores de login
- criar onboarding
- mexer em rotas privadas
- revisar o cabecalho publico
