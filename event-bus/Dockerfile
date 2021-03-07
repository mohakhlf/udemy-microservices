FROM node:alpine
WORKDIR /event-bus
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]