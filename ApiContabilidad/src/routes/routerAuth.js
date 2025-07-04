
const router = require('express').Router();
const UsersAuth = require('../controllers/userAuth');

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Endpoints para autenticación de usuarios
 */

// Authentication routes (no token required)
router.use('/', UsersAuth);

module.exports = router;