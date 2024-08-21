# Use the official Node.js image as the base image
FROM node:18-bullseye-slim

# Set the working directory in the container
WORKDIR /prod

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Install the necessary Playwright dependencies
RUN npx playwright install-deps && npx playwright install

# Command to run your tests
CMD ["npx", "playwright", "test"]
