const router = require('express').Router();
const crypto = require('crypto');
const { ApiKeys, ApiKeyLogs, Users } = require('../config/db/database');
const { hashApiKey } = require('../middlewares/apiKeyAuth');
const { Op } = require('sequelize');

// Generar una nueva API Key
const generateApiKey = () => {
    const prefix = 'ak_live_';
    const randomPart = crypto.randomBytes(24).toString('hex');
    return prefix + randomPart;
};

/**
 * @swagger
 * /api/admin/apiKeys:
 *   get:
 *     summary: Obtiene todas las API Keys
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de API Keys (sin mostrar las keys completas)
 */
router.get('/', async (req, res) => {
    try {
        let apiKeys = await ApiKeys.findAll({
            attributes: { 
                exclude: ['keyHash'] // No mostrar el hash por seguridad
            },
            include: [{
                model: Users,
                attributes: ['id', 'usuario'],
                as: 'CreatedBy'
            }],
            order: [['createdAt', 'DESC']]
        });

        apiKeys = JSON.parse(JSON.stringify(apiKeys));

        return res.status(200).json(apiKeys);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/apiKeys:
 *   post:
 *     summary: Crea una nueva API Key
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - permisos
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *               sistemaOrigen:
 *                 type: string
 *                 maxLength: 100
 *               permisos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["GET:/api/public/catalogo-cuentas", "POST:/api/public/entradas-contables"]
 *               ipPermitidas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.100", "10.0.0.50"]
 *               limitePorMinuto:
 *                 type: integer
 *                 default: 60
 *               fechaVencimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: API Key creada exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            sistemaOrigen, 
            permisos, 
            ipPermitidas, 
            limitePorMinuto, 
            fechaVencimiento 
        } = req.body;

        if (!nombre || !permisos || !Array.isArray(permisos)) {
            return res.status(400).json([{ error: 'nombre and permisos (array) are required' }]);
        }

        // Generar nueva API Key
        const newApiKey = generateApiKey();
        const keyHash = hashApiKey(newApiKey);
        const keyPrefix = newApiKey.substring(0, 8) + '...';

        // Obtener usuario actual del token
        const currentUserId = res.locals.user ? res.locals.user.id : null;

        const apiKeyData = {
            nombre,
            keyHash,
            keyPrefix,
            descripcion: descripcion || null,
            sistemaOrigen: sistemaOrigen || null,
            permisos: JSON.stringify(permisos),
            ipPermitidas: ipPermitidas ? JSON.stringify(ipPermitidas) : null,
            limitePorMinuto: limitePorMinuto || 60,
            fechaVencimiento: fechaVencimiento || null,
            estado_Id: 1,
            creadoPor_Id: currentUserId
        };

        const createdApiKey = await ApiKeys.create(apiKeyData);

        // Retornar la API Key SOLO en la creación (única vez que se muestra)
        return res.status(200).json([{ 
            id: createdApiKey.id,
            apiKey: newApiKey, // ¡IMPORTANTE! Solo se muestra una vez
            message: 'API Key created successfully. Save this key securely - it will not be shown again!'
        }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/apiKeys/{id}:
 *   get:
 *     summary: Obtiene una API Key por ID (sin mostrar la key)
 *     tags: [API Keys]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la API Key
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await ApiKeys.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['keyHash'] },
            include: [{
                model: Users,
                attributes: ['id', 'usuario'],
                as: 'CreatedBy'
            }]
        });

        if (!data) return res.status(404).json({ error: 'API Key not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/apiKeys/{id}:
 *   patch:
 *     summary: Actualiza una API Key
 *     tags: [API Keys]
 */
router.patch('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Convertir arrays a JSON si se proporcionan
        if (updateData.permisos && Array.isArray(updateData.permisos)) {
            updateData.permisos = JSON.stringify(updateData.permisos);
        }
        
        if (updateData.ipPermitidas && Array.isArray(updateData.ipPermitidas)) {
            updateData.ipPermitidas = JSON.stringify(updateData.ipPermitidas);
        }

        // No permitir modificar keyHash, keyPrefix, ni creadoPor_Id
        delete updateData.keyHash;
        delete updateData.keyPrefix;
        delete updateData.creadoPor_Id;

        await ApiKeys.update(updateData, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'API Key updated successfully' }]);
        
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/apiKeys/{id}:
 *   delete:
 *     summary: Desactiva/activa una API Key (borrado lógico)
 */
router.delete('/:id', async (req, res) => {
    try {
        const apiKey = await ApiKeys.findOne({ where: { id: req.params.id } });

        if (!apiKey) {
            return res.status(404).json([{ error: 'API Key not found' }]);
        }

        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        apiKey.estado_Id = apiKey.estado_Id === 1 ? 2 : 1;
        await apiKey.save();

        const action = apiKey.estado_Id === 1 ? 'activated' : 'deactivated';
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: apiKey.estado_Id 
        }]);
        
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/apiKeys/{id}/regenerate:
 *   post:
 *     summary: Regenera una API Key existente
 */
router.post('/:id/regenerate', async (req, res) => {
    try {
        const apiKey = await ApiKeys.findOne({ where: { id: req.params.id } });

        if (!apiKey) {
            return res.status(404).json([{ error: 'API Key not found' }]);
        }

        // Generar nueva API Key
        const newApiKey = generateApiKey();
        const keyHash = hashApiKey(newApiKey);
        const keyPrefix = newApiKey.substring(0, 8) + '...';

        // Actualizar en base de datos
        await ApiKeys.update(
            { 
                keyHash,
                keyPrefix,
                usosCount: 0 // Resetear contador
            },
            { where: { id: req.params.id } }
        );

        return res.status(200).json([{ 
            id: req.params.id,
            apiKey: newApiKey, // Solo se muestra una vez
            message: 'API Key regenerated successfully. Save this key securely - it will not be shown again!'
        }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
