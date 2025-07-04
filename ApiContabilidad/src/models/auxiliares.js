module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Auxiliares', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'Auxiliares',
        timestamps: false,
    });
};