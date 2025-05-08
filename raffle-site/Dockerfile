# Build stage
FROM node:23.11.0-alpine AS build

WORKDIR /app


# Copy package files
COPY . .

# Create .env file from build args
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env && \
  echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env

# Clean install dependencies with security audit
RUN rm -rf node_modules package-lock.json && \
  npm cache clean --force && \
  npm install && \
  npm install vite@latest && \
  npm audit fix --force

# Copy source code
# COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.28.0-alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 