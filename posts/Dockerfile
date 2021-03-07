FROM node:alpine
WORKDIR /posts
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]