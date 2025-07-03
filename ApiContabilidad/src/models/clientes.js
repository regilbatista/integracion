// Modelo de Clientes
module.exports = (sequelize, type) => {
    return sequelize.define('Clientes', {
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
           type: type.STRING(20),
           allowNull: false,
           unique: true,
       },
       NoTarjetaCR: {
           type: type.STRING(50),
           allowNull: false,
       },
       limiteCredito: {
           type: type.DECIMAL(18, 2),
           allowNull: false,
       },
       tipoPersona: {
        type: type.ENUM('Física', 'Jurídica'),
        allowNull: false,
      },
       estado_Id: {
           type: type.INTEGER,
           allowNull: false,
       },
    //    UsuarioID: {
    //        type: type.INTEGER,
    //        allowNull: true,
    //    },
   }, {
       tableName: 'Clientes',
       timestamps: false,
   });


};