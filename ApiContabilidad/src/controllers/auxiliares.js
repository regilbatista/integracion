const router = require('express').Router();
const { Auxiliares } = require('../config/db/database');

/**
 * @swagger
 * /api/admin/auxiliares:
 *   get:
 *     summary: Obtiene todos los auxiliares
 *     tags: [Auxiliares]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de auxiliares
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
 *                   estado_Id:
 *                     type: integer
 */
router.get('/', async (req, res) => {
    try {
        let auxiliaries = await Auxiliares.findAll({
            //where: {} 
        });
        auxiliaries = JSON.parse(JSON.stringify(auxiliaries));

        return res.status(200).json(auxiliaries);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/auxiliares/{id}:
 *   get:
 *     summary: Obtiene un auxiliar por ID
 *     tags: [Auxiliares]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del auxiliar
 *     responses:
 *       200:
 *         description: Auxiliar encontrado
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
        const data = await Auxiliares.findOne({
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
 * /api/admin/auxiliares:
 *   post:
 *     summary: Crea un nuevo auxiliar
 *     tags: [Auxiliares]
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
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Auxiliar creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { nombre, estado_Id } = req.body;

        if (!nombre || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        const data = await Auxiliares.create({ nombre, estado_Id });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/auxiliares/{id}:
 *   patch:
 *     summary: Actualiza un auxiliar
 *     tags: [Auxiliares]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del auxiliar a actualizar
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
 *                 description: Nuevo nombre del auxiliar
 *               estado_Id:
 *                 type: integer
 *                 description: Nuevo estado
 *     responses:
 *       200:
 *         description: Auxiliar actualizado exitosamente
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
        await Auxiliares.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/auxiliares/{id}:
 *   delete:
 *     summary: Realiza borrado lógico de un auxiliar (cambia estado activo/inactivo)
 *     tags: [Auxiliares]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del auxiliar
 *     responses:
 *       200:
 *         description: Estado del auxiliar cambiado exitosamente
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
        const auxiliary = await Auxiliares.findOne({ where: { id: req.params.id } });

        if (!auxiliary) return res.status(200).json([{ error: 'id not found' }]);

        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        auxiliary.estado_Id = auxiliary.estado_Id === 1 ? 2 : 1;
        await auxiliary.save();

        const action = auxiliary.estado_Id === 1 ? 'activated' : 'deactivated';
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: auxiliary.estado_Id 
        }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;