const router = require('express').Router();
const { CatalogoCuentasContables, TiposCuenta } = require('../config/db/database');

/**
 * @swagger
 * /api/admin/catalogoCuentas:
 *   get:
 *     summary: Obtiene todas las cuentas contables
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas contables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CuentaContable'
 */
router.get('/', async (req, res) => {
    try {
        let accounts = await CatalogoCuentasContables.findAll({
            include: [
                {
                    model: TiposCuenta,
                    attributes: ['descripcion', 'origen']
                },
                {
                    model: CatalogoCuentasContables,
                    as: 'CuentaMayor',
                    attributes: ['descripcion']
                }
            ]
        });
        accounts = JSON.parse(JSON.stringify(accounts));

        return res.status(200).json(accounts);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/catalogoCuentas/jerarquia:
 *   get:
 *     summary: Obtiene las cuentas con su jerarquía completa
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cuentas organizadas jerárquicamente
 */
router.get('/jerarquia', async (req, res) => {
    try {
        // Obtener cuentas principales (nivel 1)
        const mainAccounts = await CatalogoCuentasContables.findAll({
            where: { nivel: 1 },
            include: [
                {
                    model: TiposCuenta,
                    attributes: ['descripcion', 'origen']
                },
                {
                    model: CatalogoCuentasContables,
                    as: 'SubCuentas',
                    include: [
                        {
                            model: CatalogoCuentasContables,
                            as: 'SubCuentas'
                        }
                    ]
                }
            ]
        });

        return res.status(200).json(mainAccounts);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/catalogoCuentas/transacciones:
 *   get:
 *     summary: Obtiene solo las cuentas que permiten transacciones
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cuentas que permiten transacciones
 */
router.get('/transacciones', async (req, res) => {
    try {
        const transactionAccounts = await CatalogoCuentasContables.findAll({
            where: { permiteTransacciones: true },
            include: [
                {
                    model: TiposCuenta,
                    attributes: ['descripcion', 'origen']
                }
            ]
        });

        return res.status(200).json(transactionAccounts);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/catalogoCuentas/{id}:
 *   get:
 *     summary: Obtiene una cuenta contable por ID
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta contable
 *     responses:
 *       200:
 *         description: Cuenta contable encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CuentaContable'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await CatalogoCuentasContables.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: TiposCuenta,
                    attributes: ['descripcion', 'origen']
                },
                {
                    model: CatalogoCuentasContables,
                    as: 'CuentaMayor',
                    attributes: ['descripcion']
                },
                {
                    model: CatalogoCuentasContables,
                    as: 'SubCuentas'
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
 * /api/admin/catalogoCuentas:
 *   post:
 *     summary: Crea una nueva cuenta contable
 *     tags: [Catálogo de Cuentas]
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
 *               - tipoCuenta_Id
 *               - permiteTransacciones
 *               - nivel
 *               - estado_Id
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 100
 *               tipoCuenta_Id:
 *                 type: integer
 *               permiteTransacciones:
 *                 type: boolean
 *               nivel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               cuentaMayor_Id:
 *                 type: integer
 *               balance:
 *                 type: number
 *                 format: decimal
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cuenta contable creada exitosamente
 */
router.post('/', async (req, res) => {
    try {
        const { descripcion, tipoCuenta_Id, permiteTransacciones, nivel, cuentaMayor_Id, balance, estado_Id } = req.body;

        if (!descripcion || !tipoCuenta_Id || permiteTransacciones === undefined || !nivel || !estado_Id) {
            return res.status(400).json([{ error: 'Missing required fields' }]);
        }

        // Validar que el nivel esté entre 1 y 3
        if (nivel < 1 || nivel > 3) {
            return res.status(400).json([{ error: 'Level must be between 1 and 3' }]);
        }

        // Si es nivel 2 o 3, debe tener cuenta mayor
        if (nivel > 1 && !cuentaMayor_Id) {
            return res.status(400).json([{ error: 'Parent account required for level 2 and 3' }]);
        }

        const data = await CatalogoCuentasContables.create({ 
            descripcion, 
            tipoCuenta_Id, 
            permiteTransacciones, 
            nivel, 
            cuentaMayor_Id, 
            balance: balance || 0,
            estado_Id 
        });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/catalogoCuentas/{id}:
 *   patch:
 *     summary: Actualiza una cuenta contable
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta contable a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nueva descripción de la cuenta
 *               tipoCuenta_Id:
 *                 type: integer
 *                 description: Nuevo tipo de cuenta
 *               permiteTransacciones:
 *                 type: boolean
 *                 description: Si permite transacciones
 *               nivel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 description: Nuevo nivel jerárquico
 *               cuentaMayor_Id:
 *                 type: integer
 *                 description: Nueva cuenta padre
 *               balance:
 *                 type: number
 *                 format: decimal
 *                 description: Nuevo balance
 *               estado_Id:
 *                 type: integer
 *                 description: Nuevo estado
 *     responses:
 *       200:
 *         description: Cuenta contable actualizada exitosamente
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
        // Validaciones adicionales si se actualiza el nivel
        if (req.body.nivel) {
            if (req.body.nivel < 1 || req.body.nivel > 3) {
                return res.status(400).json([{ error: 'Level must be between 1 and 3' }]);
            }

            // Si cambia a nivel 2 o 3, debe tener cuenta mayor
            if (req.body.nivel > 1 && !req.body.cuentaMayor_Id) {
                const currentAccount = await CatalogoCuentasContables.findOne({ where: { id: req.params.id } });
                if (!currentAccount || !currentAccount.cuentaMayor_Id) {
                    return res.status(400).json([{ error: 'Parent account required for level 2 and 3' }]);
                }
            }
        }

        await CatalogoCuentasContables.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/catalogoCuentas/{id}:
 *   delete:
 *     summary: Realiza borrado lógico de una cuenta contable (cambia estado activo/inactivo)
 *     tags: [Catálogo de Cuentas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta contable
 *     responses:
 *       200:
 *         description: Estado de la cuenta contable cambiado exitosamente
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
        //console.log('Attempting to delete account with ID:', req.params.id);
        
        const account = await CatalogoCuentasContables.findOne({ where: { id: req.params.id } });

        if (!account) {
            console.log('Account not found');
            return res.status(200).json([{ error: 'id not found' }]);
        }

        //console.log('Current account state:', account.estado_Id);

        // Verificar si tiene subcuentas activas antes de desactivar
        if (account.estado_Id === 1) {
            const activeSubAccounts = await CatalogoCuentasContables.findAll({ 
                where: { cuentaMayor_Id: req.params.id, estado_Id: 1 } 
            });

            if (activeSubAccounts.length > 0) {
                console.log('Cannot deactivate: has active sub-accounts', activeSubAccounts.length);
                return res.status(400).json([{ 
                    error: 'Cannot deactivate: account has active sub-accounts',
                    activeSubAccountsCount: activeSubAccounts.length,
                    suggestion: 'Please deactivate the sub-accounts first'
                }]);
            }
        }


        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        const previousState = account.estado_Id;
        account.estado_Id = account.estado_Id === 1 ? 2 : 1;
        await account.save();

        const action = account.estado_Id === 1 ? 'activated' : 'deactivated';
        console.log('Account', action, 'successfully');
        
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: account.estado_Id,
            previousState: previousState
        }]);
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;