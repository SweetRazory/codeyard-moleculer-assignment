FROM node:18 as build

WORKDIR /tmp/app

# Install dependencies
COPY package.json package-lock.json ./
# RUN npm install -g npm@latest
RUN npm ci --silent

# Copy source
COPY . .

# Build
RUN npm run build

# -------------------
FROM node:18-alpine

WORKDIR /app

# Copy source
COPY . .

# Copy built files
COPY --from=build /tmp/app/dist .

# Build and cleanup
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Start server
CMD ["node", "./node_modules/moleculer/bin/moleculer-runner.js"]
