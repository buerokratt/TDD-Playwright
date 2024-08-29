# Use an official Node.js image with Playwright pre-installed
FROM mcr.microsoft.com/playwright:focal

# Set the working directory in the container
WORKDIR /TDD-playwright

# Copy the package.json and package-lock.json
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Run Playwright installation to ensure all browsers are installed
RUN npx playwright install

# Expose the port for the Playwright HTML report
EXPOSE 9323

# # Keep the container running and open for commands
# CMD ["tail", "-f", "/dev/null"]
