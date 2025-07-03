const router = require('express').Router();
const UsersAuth = require('../controllers/userAuth');


router.use('/', UsersAuth);


module.exports = router;
