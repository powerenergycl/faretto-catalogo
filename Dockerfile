FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
ARG APP_VERSION=local
ENV NODE_ENV=production
ENV PORT=8080
ENV APP_VERSION=$APP_VERSION

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/dist ./dist

USER node
EXPOSE 8080

CMD ["node", "server.js"]
