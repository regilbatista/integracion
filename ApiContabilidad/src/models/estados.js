module.exports = (sequelize, DataTypes) => { // CORREGIDO: usar DataTypes
    return sequelize.define('Estados', {
        id: {
            type: DataTypes.INTEGER, // CORREGIDO: usar DataTypes
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: DataTypes.STRING(100), // CORREGIDO: usar DataTypes
            allowNull: false,
        },
    }, {
        tableName: 'Estados',
        timestamps: false,
    })
};