const router = require('express').Router();
const { verifyAuthorization } = require('../middlewares/verify');

// Import files

const users = require('../controllers/users');

const empleados = require('../controllers/empleados');
const marcas = require('../controllers/marcas');
const modelos = require('../controllers/modelos');
const tiposCombustible = require('../controllers/tiposCombustible');
const tiposVehiculos = require('../controllers/tiposVehiculos');
const vehiculos = require('../controllers/vehiculos');



// Use routes

router.use('/empleados/',  empleados);
router.use('/marcas/', marcas);
router.use('/modelos', modelos);
router.use('/tiposCombustible', tiposCombustible);
router.use('/tiposVehiculos', tiposVehiculos);
router.use('/vehiculos', vehiculos);
router.use('/users', users);


module.exports = router;
