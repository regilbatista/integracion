module.exports = (sequelize, type) => {
    return sequelize.define('Estados', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: type.STRING(100),
            allowNull: false,
        },
    }, {
        timestamps: false,
    })
};
