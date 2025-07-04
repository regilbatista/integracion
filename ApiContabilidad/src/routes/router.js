const router = require('express').Router();
const { verifyAuthorization } = require('../middlewares/verify');

/**
 * @swagger
 * tags:
 *   - name: Consultas Contables
 *     description: Consultas del sistema contable para usuarios
 */

// Import accounting controllers for user access (read-only)
const catalogoCuentasContables = require('../controllers/catalogoCuentasContables');
const auxiliares = require('../controllers/auxiliares');
const entradasContables = require('../controllers/entradasContables');

// Accounting routes (read-only access for regular users)
router.use('/catalogoCuentas/', catalogoCuentasContables);
router.use('/auxiliares/', auxiliares);
router.use('/entradasContables/', entradasContables);

module.exports = router;