const router = require('express').Router();
const { WebServices, LogsWebServices, Users } = require('../config/db/database');

/**
 * @swagger
 * /api/admin/webServices:
 *   get:
 *     summary: Obtiene todos los web services
 *     tags: [Web Services]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de web services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 */
router.get('/', async (req, res) => {
    try {
        let webServices = await WebServices.findAll({
            //where: {} 
        });
        webServices = JSON.parse(JSON.stringify(webServices));

        return res.status(200).json(webServices);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await WebServices.findOne({
            where: { id: req.params.id }
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }
});

/**
 * @swagger
 * /api/admin/webServices:
 *   post:
 *     summary: Crea un nuevo web service
 *     tags: [Web Services]
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
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Web service creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        // Verificar que no exista otro web service con el mismo nombre
        const existingService = await WebServices.findOne({ where: { nombre } });
        if (existingService) {
            return res.status(400).json([{ error: 'Web service with same name already exists' }]);
        }

        const data = await WebServices.create({ nombre, descripcion });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        await WebServices.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const webService = await WebServices.findOne({ where: { id: req.params.id } });

        if (!webService) return res.status(200).json([{ error: 'id not found' }]);

        // Verificar si tiene logs asociados antes de eliminar
        const hasLogs = await LogsWebServices.findOne({ where: { webService_Id: req.params.id } });
        if (hasLogs) {
            return res.status(400).json([{ error: 'Cannot delete: web service has associated logs' }]);
        }

        await webService.destroy();
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;