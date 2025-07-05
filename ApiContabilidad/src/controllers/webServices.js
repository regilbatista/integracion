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
 *                   estado_Id:
 *                     type: integer
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

/**
 * @swagger
 * /api/admin/webServices/{id}:
 *   get:
 *     summary: Obtiene un web service por ID
 *     tags: [Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del web service
 *     responses:
 *       200:
 *         description: Web service encontrado
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
 *                   estado_Id:
 *                     type: integer
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
 *               - estado_Id
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Web service creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, estado_Id } = req.body;

        if (!nombre || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        // Verificar que no exista otro web service con el mismo nombre
        const existingService = await WebServices.findOne({ where: { nombre } });
        if (existingService) {
            return res.status(400).json([{ error: 'Web service with same name already exists' }]);
        }

        const data = await WebServices.create({ nombre, descripcion, estado_Id });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/webServices/{id}:
 *   patch:
 *     summary: Actualiza un web service
 *     tags: [Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del web service a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nuevo nombre del web service
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nueva descripción
 *               estado_Id:
 *                 type: integer
 *                 description: Nuevo estado
 *     responses:
 *       200:
 *         description: Web service actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', async (req, res) => {
    try {
        await WebServices.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/webServices/{id}:
 *   delete:
 *     summary: Realiza borrado lógico de un web service (cambia estado activo/inactivo)
 *     tags: [Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del web service
 *     responses:
 *       200:
 *         description: Estado del web service cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res) => {
    try {
        const webService = await WebServices.findOne({ where: { id: req.params.id } });

        if (!webService) return res.status(200).json([{ error: 'id not found' }]);

        // Verificar si tiene logs asociados y está activo antes de desactivar
        if (webService.estado_Id === 1) {
            const hasActiveLogs = await LogsWebServices.findOne({ where: { webService_Id: req.params.id } });
            if (hasActiveLogs) {
                // Solo advertir, pero permitir la desactivación (borrado lógico)
                console.log(`Warning: Deactivating web service ${req.params.id} that has associated logs`);
            }
        }

        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        webService.estado_Id = webService.estado_Id === 1 ? 2 : 1;
        await webService.save();

        const action = webService.estado_Id === 1 ? 'activated' : 'deactivated';
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: webService.estado_Id 
        }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;