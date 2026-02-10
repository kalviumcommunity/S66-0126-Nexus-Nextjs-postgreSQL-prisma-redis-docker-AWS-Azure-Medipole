# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files and build the app
COPY . .
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
