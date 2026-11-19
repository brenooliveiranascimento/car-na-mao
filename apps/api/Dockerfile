# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Local development: source is mounted by docker-compose.yml, Nest recompiles on save.
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npx nest build && node dist/database/migrate.js && npx nest start --watch"]

FROM deps AS build
COPY . .
RUN npx nest build && npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
COPY package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
# Migrations are idempotent and run on every start, so a deploy is just "build and up".
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/main.js"]
