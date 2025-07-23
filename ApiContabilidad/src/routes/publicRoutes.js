const router = require('express').Router();
const { verifyApiKey } = require('../middlewares/apiKeyAuth');
const { CatalogoCuentasContables, EntradasContables, TiposCuenta, Auxiliares } = require('../config/db/database');
const { Op, Sequelize } = require('sequelize');

// Aplicar middleware de API Key a todas las rutas públicas
console.log('Applying API Key verification middleware to public routes');
router.use(verifyApiKey);

/**
 * @swagger
 * /api/public/catalogo-cuentas:
 *   get:
 *     summary: Obtiene catálogo de cuentas (API Key required)
 *     tags: [Public API]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas contables
 *       401:
 *         description: API Key inválida o faltante
 */
router.get('/catalogo-cuentas', async (req, res) => {
    try {
        const accounts = await CatalogoCuentasContables.findAll({
            where: { estado_Id: 1 },
            include: [{
                model: TiposCuenta,
                attributes: ['descripcion', 'origen']
            }]
        });

        return res.status(200).json({
            success: true,
            data: accounts,
            meta: {
                total: accounts.length,
                apiKey: req.apiKey.nombre,
                sistemaOrigen: req.apiKey.sistemaOrigen
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/public/entradas-contables:
 *   get:
 *     summary: Obtiene entradas contables (API Key required)
 *     tags: [Public API]
 */
router.get('/entradas-contables', async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cuenta_Id } = req.query;
        
        let whereClause = { estado_Id: 1 };
        
        if (fechaInicio && fechaFin) {
            whereClause.fechaAsiento = {
                [Op.between]: [fechaInicio, fechaFin]
            };
        }
        
        if (cuenta_Id) {
            whereClause.cuenta_Id = cuenta_Id;
        }

        const entries = await EntradasContables.findAll({
            where: whereClause,
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
            order: [['fechaAsiento', 'DESC']],
            limit: 1000 // Límite para proteger rendimiento
        });

        return res.status(200).json({
            success: true,
            data: entries,
            meta: {
                total: entries.length,
                filtros: { fechaInicio, fechaFin, cuenta_Id },
                apiKey: req.apiKey.nombre
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/public/entradas-contables:
 *   post:
 *     summary: Crea una nueva entrada contable (API Key required)
 *     tags: [Public API]
 */
router.post('/entradas-contables', async (req, res) => {
    try {
        const { descripcion, cuenta_Id, auxiliar_Id, tipoMovimiento, fechaAsiento, montoAsiento } = req.body;

        if (!descripcion || !cuenta_Id || !tipoMovimiento || !fechaAsiento || !montoAsiento) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['descripcion', 'cuenta_Id', 'tipoMovimiento', 'fechaAsiento', 'montoAsiento']
            });
        }

        // Verificar que la cuenta existe y permite transacciones
        const account = await CatalogoCuentasContables.findOne({ 
            where: { id: cuenta_Id, estado_Id: 1 } 
        });
        
        if (!account) {
            return res.status(400).json({
                success: false,
                error: 'Account not found or inactive'
            });
        }

        if (!account.permiteTransacciones) {
            return res.status(400).json({
                success: false,
                error: 'Account does not allow transactions'
            });
        }

        const entry = await EntradasContables.create({
            descripcion,
            cuenta_Id,
            auxiliar_Id,
            tipoMovimiento,
            fechaAsiento,
            montoAsiento,
            estado_Id: 1
        });

        // Actualizar balance de la cuenta
        const balanceChange = tipoMovimiento === 'DB' ? montoAsiento : -montoAsiento;
        await CatalogoCuentasContables.update(
            { balance: Sequelize.literal(`balance + ${balanceChange}`) },
            { where: { id: cuenta_Id } }
        );

        return res.status(201).json({
            success: true,
            data: { id: entry.id },
            message: 'Accounting entry created successfully',
            meta: {
                apiKey: req.apiKey.nombre,
                sistemaOrigen: req.apiKey.sistemaOrigen
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @swagger
 * /api/public/balances:
 *   get:
 *     summary: Obtiene balances de cuentas (API Key required)
 *     tags: [Public API]
 */
router.get('/balances', async (req, res) => {
    try {
        const accounts = await CatalogoCuentasContables.findAll({
            where: { 
                estado_Id: 1,
                permiteTransacciones: true 
            },
            attributes: ['id', 'descripcion', 'balance'],
            include: [{
                model: TiposCuenta,
                attributes: ['descripcion', 'origen']
            }],
            order: [['descripcion', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: accounts,
            meta: {
                total: accounts.length,
                apiKey: req.apiKey.nombre
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
