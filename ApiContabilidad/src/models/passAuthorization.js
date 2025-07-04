module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PassAuthorization', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        usuario_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        hash: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        newPass: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'PassAuthorization',
        timestamps: false,
    });
};