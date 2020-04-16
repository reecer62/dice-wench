FROM node:10

WORKDIR /wench

COPY package*.json /wench/

RUN npm install

COPY . .

CMD ["node", "index.js"]
