FROM node:22

WORKDIR /app

COPY docs/package*.json ./
RUN npm install

COPY docs .

EXPOSE 5173

CMD ["npx", "vitepress", "dev", ".", "--host", "0.0.0.0"]