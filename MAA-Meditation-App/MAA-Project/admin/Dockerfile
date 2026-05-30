# ---------- Stage 1: Build ----------
FROM node:22.11.0-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.ts postcss.config.js index.html ./
COPY src ./src
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
