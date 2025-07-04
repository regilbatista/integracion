module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EntradasContables', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        auxiliar_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cuenta_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipoMovimiento: {
            type: DataTypes.ENUM('DB', 'CR'),
            allowNull: false,
        },
        fechaAsiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        montoAsiento: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'EntradasContables',
        timestamps: false,
    });
};