FROM node:20.19-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY package.json pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma@6.14.0 generate

RUN pnpm build
RUN pnpm prune --production

FROM node:20.19-alpine
WORKDIR /app

# Install necessary system packages, including OpenSSL
RUN apk add --no-cache openssl
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY package.json .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma@6.14.0 migrate deploy && node build"]
