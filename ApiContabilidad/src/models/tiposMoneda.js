module.exports = (sequelize, DataTypes) => {
    return sequelize.define('TiposMoneda', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        ultimaTasaCambiaria: {
            type: DataTypes.DECIMAL(18, 6),
            allowNull: false,
        },
        estado_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        tableName: 'TiposMoneda',
        timestamps: false,
    });
};