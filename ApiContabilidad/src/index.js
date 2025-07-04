const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const { app, server } = require('./config/socket.js');
const routerAuth = require('./routes/routerAuth');
const routerAdmin = require('./routes/routerAdmin');
const router = require('./routes/router.js');

// Importar configuración de Swagger
const swagger = require('./config/swagger.js');

const { verifyToken, verifyAuthorization } = require('./middlewares/verify.js');

// Settings
app.set('appName', 'API-REST');
app.set('port', 3001);
app.set('appVersion', '1.0');
app.use(bodyParser.json({ limit: '50mb' }));

// app.use(express.static('src/screens'));
app.use(cookieParser());

// Configurar Swagger
swagger(app);

// if (process.env.DEV) {
const morgan = require('morgan');
app.use(morgan('dev'));
// }

app.use(
    cors({
        origin: ['http://127.0.0.1', 'http://localhost:3000', 'http://localhost:3001'],
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
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply token verification middleware at a higher level
// Router -- API Versions
app.use('/api/', routerAuth);
app.use('/api/admin',verifyToken, routerAdmin);
app.use('/api/', verifyToken, router);

// Server
server.listen(app.get('port'), () => {
    console.log(app.get('appName'), ' running on port: ', app.get('port'));
    console.log(`Swagger docs available at: http://localhost:${app.get('port')}/api-docs`);
});