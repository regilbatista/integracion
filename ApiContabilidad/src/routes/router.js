const router = require('express').Router();
const { verifyAuthorization } = require('../middlewares/verify');
const { createWebServiceLogger } = require('../middlewares/webServiceLogger');

/**
 * @swagger
 * tags:
 *   - name: Consultas Contables
 *     description: Consultas del sistema contable para usuarios
 */

// APLICAR EL MIDDLEWARE DE LOGGING AQUÍ (DESPUÉS DE VERIFICAR TOKEN PERO ANTES DE LAS RUTAS)
const webServiceLogger = createWebServiceLogger();
router.use(webServiceLogger);

// Import accounting controllers for user access (read-only)
const catalogoCuentasContables = require('../controllers/catalogoCuentasContables');
const entradasContables = require('../controllers/entradasContables');

// Accounting routes (read-only access for regular users)
router.use('/catalogoCuentas/', catalogoCuentasContables);
router.use('/entradasContables/', entradasContables);

module.exports = router;