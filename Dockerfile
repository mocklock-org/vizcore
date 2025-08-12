FROM node:18-alpine AS base

FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json lerna.json ./
COPY packages/core/package.json ./packages/core/
COPY tsconfig.json ./

RUN npm ci

COPY packages/ ./packages/

RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 vizcore && \
    adduser --system --uid 1001 vizcore

COPY --from=builder --chown=vizcore:vizcore /app/packages/core/dist ./packages/core/dist
COPY --from=builder --chown=vizcore:vizcore /app/node_modules ./node_modules
COPY --chown=vizcore:vizcore package.json lerna.json ./
COPY --chown=vizcore:vizcore packages/core/package.json ./packages/core/

RUN apk add --no-cache curl && \
    mkdir -p /tmp /var/cache && \
    chown -R vizcore:vizcore /tmp /var/cache

USER vizcore

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "packages/core/dist/server.js"]
