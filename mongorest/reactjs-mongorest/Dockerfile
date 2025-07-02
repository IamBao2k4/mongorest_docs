# Stage 1: Use pre-built application
FROM node:20-alpine AS production
WORKDIR /app

# Copy pre-built dist folder and necessary files
COPY dist ./dist
COPY package.json ./
COPY yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Install serve to run the production build
RUN yarn global add serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"] 