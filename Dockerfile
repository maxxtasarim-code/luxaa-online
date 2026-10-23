FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY server.mjs exa-search.mjs app.js styles.css index.html ./

EXPOSE 3000
CMD ["npm", "start"]
