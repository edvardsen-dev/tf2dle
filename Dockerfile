FROM node:24-alpine AS builder
WORKDIR /app

ARG PUBLIC_CDN_URL
ARG PUBLIC_APP_VERSION=dev
ENV PUBLIC_CDN_URL=$PUBLIC_CDN_URL
ENV PUBLIC_APP_VERSION=$PUBLIC_APP_VERSION

# Install pnpm
RUN npm install -g npm@12.2.0 && npm install -g pnpm@12.10.1

# Copy dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

RUN pnpm exec svelte-kit sync && pnpm build
RUN pnpm prune --production

FROM node:24-alpine
WORKDIR /app

RUN npm install -g npm@12.2.0

ARG PUBLIC_APP_VERSION=dev

# Install necessary system packages, including OpenSSL
RUN apk add --no-cache openssl
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/prisma.config.ts .
COPY server.mjs .
COPY package.json .

EXPOSE 3000

ENV NODE_ENV=production
ENV PUBLIC_APP_VERSION=$PUBLIC_APP_VERSION

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node server.mjs"]
