FROM node:16.13.1-alpine3.15

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENTRYPOINT ["npm", "start"]
