# Use a node base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN rm -f package-lock.json && npm cache clean --force
RUN npm install -g npm@latest
RUN npm install

# Copy the rest of the application files
COPY . .

# Serve the React app in development mode for real-time editing
CMD ["npm", "start"]
