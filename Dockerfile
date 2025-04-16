# Use an official Node.js runtime as a parent image (Alpine is smaller)
# Consider using a specific LTS version like node:18-alpine or node:20-alpine
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Install production dependencies.
# If you add dependencies, make sure package-lock.json is committed
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Use --omit=dev if you have devDependencies, otherwise --production is fine
# For now, as there are no dependencies, this won't do much but is good practice
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Make port 8080 available to the world outside this container
# This should match the internal_port in fly.toml and the PORT env var
EXPOSE 8080

# Define the command to run your app using CMD which defines your runtime
# Use the "start" script defined in package.json
CMD [ "npm", "start" ]
