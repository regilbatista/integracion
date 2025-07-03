module.exports = (sequelize, type) => {
    return sequelize.define('Modelos', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        marca_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        descripcion: {
            type: type.STRING(100),
            allowNull: false,
        },
        estado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
    })
};
