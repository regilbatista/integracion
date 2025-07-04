const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./controllers/tiposCuenta.js'], // Solo un archivo para probar
};

const specs = swaggerJSDoc(options);
console.log('=== DEBUG SWAGGER ===');
console.log('Specs generated:', JSON.stringify(specs, null, 2));

module.exports = (app) => {
  app.use('/api-docs-test', swaggerUi.serve, swaggerUi.setup(specs));
};