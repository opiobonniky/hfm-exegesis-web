# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage: compile the Vite SPA.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from the npm lockfile first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Vite inlines VITE_* values at build time. They come from the committed
# .env file, which Vite loads automatically, so the production API/Supabase
# config ends up baked into the bundle.
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime stage: serve the static bundle with nginx + SPA fallback.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Railway injects PORT; the template below binds nginx to it at startup.
ENV PORT=8080
EXPOSE 8080

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# The official nginx image runs envsubst over /etc/nginx/templates/*.template
# and writes the result into /etc/nginx/conf.d/ before nginx starts.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
