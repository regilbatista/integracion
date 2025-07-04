const router = require('express').Router();
const { EntradasContables, CatalogoCuentasContables, Auxiliares, TiposCuenta } = require('../config/db/database');
const { Op, Sequelize } = require('sequelize');

/**
 * @swagger
 * /api/admin/entradasContables:
 *   get:
 *     summary: Obtiene todas las entradas contables
 *     tags: [Entradas Contables]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de entradas contables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EntradaContable'
 */
router.get('/', async (req, res) => {
    try {
        let entries = await EntradasContables.findAll({
            include: [
                {
                    model: CatalogoCuentasContables,
                    attributes: ['descripcion', 'balance']
                },
                {
                    model: Auxiliares,
                    attributes: ['nombre']
                }
            ],
            order: [['fechaAsiento', 'DESC']]
        });
        entries = JSON.parse(JSON.stringify(entries));

        return res.status(200).json(entries);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/entradasContables/balances:
 *   get:
 *     summary: Obtiene el balance de todas las cuentas
 *     tags: [Entradas Contables]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Balances por cuenta
 */
router.get('/balances', async (req, res) => {
    try {
        const balances = await EntradasContables.findAll({
            attributes: [
                'cuenta_Id',
                [Sequelize.fn('SUM', 
                    Sequelize.literal('CASE WHEN tipoMovimiento = "DB" THEN montoAsiento ELSE -montoAsiento END')
                ), 'balance_total']
            ],
            include: [
                {
                    model: CatalogoCuentasContables,
                    attributes: ['descripcion']
                }
            ],
            group: ['cuenta_Id'],
            raw: false
        });

        return res.status(200).json(balances);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/entradasContables/periodo:
 *   get:
 *     summary: Obtiene entradas contables por período
 *     tags: [Entradas Contables]
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
 *         description: Entradas contables del período
 */
router.get('/periodo', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json([{ error: 'Start date and end date are required' }]);
        }

        const entries = await EntradasContables.findAll({
            where: {
                fechaAsiento: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            include: [
                {
                    model: CatalogoCuentasContables,
                    attributes: ['descripcion']
                },
                {
                    model: Auxiliares,
                    attributes: ['nombre']
                }
            ],
            order: [['fechaAsiento', 'ASC']]
        });

        return res.status(200).json(entries);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await EntradasContables.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: CatalogoCuentasContables,
                    attributes: ['descripcion', 'balance']
                },
                {
                    model: Auxiliares,
                    attributes: ['nombre']
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
 * /api/admin/entradasContables:
 *   post:
 *     summary: Crea una nueva entrada contable
 *     tags: [Entradas Contables]
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
 *               - cuenta_Id
 *               - tipoMovimiento
 *               - fechaAsiento
 *               - montoAsiento
 *               - estado_Id
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *               auxiliar_Id:
 *                 type: integer
 *               cuenta_Id:
 *                 type: integer
 *               tipoMovimiento:
 *                 type: string
 *                 enum: [DB, CR]
 *               fechaAsiento:
 *                 type: string
 *                 format: date
 *               montoAsiento:
 *                 type: number
 *                 format: decimal
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Entrada contable creada exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { descripcion, auxiliar_Id, cuenta_Id, tipoMovimiento, fechaAsiento, montoAsiento, estado_Id } = req.body;

        if (!descripcion || !cuenta_Id || !tipoMovimiento || !fechaAsiento || !montoAsiento || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        // Verificar que la cuenta permita transacciones
        const account = await CatalogoCuentasContables.findOne({ where: { id: cuenta_Id } });
        if (!account) {
            return res.status(400).json([{ error: 'Account not found' }]);
        }

        if (!account.permiteTransacciones) {
            return res.status(400).json([{ error: 'Account does not allow transactions' }]);
        }

        // Crear la entrada contable
        const data = await EntradasContables.create({ 
            descripcion, 
            auxiliar_Id, 
            cuenta_Id, 
            tipoMovimiento, 
            fechaAsiento, 
            montoAsiento, 
            estado_Id 
        });

        // Actualizar balance de la cuenta
        const balanceChange = tipoMovimiento === 'DB' ? montoAsiento : -montoAsiento;
        await CatalogoCuentasContables.update(
            { balance: Sequelize.literal(`balance + ${balanceChange}`) },
            { where: { id: cuenta_Id } }
        );

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        // Obtener la entrada original para revertir el balance
        const originalEntry = await EntradasContables.findOne({ where: { id: req.params.id } });
        if (!originalEntry) {
            return res.status(404).json([{ error: 'Entry not found' }]);
        }

        // Revertir el balance original
        const originalBalanceChange = originalEntry.tipoMovimiento === 'DB' ? -originalEntry.montoAsiento : originalEntry.montoAsiento;
        await CatalogoCuentasContables.update(
            { balance: Sequelize.literal(`balance + ${originalBalanceChange}`) },
            { where: { id: originalEntry.cuenta_Id } }
        );

        // Actualizar la entrada
        await EntradasContables.update(req.body, { where: { id: req.params.id } });

        // Aplicar el nuevo balance si se modificaron campos relevantes
        if (req.body.montoAsiento || req.body.tipoMovimiento || req.body.cuenta_Id) {
            const updatedEntry = await EntradasContables.findOne({ where: { id: req.params.id } });
            const newBalanceChange = updatedEntry.tipoMovimiento === 'DB' ? updatedEntry.montoAsiento : -updatedEntry.montoAsiento;
            await CatalogoCuentasContables.update(
                { balance: Sequelize.literal(`balance + ${newBalanceChange}`) },
                { where: { id: updatedEntry.cuenta_Id } }
            );
        }

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const entry = await EntradasContables.findOne({ where: { id: req.params.id } });

        if (!entry) return res.status(200).json([{ error: 'id not found' }]);

        // Si se está desactivando la entrada, revertir el balance
        if (entry.estado_Id === 1) {
            const balanceReversion = entry.tipoMovimiento === 'DB' ? -entry.montoAsiento : entry.montoAsiento;
            await CatalogoCuentasContables.update(
                { balance: Sequelize.literal(`balance + ${balanceReversion}`) },
                { where: { id: entry.cuenta_Id } }
            );
        } 
        // Si se está reactivando la entrada, aplicar el balance
        else {
            const balanceChange = entry.tipoMovimiento === 'DB' ? entry.montoAsiento : -entry.montoAsiento;
            await CatalogoCuentasContables.update(
                { balance: Sequelize.literal(`balance + ${balanceChange}`) },
                { where: { id: entry.cuenta_Id } }
            );
        }

        entry.estado_Id = entry.estado_Id === 1 ? 2 : 1;
        await entry.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;