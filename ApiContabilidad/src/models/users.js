module.exports = (sequelize, type) => {
    return sequelize.define('Usuarios', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user: {
            type: type.STRING(50),
            allowNull: false,
            unique: true,
        },
        estado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
    })
};
