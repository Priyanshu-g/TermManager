# Use an official Node.js runtime as a parent image
FROM node:18

# Create and set the working directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g @angular/cli

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN ng build --configuration=production

# Change the working directory to where the build output is located
WORKDIR /src/dist/browser/term-manager 

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the app
CMD ["node", "/src/server.js"]
