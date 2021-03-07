FROM node:alpine
WORKDIR /query
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]