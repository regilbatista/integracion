module.exports = (sequelize, type) => {
    return sequelize.define('Roles', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: type.STRING(100),
            allowNull: false,
            unique: true,
        },
        descripcion: {
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
