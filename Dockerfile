FROM node:16-alpine
WORKDIR /code
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
CMD [ "npm", "start"]