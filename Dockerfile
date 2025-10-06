# Use Node.js 18 Debian as base image for better Prisma compatibility
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies for native modules and OpenSSL
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Ensure devDeps install and skip postinstall scripts during npm ci
ENV NPM_CONFIG_PRODUCTION=false \
    PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build, but skip postinstall scripts
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production image ---
FROM node:18-slim AS runner
WORKDIR /app

# Install OpenSSL and dumb-init for production
RUN apt-get update && apt-get install -y \
    openssl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Ensure logs directory exists at runtime
RUN mkdir -p /app/logs

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with database migration
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
