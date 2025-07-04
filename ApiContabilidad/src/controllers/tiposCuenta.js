const router = require('express').Router();
const { TiposCuenta } = require('../config/db/database');

/**
 * @swagger
 * /api/admin/tiposCuenta:
 *   get:
 *     summary: Obtiene todos los tipos de cuenta
 *     tags: [Tipos de Cuenta]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoCuenta'
 */
router.get('/', async (req, res) => {
    try {
        let accountTypes = await TiposCuenta.findAll({
            //where: {} 
        });
        accountTypes = JSON.parse(JSON.stringify(accountTypes));

        return res.status(200).json(accountTypes);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/tiposCuenta/{id}:
 *   get:
 *     summary: Obtiene un tipo de cuenta por ID
 *     tags: [Tipos de Cuenta]
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
 *         description: Tipo de cuenta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoCuenta'
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await TiposCuenta.findOne({
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
 * /api/admin/tiposCuenta:
 *   post:
 *     summary: Crea un nuevo tipo de cuenta
 *     tags: [Tipos de Cuenta]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - origen
 *               - estado_Id
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 100
 *               origen:
 *                 type: string
 *                 enum: [DB, CR]
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tipo de cuenta creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { descripcion, origen, estado_Id } = req.body;

        if (!descripcion || !origen || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        const data = await TiposCuenta.create({ descripcion, origen, estado_Id });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/tiposCuenta/{id}:
 *   patch:
 *     summary: Actualiza un tipo de cuenta
 *     tags: [Tipos de Cuenta]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoCuenta'
 *     responses:
 *       200:
 *         description: Tipo de cuenta actualizado exitosamente
 */
router.patch('/:id', async (req, res) => {
    try {
        await TiposCuenta.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/tiposCuenta/{id}:
 *   delete:
 *     summary: Cambia el estado de un tipo de cuenta
 *     tags: [Tipos de Cuenta]
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
 *         description: Estado cambiado exitosamente
 */
router.delete('/:id', async (req, res) => {
    try {
        const accountType = await TiposCuenta.findOne({ where: { id: req.params.id } });

        if (!accountType) return res.status(200).json([{ error: 'id not found' }]);

        accountType.estado_Id = accountType.estado_Id === 1 ? 2 : 1;
        await accountType.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;