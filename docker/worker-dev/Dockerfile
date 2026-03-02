FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@11.11.0
RUN npm install

COPY . .

CMD ["sh", "-c", "npx prisma generate && npm run start:dev:worker"]
