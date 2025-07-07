const { LogsWebServices, WebServices } = require('../config/db/database');

/**
 * Middleware para logging automático basado en mapeo de rutas
 */
const createWebServiceLogger = () => {
    // Mapeo de rutas a IDs de web services
    const routeToWebServiceMap = {
        // Rutas de usuario (solo lectura)
        'GET:/api/catalogoCuentas': 1,
        'GET:/api/auxiliares': 2,
        'GET:/api/entradasContables': 3,
        
        // Rutas de administrador
        'GET:/api/admin/users': 4,
        'POST:/api/admin/users': 5,
        'GET:/api/admin/webServices': 6,
        'POST:/api/admin/webServices': 7,
        'GET:/api/admin/catalogoCuentas': 8,
        'POST:/api/admin/catalogoCuentas': 9,
        'PATCH:/api/admin/catalogoCuentas': 10,
        'DELETE:/api/admin/catalogoCuentas': 11,
        'GET:/api/admin/entradasContables': 12,
        'POST:/api/admin/entradasContables': 13,
        'GET:/api/admin/tiposCuenta': 14,
        'POST:/api/admin/tiposCuenta': 15,
        'PATCH:/api/admin/tiposCuenta': 16,
        'DELETE:/api/admin/tiposCuenta': 17,
        'GET:/api/admin/tiposMoneda': 18,
        'POST:/api/admin/tiposMoneda': 19,
        'PATCH:/api/admin/tiposMoneda': 20,
        'DELETE:/api/admin/tiposMoneda': 21,
        'GET:/api/admin/auxiliares': 22,
        'POST:/api/admin/auxiliares': 23,
        'PATCH:/api/admin/auxiliares': 24,
        'DELETE:/api/admin/auxiliares': 25,
        'GET:/api/admin/logsWebServices': 26,
        
        // Agrega más mapeos según tus necesidades
    };

    return async (req, res, next) => {
        try {
            // Construir la clave de ruta - CORREGIDO
            let routePath = req.baseUrl || '';
            if (req.route && req.route.path) {
                routePath += req.route.path;
            } else {
                routePath += req.path || '';
            }
            
            const routeKey = `${req.method}:${routePath}`;
            console.log('🔍 Route key:', routeKey); // Debug
            
            const webServiceId = routeToWebServiceMap[routeKey];

            // Si no hay mapeo para esta ruta, continuar sin logging
            if (!webServiceId) {
                console.log('⚠️ No mapping found for route:', routeKey);
                return next();
            }

            console.log('✅ Found mapping for route:', routeKey, '-> WebService ID:', webServiceId);

            // Verificar que el web service existe
            const webService = await WebServices.findByPk(webServiceId);
            if (!webService) {
                console.warn(`Web service con ID ${webServiceId} no encontrado para ruta ${routeKey}`);
                return next();
            }

            // Capturar el tiempo de inicio
            const startTime = Date.now();

            // Interceptar la respuesta
            const originalJson = res.json;
            const originalSend = res.send;
            let responseData = null;
            let captured = false;

            res.json = function(data) {
                if (!captured) {
                    responseData = data;
                    captured = true;
                }
                return originalJson.call(this, data);
            };

            res.send = function(data) {
                if (!captured) {
                    responseData = data;
                    captured = true;
                }
                return originalSend.call(this, data);
            };

            // Preparar parámetros enviados
            const parametrosEnviados = JSON.stringify({
                body: req.body || {},
                query: req.query || {},
                params: req.params || {},
                method: req.method,
                url: req.originalUrl,
                userAgent: req.get('User-Agent'),
                contentType: req.get('Content-Type'),
                timestamp: new Date().toISOString()
            });

            // Continuar con la ejecución
            next();

            // Registrar el log cuando termine la respuesta
            res.on('finish', async () => {
                try {
                    const endTime = Date.now();
                    const duration = endTime - startTime;

                    // Obtener usuario desde res.locals (establecido por verifyToken)
                    const userId = res.locals.user ? res.locals.user.id : null;
                    
                    console.log('📝 Creating log entry for user:', userId, 'webService:', webServiceId);

                    // Preparar datos del log
                    const logData = {
                        webService_Id: webServiceId,
                        usuario_Id: userId,
                        fechaHora: new Date(),
                        parametrosEnviados: parametrosEnviados,
                        respuesta: responseData ? JSON.stringify(responseData).substring(0, 10000) : null, // Limitar a 10KB
                    };

                    // Agregar campos opcionales si existen en el modelo
                    if (res.statusCode) logData.statusCode = res.statusCode;
                    if (duration) logData.duration = duration;
                    if (req.ip) logData.ipAddress = req.ip;
                    if (res.statusCode >= 400 && responseData) {
                        logData.errorMessage = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
                    }

                    await LogsWebServices.create(logData);
                    console.log('✅ Log created successfully');

                } catch (error) {
                    console.error('❌ Error al crear log de web service:', error);
                }
            });

        } catch (error) {
            console.error('❌ Error en middleware de logging:', error);
            next(); // Continuar aunque falle el logging
        }
    };
};

module.exports = { createWebServiceLogger };