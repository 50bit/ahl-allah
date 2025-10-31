# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Explicitly set npm registry to global registry
RUN npm cache clean --force
RUN rm -f ~/.npmrc /usr/local/etc/npmrc 2>/dev/null || true
RUN npm config delete registry 2>/dev/null || true
RUN npm config set registry https://registry.npmjs.org/

# Install dependencies
RUN npm install -g typescript
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 60772

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:60772/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]


