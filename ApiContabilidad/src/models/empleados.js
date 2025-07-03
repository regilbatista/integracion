// Modelo de Empleados
module.exports = (sequelize, type) => {
    return sequelize.define('Empleados', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: type.STRING(100),
            allowNull: false,
        },
        cedula: {
            type: type.STRING(13),
            allowNull: false,
            unique: true,
        },
        tandaLabor: {
            type: type.ENUM('Matutina', 'Vespertina', 'Nocturna'),
            allowNull: false,
          },
        porcientoComision: {
            type: type.DECIMAL(6, 2),
            allowNull: false,
        },
        fechaIngreso: {
            type: type.DATEONLY,
            allowNull: false,
        },
        estado_Id: {
            type: type.INTEGER,
            allowNull: false,
        },
        user_Id: {
            type: type.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'Empleados',
        timestamps: false,
    });

};