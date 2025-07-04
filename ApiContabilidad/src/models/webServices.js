module.exports = (sequelize, DataTypes) => {
    return sequelize.define('WebServices', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'WebServices',
        timestamps: false,
    });
};