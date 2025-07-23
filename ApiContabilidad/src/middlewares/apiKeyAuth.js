const crypto = require('crypto');
const { ApiKeys, ApiKeyLogs, Users } = require('../config/db/database');
const { Op } = require('sequelize');

// Rate limiting en memoria (en producción usar Redis)
const rateLimitMap = new Map();

const cleanupRateLimit = () => {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    for (const [key, data] of rateLimitMap.entries()) {
        if (now - data.resetTime > oneMinute) {
            rateLimitMap.delete(key);
        }
    }
};

// Limpiar cada minuto
setInterval(cleanupRateLimit, 60000);

const hashApiKey = (apiKey) => {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
};

const verifyApiKey = async (req, res, next) => {
    const startTime = Date.now();
    let apiKeyRecord = null;
    
    try {
        // Obtener API Key del header
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
        console.log('API Key received:', apiKey);
        
        if (!apiKey) {
            return res.status(401).json({ 
                error: 'API Key required',
                message: 'Provide API Key in X-API-Key header or Authorization Bearer token'
            });
        }

        // Validar formato de la API Key
        if (!apiKey.startsWith('ak_') || apiKey.length < 32) {
            return res.status(401).json({ 
                error: 'Invalid API Key format',
                message: 'API Key must start with ak_ and have proper length'
            });
        }

        // Hash de la API Key para buscar en BD
        const keyHash = hashApiKey(apiKey);
        
        // Buscar la API Key en la base de datos
        apiKeyRecord = await ApiKeys.findOne({
            where: { 
                keyHash: keyHash,
                estado_Id: 1 // Solo activas
            },
            include: [{
                model: Users,
                attributes: ['id', 'usuario'],
                as: 'CreatedBy'
            }]
        });

        if (!apiKeyRecord) {
            await logApiKeyUsage(null, req, res, startTime, 'Invalid API Key');
            return res.status(401).json({ 
                error: 'Invalid API Key',
                message: 'The provided API Key is not valid or has been deactivated'
            });
        }

        // Verificar vencimiento
        if (apiKeyRecord.fechaVencimiento && new Date() > apiKeyRecord.fechaVencimiento) {
            await logApiKeyUsage(apiKeyRecord.id, req, res, startTime, 'Expired API Key');
            return res.status(401).json({ 
                error: 'Expired API Key',
                message: 'This API Key has expired'
            });
        }

        // Verificar IP permitidas
        if (apiKeyRecord.ipPermitidas) {
            try {
                const ipPermitidas = JSON.parse(apiKeyRecord.ipPermitidas);
                if (ipPermitidas && ipPermitidas.length > 0) {
                    const clientIP = req.ip || req.connection.remoteAddress;
                    if (!ipPermitidas.includes(clientIP)) {
                        await logApiKeyUsage(apiKeyRecord.id, req, res, startTime, 'IP not allowed');
                        return res.status(403).json({ 
                            error: 'IP not allowed',
                            message: 'Your IP address is not authorized to use this API Key'
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing IP permissions:', error);
            }
        }

        // Rate limiting
        const rateLimitKey = `${apiKeyRecord.id}:${Math.floor(Date.now() / 60000)}`;
        const currentUsage = rateLimitMap.get(rateLimitKey) || { count: 0, resetTime: Date.now() };
        
        if (currentUsage.count >= apiKeyRecord.limitePorMinuto) {
            await logApiKeyUsage(apiKeyRecord.id, req, res, startTime, 'Rate limit exceeded');
            return res.status(429).json({ 
                error: 'Rate limit exceeded',
                message: `Maximum ${apiKeyRecord.limitePorMinuto} requests per minute allowed`,
                retryAfter: 60
            });
        }

        // Incrementar contador de rate limit
        rateLimitMap.set(rateLimitKey, {
            count: currentUsage.count + 1,
            resetTime: currentUsage.resetTime
        });

        // Verificar permisos para el endpoint
        //const endpoint = req.path;
        const endpoint = req.baseUrl + req.path;
        const method = req.method;
        
        if (!hasPermission(apiKeyRecord.permisos, endpoint, method)) {
            await logApiKeyUsage(apiKeyRecord.id, req, res, startTime, 'Insufficient permissions');
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: 'This API Key does not have permission to access this endpoint'
            });
        }

        // Actualizar último uso y contador
        await ApiKeys.update(
            { 
                ultimoUso: new Date(),
                usosCount: apiKeyRecord.usosCount + 1
            },
            { where: { id: apiKeyRecord.id } }
        );

        // Agregar información de la API Key al request
        req.apiKey = {
            id: apiKeyRecord.id,
            nombre: apiKeyRecord.nombre,
            sistemaOrigen: apiKeyRecord.sistemaOrigen,
            permisos: apiKeyRecord.permisos,
            user: apiKeyRecord.CreatedBy
        };

        // Interceptar respuesta para logging
        const originalJson = res.json;
        res.json = function(data) {
            logApiKeyUsage(apiKeyRecord.id, req, res, startTime);
            return originalJson.call(this, data);
        };

        next();

    } catch (error) {
        console.error('Error in API Key verification:', error);
        await logApiKeyUsage(apiKeyRecord?.id || null, req, res, startTime, error.message);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Error validating API Key'
        });
    }
};

const hasPermission = (permissions, endpoint, method) => {
    try {
        // Parsear permisos desde JSON string
        const permisosParsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
        
        // Si no hay permisos definidos, denegar acceso
        if (!permisosParsed || permisosParsed.length === 0) {
            return false;
        }

        // Verificar permisos exactos
        const exactMatch = permisosParsed.includes(`${method}:${endpoint}`);
        if (exactMatch) return true;

        // Verificar wildcards
        for (const permission of permisosParsed) {
            if (permission.includes('*')) {
                const regex = new RegExp(permission.replace(/\*/g, '.*'));
                if (regex.test(`${method}:${endpoint}`)) {
                    return true;
                }
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

const logApiKeyUsage = async (apiKeyId, req, res, startTime, errorMessage = null) => {
    try {
        const endTime = Date.now();
        const tiempoRespuesta = endTime - startTime;
        
        // Preparar parámetros enviados
        const parametrosEnviados = JSON.stringify({
            body: req.body || {},
            query: req.query || {},
            params: req.params || {},
            headers: {
                'user-agent': req.get('User-Agent'),
                'content-type': req.get('Content-Type'),
                'accept': req.get('Accept')
            }
        });

        if (apiKeyId) { // Solo loggear si tenemos un ID válido
            await ApiKeyLogs.create({
                apiKey_Id: apiKeyId,
                endpoint: req.originalUrl || req.path,
                metodo: req.method,
                ipOrigen: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                statusCode: res.statusCode || 500,
                tiempoRespuesta: tiempoRespuesta,
                parametrosEnviados: parametrosEnviados,
                respuestaSize: res.get('Content-Length') || 0,
                errorMessage: errorMessage,
                fechaHora: new Date()
            });
        }
    } catch (error) {
        console.error('Error logging API Key usage:', error);
    }
};

module.exports = {
    verifyApiKey,
    hashApiKey
};