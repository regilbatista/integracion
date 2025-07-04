module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CatalogoCuentasContables', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        tipoCuenta_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        permiteTransacciones: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        nivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 3
            }
        },
        cuentaMayor_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        balance: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
            defaultValue: 0,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'CatalogoCuentasContables',
        timestamps: false,
    });
};