# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

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
FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init

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

# Start the application
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "start"]
