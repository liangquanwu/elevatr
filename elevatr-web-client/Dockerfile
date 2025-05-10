# Stage 1: Build stage
FROM node:20 AS builder

# Accept Firebase build-time secrets
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_AUTH_DOMAIN
ARG NEXT_PUBLIC_PROJECT_ID
ARG NEXT_PUBLIC_APP_ID
ARG NEXT_PUBLIC_MEASUREMENT_ID

# Make env vars available during build
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN
ENV NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID
ENV NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID
ENV NEXT_PUBLIC_MEASUREMENT_ID=$NEXT_PUBLIC_MEASUREMENT_ID

# Set the working directory
WORKDIR /app

# Copy package*.json files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app (env vars are now available)
RUN npm run build

# Stage 2: Production stage
FROM node:20

WORKDIR /app

# Copy package.json and install only prod deps
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "start"]