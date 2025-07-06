const router = require('express').Router();
const { TiposCuenta, CatalogoCuentasContables } = require('../config/db/database');

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
 *         description: ID del tipo de cuenta
 *     responses:
 *       200:
 *         description: Tipo de cuenta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoCuenta'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

        // Validar que el origen sea DB o CR
        if (!['DB', 'CR'].includes(origen)) {
            return res.status(400).json([{ error: 'Origin must be DB or CR' }]);
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
 *         description: ID del tipo de cuenta a actualizar
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
 *                 description: Nueva descripción del tipo de cuenta
 *               origen:
 *                 type: string
 *                 enum: [DB, CR]
 *                 description: Nuevo origen (Débito o Crédito)
 *               estado_Id:
 *                 type: integer
 *                 description: Nuevo estado
 *     responses:
 *       200:
 *         description: Tipo de cuenta actualizado exitosamente
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
        // Validar origen si se está actualizando
        if (req.body.origen && !['DB', 'CR'].includes(req.body.origen)) {
            return res.status(400).json([{ error: 'Origin must be DB or CR' }]);
        }

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
 *     summary: Realiza borrado lógico de un tipo de cuenta (cambia estado activo/inactivo)
 *     tags: [Tipos de Cuenta]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de cuenta
 *     responses:
 *       200:
 *         description: Estado del tipo de cuenta cambiado exitosamente
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
        console.log('Attempting to delete account type with ID:', req.params.id);
        
        const accountType = await TiposCuenta.findOne({ where: { id: req.params.id } });

        if (!accountType) {
            console.log('Account type not found');
            return res.status(200).json([{ error: 'id not found' }]);
        }

        console.log('Current account type state:', accountType.estado_Id);

        // Verificar si tiene cuentas contables asociadas activas antes de desactivar
        if (accountType.estado_Id === 1) {
            const hasActiveAccounts = await CatalogoCuentasContables.findOne({ 
                where: { tipoCuenta_Id: req.params.id, estado_Id: 1 } 
            });

            if (hasActiveAccounts) {
                console.log('Cannot deactivate: has active accounts');
                return res.status(400).json([{ error: 'Cannot deactivate: account type has active accounts associated' }]);
            }
        }

        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        accountType.estado_Id = accountType.estado_Id === 1 ? 2 : 1;
        await accountType.save();

        const action = accountType.estado_Id === 1 ? 'activated' : 'deactivated';
        console.log('Account type', action, 'successfully');
        
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: accountType.estado_Id 
        }]);
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;