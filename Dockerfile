FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data

VOLUME ["/app/data"]

CMD ["node", "index.js"]
