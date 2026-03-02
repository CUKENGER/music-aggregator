FROM node:20-alpine

RUN apk add --no-cache python3 py3-virtualenv ffmpeg ca-certificates openssl \
    && update-ca-certificates \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@11.11.0
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run start:dev:api"]