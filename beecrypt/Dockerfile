# ==============================================================================
# HoneyChain (BeeCrypt) Production Multi-Stage Dockerfile (SIH'26)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /build

# Copy root frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Backend & Static Serving Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runtime

# Install dumb-init for proper PID 1 signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Enforce secure production environment
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root unprivileged application user
RUN addgroup -S honeychain && adduser -S nodeuser -G honeychain

WORKDIR /app

# Install production backend dependencies only
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server code
COPY server/ ./

# Copy compiled frontend distribution from builder
COPY --from=frontend-builder /build/dist /app/public

# Ensure non-root ownership
RUN chown -R nodeuser:honeychain /app

# Switch to non-root user
USER nodeuser

EXPOSE 3001

# Standardized non-destructive health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "index.js"]
