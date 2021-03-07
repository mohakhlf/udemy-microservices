FROM node:alpine
WORKDIR /client
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]