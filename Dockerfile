# Node application
FROM node:10-alpine

WORKDIR /app

# Wait port
COPY .wait /wait
RUN chmod +x /wait

# Install dependencies
RUN npm install -g mocha nodemon
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY .eslintrc.yml .
COPY src ./src/
COPY tests ./tests

# Run application
CMD npm start