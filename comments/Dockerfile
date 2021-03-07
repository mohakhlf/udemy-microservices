FROM node:alpine
WORKDIR /comments
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]