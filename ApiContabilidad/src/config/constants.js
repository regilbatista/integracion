const db = {
    dBName: process.env.DBNAME || 'contabilidad_api',
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    pass: process.env.DBPASS,
};

const tk = {
    redirectURLout: 'http://localhost:3000/auth',
};

// CORREGIDO: Cambiar la estructura del secret para que funcione con verify.js
const secret = {
    phrase: 'miFraseSuperSecretaApiContabilidad'
};

module.exports = { secret, db, tk };