# Stage 1: Build frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: NGINX + certs
FROM nginx:alpine

# Frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# ✅ Server certificates
RUN mkdir -p /etc/nginx/certs
COPY certs/server.key       /etc/nginx/certs/server.key
COPY certs/server.pem       /etc/nginx/certs/server.pem
COPY certs/ca-chain.crt     /etc/nginx/certs/ca-chain.crt

EXPOSE 9090
