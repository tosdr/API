FROM node:16


COPY . /app

WORKDIR /app

RUN npm install && npm run build

ENTRYPOINT [ "node", "build/index.js" ]