module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ApiKeys', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Nombre descriptivo de la API Key'
        },
        keyHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Hash de la API Key'
        },
        keyPrefix: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Prefijo visible de la key (ej: ak_live_)'
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Descripción del propósito de esta API Key'
        },
        sistemaOrigen: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Sistema o aplicación que usará esta key'
        },
        permisos: {
            type: DataTypes.TEXT, // Cambiado de JSON a TEXT para SQL Server
            allowNull: false,
            defaultValue: '[]',
            comment: 'Array de permisos específicos en formato JSON string'
        },
        ipPermitidas: {
            type: DataTypes.TEXT, // Cambiado de JSON a TEXT para SQL Server
            allowNull: true,
            comment: 'Array de IPs permitidas en formato JSON string (null = todas)'
        },
        limitePorMinuto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            comment: 'Límite de requests por minuto'
        },
        ultimoUso: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp del último uso'
        },
        fechaVencimiento: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha de vencimiento (null = sin vencimiento)'
        },
        usosCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Contador de usos totales'
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1=Activa, 2=Inactiva, 3=Suspendida'
        },
        creadoPor_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Usuario que creó la API Key'
        }
    }, {
        tableName: 'ApiKeys',
        timestamps: true,
        indexes: [
            {
                fields: ['keyHash']
            },
            {
                fields: ['estado_Id']
            },
            {
                fields: ['fechaVencimiento']
            }
        ]
    });
};