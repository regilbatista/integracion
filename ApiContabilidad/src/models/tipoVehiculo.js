module.exports = (sequelize, type) => {
    return sequelize.define('TiposVehiculos', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
