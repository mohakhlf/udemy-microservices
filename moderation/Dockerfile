FROM node:alpine
WORKDIR /moderation
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]