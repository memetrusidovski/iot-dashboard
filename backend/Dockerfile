FROM node:20-alpine

WORKDIR /app

# Install process manager
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 3001

CMD ["pm2-runtime", "processes.json"]