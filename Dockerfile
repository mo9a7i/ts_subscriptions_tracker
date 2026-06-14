# Use the official Node.js 20 Alpine image as base
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
RUN npm install -g pnpm

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_HEXCLAVE_API_URL
ARG NEXT_PUBLIC_HEXCLAVE_PROJECT_ID
ARG NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY

ENV NEXT_PUBLIC_HEXCLAVE_API_URL=$NEXT_PUBLIC_HEXCLAVE_API_URL
ENV NEXT_PUBLIC_HEXCLAVE_PROJECT_ID=$NEXT_PUBLIC_HEXCLAVE_PROJECT_ID
ENV NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY=$NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
