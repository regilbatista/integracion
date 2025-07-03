const Sequalize = require('sequelize');

const constants = require('../constants');
const InitializeModels = require('./initialization');
const Associations = require('./associations');
const seedData = require('./seedData');

// Initilize Conection
const sequelize = new Sequalize(constants.db.dBName, constants.db.user, constants.db.pass, {
    host: constants.db.host,
    dialect: 'mysql',
    logging: false, // Show query logs
});

const Models = InitializeModels({ sequelize, Sequalize });

// Initialization of Model Associations
Associations(Models);

const DBNAME = 'apibd';

// Sync tables to Database
const ALTER_DB =  false;
const alterMSG = DBNAME + '' + (ALTER_DB ? ' Tables Sync!' : ' Tables Conected!');

sequelize
    .sync({
        force: false,
        alter: ALTER_DB,
    })
    .then(() => {
        seedData({ Md: Models });
        console.log(alterMSG);
    })
    .catch((error) => {
        console.log('Can not connect to ' + DBNAME + '...', error);
    });

module.exports = Models;