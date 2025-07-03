// Modelo de RentaDevolucion
module.exports = (sequelize, type) => {
    return sequelize.define('RentaDevolucion', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        empleado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        vehiculo_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        cliente_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        FechaRenta: {
            type: type.DATEONLY,
            allowNull: false,
        },
        FechaDevolucion: {
            type: type.DATEONLY,
            allowNull: true,
        },
        MontoPorDia: {
            type: type.DECIMAL(18, 2),
            allowNull: false,
        },
        CantidadDias: {
            type: type.INTEGER,
            allowNull: false,
        },
        Comentario: {
            type: type.TEXT,
            allowNull: true,
        },
        estado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'RentaDevolucion',
        timestamps: false,
    });

};
