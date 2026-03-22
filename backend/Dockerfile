# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
# Ensure runtime upload directory exists even if /public isn't in source tree.
RUN mkdir -p /app/public/uploads/pdfs

# Set environment to production
ENV NODE_ENV=production

# Expose the API port
EXPOSE 5000

# API + BullMQ workers (AI + PDF). Required for assignment generation in a single container.
CMD ["npm", "run", "start:all"]
