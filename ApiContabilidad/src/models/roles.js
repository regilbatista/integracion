module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Roles', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombreRol: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'Roles',
        timestamps: false,
    });
};