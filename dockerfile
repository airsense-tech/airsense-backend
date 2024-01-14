# Use the latest Node.js image.
FROM node:latest

# Set up the working directory.
WORKDIR /app

# Expose the port that the server is running on.
EXPOSE 7325

# Copy package.json and package-lock.json to the working directory.
COPY package.json .
COPY package-lock.json .

# Install the dependencies.
# This step is done before copying the source code to make use of Docker's caching mechanism.
RUN npm install

# Copy configuration files.
COPY .eslintrc .
COPY .eslintignore .
COPY .prettierrc .

# Copy the source code to the working directory.
COPY tsconfig.json .
COPY src/ ./src

# Enable Node.js production mode.
# This step should be done after installing the dependencies.
ENV NODE_ENV=production

# Build the source code.
RUN npm run build

# Run the application.
CMD [ "node", "--no-deprecation", "build/app.js" ]
