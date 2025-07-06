const router = require('express').Router();
const { verifyAuthorization } = require('../middlewares/verify');
const { createWebServiceLogger } = require('../middlewares/webServiceLogger');
/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Gestión de usuarios del sistema
 *   - name: Tipos de Cuenta
 *     description: Gestión de tipos de cuenta contable
 *   - name: Tipos de Moneda
 *     description: Gestión de tipos de moneda
 *   - name: Catálogo de Cuentas
 *     description: Gestión del catálogo de cuentas contables
 *   - name: Auxiliares
 *     description: Gestión de auxiliares contables
 *   - name: Entradas Contables
 *     description: Gestión de asientos contables
 *   - name: Web Services
 *     description: Gestión de servicios web
 *   - name: Logs Web Services
 *     description: Auditoría de servicios web
 */

const webServiceLogger = createWebServiceLogger();
router.use(webServiceLogger);

// Import new accounting controllers
const tiposCuenta = require('../controllers/tiposCuenta');
const tiposMoneda = require('../controllers/tiposMoneda');
const catalogoCuentasContables = require('../controllers/catalogoCuentasContables');
const auxiliares = require('../controllers/auxiliares');
const entradasContables = require('../controllers/entradasContables');
const webServices = require('../controllers/webServices');
const logsWebServices = require('../controllers/logsWebServices');
const users = require('../controllers/users');

// ===============================================
// ACCOUNTING SYSTEM ROUTES
// ===============================================

// Basic accounting configuration
router.use('/tiposCuenta/', tiposCuenta);
router.use('/tiposMoneda/', tiposMoneda);
router.use('/auxiliares/', auxiliares);

// Chart of accounts management
router.use('/catalogoCuentas/', catalogoCuentasContables);

// Accounting entries and transactions
router.use('/entradasContables/', entradasContables);

// Web services and audit logs
router.use('/webServices/', webServices);
router.use('/logsWebServices/', logsWebServices);

// User management
router.use('/users/', users);

module.exports = router;