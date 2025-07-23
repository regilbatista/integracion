const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Accounting API',
      version: '1.0.0',
      description: 'API para sistema de contabilidad',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
      schemas: {
        // Esquemas para el sistema contable
        TipoCuenta: {
          type: 'object',
          required: ['descripcion', 'origen'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del tipo de cuenta',
            },
            descripcion: {
              type: 'string',
              maxLength: 100,
              description: 'Descripción del tipo de cuenta',
            },
            origen: {
              type: 'string',
              enum: ['DB', 'CR'],
              description: 'Origen de la cuenta (Débito o Crédito)',
            },
            estado_Id: {
              type: 'integer',
              description: 'Estado del tipo de cuenta',
            },
          },
        },
        CuentaContable: {
          type: 'object',
          required: ['descripcion', 'tipoCuenta_Id', 'permiteTransacciones', 'nivel'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la cuenta contable',
            },
            descripcion: {
              type: 'string',
              maxLength: 100,
              description: 'Descripción de la cuenta',
            },
            tipoCuenta_Id: {
              type: 'integer',
              description: 'ID del tipo de cuenta',
            },
            permiteTransacciones: {
              type: 'boolean',
              description: 'Indica si permite transacciones',
            },
            nivel: {
              type: 'integer',
              minimum: 1,
              maximum: 3,
              description: 'Nivel de la cuenta (1-3)',
            },
            cuentaMayor_Id: {
              type: 'integer',
              description: 'ID de la cuenta mayor (para jerarquía)',
            },
            balance: {
              type: 'number',
              format: 'decimal',
              description: 'Balance actual de la cuenta',
            },
            estado_Id: {
              type: 'integer',
              description: 'Estado de la cuenta',
            },
          },
        },
        EntradaContable: {
          type: 'object',
          required: ['descripcion', 'cuenta_Id', 'tipoMovimiento', 'fechaAsiento', 'montoAsiento'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la entrada contable',
            },
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del asiento contable',
            },
            auxiliar_Id: {
              type: 'integer',
              description: 'ID del auxiliar',
            },
            cuenta_Id: {
              type: 'integer',
              description: 'ID de la cuenta contable',
            },
            tipoMovimiento: {
              type: 'string',
              enum: ['DB', 'CR'],
              description: 'Tipo de movimiento (Débito o Crédito)',
            },
            fechaAsiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha del asiento',
            },
            montoAsiento: {
              type: 'number',
              format: 'decimal',
              description: 'Monto del asiento',
            },
            estado_Id: {
              type: 'integer',
              description: 'Estado del asiento',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del recurso creado',
            },
            msg: {
              type: 'string',
              description: 'Mensaje de éxito',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['user', 'password'],
          properties: {
            user: {
              type: 'string',
              description: 'Nombre de usuario',
            },
            password: {
              type: 'string',
              description: 'Contraseña',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                userData: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                    },
                    user: {
                      type: 'string',
                    },
                    permissions: {
                      type: 'string',
                    },
                  },
                },
                msg: {
                  type: 'string',
                },
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
         // NUEVOS ESQUEMAS PARA API KEYS
        ApiKeyResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            },
            meta: {
              type: 'object',
              properties: {
                total: { 
                  type: 'integer',
                  description: 'Total de registros'
                },
                apiKey: { 
                  type: 'string',
                  description: 'Nombre de la API Key utilizada'
                },
                sistemaOrigen: { 
                  type: 'string',
                  description: 'Sistema que realizó la petición'
                }
              }
            }
          }
        },
        ApiKeyCreate: {
          type: 'object',
          required: ['nombre', 'permisos'],
          properties: {
            nombre: {
              type: 'string',
              maxLength: 100,
              description: 'Nombre descriptivo de la API Key'
            },
            descripcion: {
              type: 'string',
              maxLength: 255,
              description: 'Descripción del propósito'
            },
            sistemaOrigen: {
              type: 'string',
              maxLength: 100,
              description: 'Sistema que usará la key'
            },
            permisos: {
              type: 'array',
              items: { type: 'string' },
              example: ['GET:/api/public/catalogo-cuentas', 'POST:/api/public/entradas-contables'],
              description: 'Lista de permisos de endpoint'
            },
            ipPermitidas: {
              type: 'array',
              items: { type: 'string' },
              example: ['192.168.1.100', '10.0.0.50'],
              description: 'IPs permitidas (opcional)'
            },
            limitePorMinuto: {
              type: 'integer',
              default: 60,
              description: 'Límite de requests por minuto'
            },
            fechaVencimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de vencimiento (opcional)'
            }
          }
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.js', './src/routes/*.js'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJSDoc(options);

// Debug: Verificar si se están cargando las rutas
console.log('Swagger spec paths:', Object.keys(specs.paths || {}));
console.log('Total de rutas encontradas:', Object.keys(specs.paths || {}).length);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Car Rental & Accounting API',
  }));
};