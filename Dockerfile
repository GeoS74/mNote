FROM node

WORKDIR /mnote

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3300

CMD ["node", "./index"]