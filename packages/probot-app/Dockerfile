FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY packages/probot-app/package.json ./packages/probot-app/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile --prod --filter probot-app...

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY packages/probot-app/package.json ./packages/probot-app/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile --filter probot-app...
COPY packages/probot-app ./packages/probot-app
COPY packages/typescript-config ./packages/typescript-config
RUN pnpm --filter probot-app build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/probot-app/node_modules ./packages/probot-app/node_modules
COPY --from=build /app/packages/probot-app/dist ./packages/probot-app/dist
COPY packages/probot-app/package.json ./packages/probot-app/

EXPOSE 3000
CMD ["node", "packages/probot-app/dist/index.js"]
