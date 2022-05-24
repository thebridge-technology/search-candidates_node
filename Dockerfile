FROM node:17.7-alpine

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

CMD [ "node", "index.js" ]