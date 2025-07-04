const router = require('express').Router();
const { LogsWebServices, WebServices, Users } = require('../config/db/database');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/admin/logsWebServices:
 *   get:
 *     summary: Obtiene todos los logs de web services
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs de web services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   webService_Id:
 *                     type: integer
 *                   usuario_Id:
 *                     type: integer
 *                   fechaHora:
 *                     type: string
 *                     format: date-time
 *                   parametrosEnviados:
 *                     type: string
 *                   respuesta:
 *                     type: string
 */
router.get('/', async (req, res) => {
    try {
        let logs = await LogsWebServices.findAll({
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: 100 // Limitar para evitar demasiados registros
        });
        logs = JSON.parse(JSON.stringify(logs));

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/usuario/{userId}:
 *   get:
 *     summary: Obtiene logs de un usuario específico
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Logs del usuario
 */
router.get('/usuario/:userId', async (req, res) => {
    try {
        const logs = await LogsWebServices.findAll({
            where: { usuario_Id: req.params.userId },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: 50
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/servicio/{serviceId}:
 *   get:
 *     summary: Obtiene logs de un web service específico
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Logs del web service
 */
router.get('/servicio/:serviceId', async (req, res) => {
    try {
        const logs = await LogsWebServices.findAll({
            where: { webService_Id: req.params.serviceId },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: 50
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/periodo:
 *   get:
 *     summary: Obtiene logs por período de tiempo
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Logs del período
 */
router.get('/periodo', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json([{ error: 'Start date and end date are required' }]);
        }

        const logs = await LogsWebServices.findAll({
            where: {
                fechaHora: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ],
            order: [['fechaHora', 'DESC']]
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await LogsWebServices.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ]
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices:
 *   post:
 *     summary: Crea un nuevo log de web service
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webService_Id
 *               - usuario_Id
 *             properties:
 *               webService_Id:
 *                 type: integer
 *               usuario_Id:
 *                 type: integer
 *               parametrosEnviados:
 *                 type: string
 *               respuesta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { webService_Id, usuario_Id, parametrosEnviados, respuesta } = req.body;

        if (!webService_Id || !usuario_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        // Verificar que el web service existe
        const webService = await WebServices.findOne({ where: { id: webService_Id } });
        if (!webService) {
            return res.status(400).json([{ error: 'Web service not found' }]);
        }

        // Verificar que el usuario existe
        const user = await Users.findOne({ where: { id: usuario_Id } });
        if (!user) {
            return res.status(400).json([{ error: 'User not found' }]);
        }

        const data = await LogsWebServices.create({ 
            webService_Id, 
            usuario_Id, 
            parametrosEnviados, 
            respuesta 
        });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

// Los logs generalmente no se actualizan, pero se incluye por completitud
router.patch('/:id', async (req, res) => {
    try {
        await LogsWebServices.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

// Los logs generalmente no se eliminan, pero se incluye por completitud
router.delete('/:id', async (req, res) => {
    try {
        const log = await LogsWebServices.findOne({ where: { id: req.params.id } });

        if (!log) return res.status(200).json([{ error: 'id not found' }]);

        await log.destroy();
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;