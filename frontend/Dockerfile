# Use official Node.js image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json first
COPY package.json .

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose port for frontend
EXPOSE 3000

# Start frontend server
CMD ["node", "server.js"]
