FROM node:alpine
# Add the following line 
ENV CI=true
WORKDIR /client
ADD ./package*.json ./
RUN npm i
COPY . .
CMD [ "npm", "start" ]