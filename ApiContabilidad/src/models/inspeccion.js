module.exports = (sequelize, type) => {
    return sequelize.define('Inspeccion', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rentaDevolucion_Id: {
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
        tieneRalladuras: {
            type: type.BOOLEAN,
            allowNull: false,
        },
        cantidadCombustible: {
            type: type.ENUM('1/4', '1/2', '3/4', 'Lleno'),
            allowNull: false,
          },
        tieneGomaRespuesta: {
            type: type.BOOLEAN,
            allowNull: false,
        },
        tieneGato: {
            type: type.BOOLEAN,
            allowNull: false,
        },
        tieneRoturasCristal: {
            type: type.BOOLEAN,
            allowNull: false,
        },
        estado_gomas: {
            type: type.JSON, // Campo JSON para almacenar booleanos
            allowNull: false,
            defaultValue: {
              delantera_izq: true,
              delantera_der: true,
              trasera_izq: true,
              trasera_der: true,
            }
        },
        fecha: {
            type: type.DATEONLY,
            allowNull: false,
        },
        empleado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        estado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'Inspeccion',
        timestamps: false,
    });
};
