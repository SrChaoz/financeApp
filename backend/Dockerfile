# Use Node.js Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"]
