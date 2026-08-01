FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (from frontend/ dir relative to docker context root)
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy all config files (critical: tsconfig.node.json)
COPY frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/cypress.config.ts frontend/index.html frontend/tailwind.config.js frontend/postcss.config.js ./

# Copy source code
COPY frontend/src ./src

# Build
RUN npm run build


FROM nginx:alpine

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (nginx uses 80 by default, but let's expose 3000 as configured in compose if we change the config, wait, nginx.conf listens on 80. docker-compose maps 3000:3000. Wait, docker-compose maps 3000 to the container port. So nginx must listen on 3000 or docker-compose must be updated. nginx.conf listens on 80. Let's change nginx.conf to listen on 3000.)
# I'll just expose 80 and we will update docker-compose or we update nginx to listen on 3000.
# Actually I will sed the nginx.conf to listen on 3000 inside the Dockerfile.
RUN sed -i 's/listen 80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Health check
HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]
