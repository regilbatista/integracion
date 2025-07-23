module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ApiKeyLogs', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        apiKey_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ApiKeys',
                key: 'id'
            }
        },
        endpoint: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Endpoint consumido'
        },
        metodo: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: 'Método HTTP (GET, POST, etc.)'
        },
        ipOrigen: {
            type: DataTypes.STRING(45),
            allowNull: true,
            comment: 'IP que hizo la petición'
        },
        userAgent: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        statusCode: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Código de respuesta HTTP'
        },
        tiempoRespuesta: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Tiempo de respuesta en ms'
        },
        parametrosEnviados: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON con parámetros de la petición'
        },
        respuestaSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Tamaño de la respuesta en bytes'
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mensaje de error si aplica'
        },
        fechaHora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'ApiKeyLogs',
        timestamps: false,
        indexes: [
            {
                fields: ['apiKey_Id']
            },
            {
                fields: ['fechaHora']
            },
            {
                fields: ['statusCode']
            },
            {
                fields: ['endpoint']
            }
        ]
    });
};