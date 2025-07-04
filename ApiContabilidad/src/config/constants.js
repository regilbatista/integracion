
const db = {
    dBName: process.env.DBNAME || 'contabilidad_api',
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    pass: process.env.DBPASS,
};

const tk ={
    redirectURLout: 'http://localhost:3000/auth',
};


const secret = 'miFraseSuperSecretaApiContabilidad';

module.exports = { secret, db, tk};
