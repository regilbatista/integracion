module.exports = (sequelize, type) => {
    return sequelize.define('Vehiculos', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        descripcion: {
            type: type.STRING(100),
            allowNull: false,
        },
        NoChasis: {
            type: type.STRING(50),
            allowNull: false,
            unique: true,
        },
        NoMotor: {
            type: type.STRING(50),
            allowNull: false,
            unique: true,
        },
        NoPlaca: {
            type: type.STRING(50),
            allowNull: false,
            unique: true,
        }, 
        tipoVehiculo_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        marca_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        modelo_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        tipoCombustible_Id: {
            type: type.INTEGER,
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
