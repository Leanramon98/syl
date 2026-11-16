# Multi-stage build for Sol & Lea Wedding App & API
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime container
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/app/data

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server

# Ensure persistent data directory exists
RUN mkdir -p /app/data

VOLUME /app/data
EXPOSE 80

CMD ["node", "server/index.js"]
