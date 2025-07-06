module.exports = (sequelize, DataTypes) => {
    return sequelize.define('LogsWebServices', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        webService_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'WebServices',
                key: 'id'
            }
        },
        usuario_Id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Cambiar a true para permitir servicios sin autenticación
        },
        fechaHora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        parametrosEnviados: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        respuesta: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Campos opcionales adicionales (puedes agregarlos gradualmente)
        statusCode: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: 'LogsWebServices',
        timestamps: false,
        indexes: [
            {
                fields: ['webService_Id']
            },
            {
                fields: ['usuario_Id']
            },
            {
                fields: ['fechaHora']
            }
        ]
    });
};