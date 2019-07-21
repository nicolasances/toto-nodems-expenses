FROM node:12-alpine

RUN mkdir /app

COPY . /app/

CMD node /app/expenses.js
