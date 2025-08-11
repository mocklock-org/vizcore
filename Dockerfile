# Multi-stage build for VizCore
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json lerna.json ./
COPY packages/core/package.json ./packages/core/

RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
WORKDIR /app

COPY package.json lerna.json ./
COPY packages/core/package.json ./packages/core/

RUN npm ci

COPY packages/ ./packages/
COPY tsconfig.json ./

RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 vizcore && \
    adduser --system --uid 1001 vizcore

COPY --from=builder --chown=vizcore:vizcore /app/packages/core/dist ./packages/core/dist
COPY --from=deps --chown=vizcore:vizcore /app/node_modules ./node_modules
COPY --from=deps --chown=vizcore:vizcore /app/packages/core/node_modules ./packages/core/node_modules
COPY --chown=vizcore:vizcore package.json lerna.json ./
COPY --chown=vizcore:vizcore packages/core/package.json ./packages/core/

USER vizcore

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

CMD ["node", "packages/core/dist/index.js"]
