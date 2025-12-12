FROM node:24.11-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY package.json pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN pnpm prepare
RUN pnpm build
RUN pnpm prune --production

FROM node:24.11-alpine AS runner
WORKDIR /app

# Install necessary system packages, including OpenSSL
RUN apk add --no-cache openssl

# Copy all node_modules (including prisma as a devDependency)
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/build build/
COPY --from=builder /app/prisma.config.ts prisma.config.ts
COPY --from=builder /app/prisma prisma/
COPY package.json .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node build"]
