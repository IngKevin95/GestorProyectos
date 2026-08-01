FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./

# Build
RUN npm run build


FROM node:18-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Copy .env.example for reference
COPY frontend/.env.example ./

# Environment
ENV VITE_API_URL=http://localhost:8000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1

# Start the app
CMD ["serve", "-s", "dist", "-l", "3000"]
