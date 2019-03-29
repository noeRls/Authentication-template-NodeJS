# Node application
FROM node:10-alpine

# Install dependencies
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
RUN npm install -g mocha nodemon

# Wait port
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

COPY src ./src/
COPY tests ./tests

# Run application TODO: run build on production and nodemon on development
CMD /wait && npm start