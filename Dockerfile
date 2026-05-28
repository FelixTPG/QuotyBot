FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data

VOLUME ["/app/data"]

CMD ["node", "index.js"]
