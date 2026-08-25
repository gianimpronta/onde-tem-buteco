FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
# --no-frozen-lockfile: o pnpm-lock.yaml tem "overrides" que o package.json
# atual nao tem mais (drift no repo, nao e coisa do deploy). Vale rodar
# "pnpm install" local e commitar o lockfile atualizado quando der.
RUN pnpm install --no-frozen-lockfile --ignore-scripts
# pnpm 10+ ignora scripts de postinstall por padrao (ex: prisma, sentry-cli
# baixando binarios); aprova explicitamente e reinstala pra rodar de fato.
RUN pnpm approve-builds --all && pnpm install --no-frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* precisa existir NO BUILD: o Next inlina o valor no bundle do
# cliente. DSN do Sentry e publico por design (identifica o projeto, nao
# autoriza leitura), entao ARG/ENV esta certo aqui -- diferente do token.
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
# POSTGRES_* e SENTRY_AUTH_TOKEN via secret mount (nao ARG/ENV) pra nao
# gravar valor sensivel no historico da imagem. So existem durante este RUN.
# O token so serve pro upload de source map; sem ele o build passa igual,
# so que o stack trace no Sentry fica minificado.
RUN --mount=type=secret,id=postgres_url,env=POSTGRES_URL \
    --mount=type=secret,id=postgres_prisma_url,env=POSTGRES_PRISMA_URL \
    --mount=type=secret,id=postgres_url_non_pooling,env=POSTGRES_URL_NON_POOLING \
    --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
    pnpm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder --chown=node:node /app ./
# Roda como non-root (auditoria 2026-08-21). `node` (uid 1000) ja vem na
# imagem. O runner recebe a arvore inteira do builder, entao o chown do
# COPY cobre tudo -- inclusive .next/cache, que o `next start` precisa
# gravavel em runtime pra ISR.
USER node
EXPOSE 3000
CMD ["pnpm", "start"]
