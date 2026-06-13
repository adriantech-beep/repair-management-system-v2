# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies.
# Caching package files optimizes NPM install layers!
COPY package*.json ./
RUN npm ci

# Copy the rest of the source files and run Vite build
COPY . .
RUN npm run build

# Stage 2: Serve static assets using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config to support client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
