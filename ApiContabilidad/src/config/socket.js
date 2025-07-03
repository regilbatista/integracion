const { Server } = require('socket.io');
const express = require('express');
const compression = require('compression');
const http = require('http');

const app = express();
app.use(compression());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1', 'http://localhost:3000', 'http://localhost:3001',],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Access-Token',
        'Cookie',
        'Access-Control-Allow-Private-Network',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'cache-control',
    ],
    preflightContinue: false,
  }
});

module.exports = { io, app, server };
