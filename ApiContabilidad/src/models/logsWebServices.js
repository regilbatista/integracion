module.exports = (sequelize, DataTypes) => {
    return sequelize.define('LogsWebServices', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        webService_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        usuario_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fechaHora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        parametrosEnviados: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        respuesta: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'LogsWebServices',
        timestamps: false,
    });
};