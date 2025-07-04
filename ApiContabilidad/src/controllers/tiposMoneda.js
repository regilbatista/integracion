const router = require('express').Router();
const { TiposMoneda } = require('../config/db/database');

/**
 * @swagger
 * /api/admin/tiposMoneda:
 *   get:
 *     summary: Obtiene todos los tipos de moneda
 *     tags: [Tipos de Moneda]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de moneda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   descripcion:
 *                     type: string
 *                   ultimaTasaCambiaria:
 *                     type: number
 *                   estado_Id:
 *                     type: integer
 */
router.get('/', async (req, res) => {
    try {
        let currencyTypes = await TiposMoneda.findAll({
            //where: {} 
        });
        currencyTypes = JSON.parse(JSON.stringify(currencyTypes));

        return res.status(200).json(currencyTypes);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await TiposMoneda.findOne({
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
 * /api/admin/tiposMoneda:
 *   post:
 *     summary: Crea un nuevo tipo de moneda
 *     tags: [Tipos de Moneda]
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
 *               - ultimaTasaCambiaria
 *               - estado_Id
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 50
 *               ultimaTasaCambiaria:
 *                 type: number
 *                 format: decimal
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tipo de moneda creado exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { descripcion, ultimaTasaCambiaria, estado_Id } = req.body;

        if (!descripcion || !ultimaTasaCambiaria || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        const data = await TiposMoneda.create({ descripcion, ultimaTasaCambiaria, estado_Id });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        await TiposMoneda.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const currencyType = await TiposMoneda.findOne({ where: { id: req.params.id } });

        if (!currencyType) return res.status(200).json([{ error: 'id not found' }]);

        currencyType.estado_Id = currencyType.estado_Id === 1 ? 2 : 1;
        await currencyType.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;