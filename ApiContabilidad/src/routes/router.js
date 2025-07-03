const router = require('express').Router();
const { verifyAuthorization } = require('../middlewares/verify');

// Import files

const clientes = require('../controllers/clientes');
const rentaDevolucion = require('../controllers/rentaDevolucion');
const inspection = require('../controllers/inspeccion');


// Use routes
router.use('/clientes/',  clientes);
router.use('/rentadevolucion/',  rentaDevolucion);
router.use('/inspeccion/',  inspection);



module.exports = router;
