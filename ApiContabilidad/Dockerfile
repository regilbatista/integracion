FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001 -G nodejs && \
    chown -R apiuser:nodejs /app

USER apiuser

EXPOSE 3000

CMD ["npm", "start"]