FROM node:20-alpine

WORKDIR /app

# Copy package definition
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build Vue 3 Frontend
RUN npm run build

# Expose port (default 3001 or Cloud PORT env)
EXPOSE 3001

# Start the unified backend & frontend server
CMD ["npm", "start"]
