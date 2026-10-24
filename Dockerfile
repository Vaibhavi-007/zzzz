# Stage 1: Build React Frontend
FROM node:22-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine
WORKDIR /app

# Copy and install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets from stage 1 into client/dist
COPY --from=builder /app/client/dist /app/client/dist

# Expose production port
EXPOSE 5050

ENV NODE_ENV=production
ENV PORT=5050

CMD ["node", "server.js"]
