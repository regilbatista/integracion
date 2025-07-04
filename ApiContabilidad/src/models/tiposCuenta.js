module.exports = (sequelize, DataTypes) => {
    return sequelize.define('TiposCuenta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        origen: {
            type: DataTypes.ENUM('DB', 'CR'),
            allowNull: false,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'TiposCuenta',
        timestamps: false,
    });
};