const Sequelize = require('sequelize'); // Corregido el typo

const constants = require('../constants');
const InitializeModels = require('./initialization');
const Associations = require('./associations');
const seedData = require('./seedData');

// Initialize Connection for SQL Server
const sequelize = new Sequelize(constants.db.dBName, constants.db.user, constants.db.pass, {
    host: constants.db.host,
    port: 1433, // Puerto por defecto de SQL Server
    dialect: 'mssql', // Cambiar de 'mysql' a 'mssql'
    dialectOptions: {
        options: {
            encrypt: false, // Para desarrollo local, cambiar a true en producción
            trustServerCertificate: true, // Para desarrollo local
            enableArithAbort: true,
            instanceName: '', // Si usas una instancia con nombre
        },
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false, // Show query logs
});

const Models = InitializeModels({ sequelize, Sequelize });

// Initialization of Model Associations
Associations(Models);

const DBNAME = 'db_api'; // Cambiado para coincidir con el docker-compose

// Sync tables to Database
const ALTER_DB = false;
const alterMSG = DBNAME + ' ' + (ALTER_DB ? 'Tables Sync!' : 'Tables Connected!');

// Test connection first
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to SQL Server has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to SQL Server:', error);
        return false;
    }
};

// Initialize database
const initializeDB = async () => {
    const connected = await testConnection();
    
    if (connected) {
        try {
            await sequelize.sync({
                force: false,
                alter: ALTER_DB,
            });
            
            await seedData({ Md: Models });
            console.log(alterMSG);
        } catch (error) {
            console.log('Cannot sync tables to ' + DBNAME + '...', error);
        }
    }
};

// Execute initialization
initializeDB();

module.exports = Models;