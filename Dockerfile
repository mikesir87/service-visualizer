FROM node

COPY . /app
WORKDIR /app
CMD ["node", "server.js"]
