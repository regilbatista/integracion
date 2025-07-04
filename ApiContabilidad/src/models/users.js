module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Usuarios', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        usuario: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        rol_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'Usuarios',
        timestamps: false,
    });
};