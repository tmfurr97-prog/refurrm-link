FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite React app
RUN npm run build

# Install 'serve' to run the static site
RUN npm install -g serve

# Cloud Run provides the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE $PORT

# Start the server, routing all requests to index.html (SPA)
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
