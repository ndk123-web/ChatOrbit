FROM node:18.16.0-alpine3.18

# Set working directory
WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Now copy rest of the app
COPY . .

# Expose the Vite development server port It's Not Important to note that the port exposed here is the one used by the Vite development server, not the one used by the production build.
# In production, the app will be served on port 80 or 443 (for HTTPS), depending on your server configuration.
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev"]
