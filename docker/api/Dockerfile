FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@11.11.0
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/apps/app-api/main.js"]
