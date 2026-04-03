# Stage 1: Build the frontend
FROM node:22-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the server
FROM node:22-slim

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/firebase-applet-config.json ./
COPY --from=build /app/.env.example ./.env

# Install tsx for running server.ts directly if needed, or use node if types are stripped
RUN npm install -g tsx

EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["tsx", "server.ts"]
