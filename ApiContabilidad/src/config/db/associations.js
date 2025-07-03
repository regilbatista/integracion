module.exports = Associations = (Models) => {
  const {
    Estados,
    Marcas,
    Modelos,
    Roles,
    TiposCombustibles,
    TiposVehiculos,
    Users,
    Vehiculos,
    Authorization,
    Clientes,
    Empleados,
    Inspeccion,
    RentaDevolucion,
  } = Models;

  /* Relaciones entre Usuarios y Authorization */
  Authorization.belongsTo(Users, { foreignKey: "user_Id" });
  Users.hasMany(Authorization, { foreignKey: "id" });

  /* Relaciones entre Usuarios y Estados */
  Users.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Users, { foreignKey: "estado_Id" });

  /* Relaciones entre Usuarios y Empleados */
  Users.belongsTo(Empleados, { foreignKey: "id" });
  Empleados.hasOne(Users, { foreignKey: "user_Id" });

  /* Relaciones entre Estados y Clientes */
  Clientes.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Clientes, { foreignKey: "estado_Id" });

  /* Relaciones entre Estados y Vehículos */
  Vehiculos.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Vehiculos, { foreignKey: "estado_Id" });

  /* Relaciones entre Roles y Usuarios */
  Users.belongsTo(Roles, { foreignKey: "rol_Id" });
  Roles.hasMany(Users, { foreignKey: "rol_Id" });

    /* Relaciones entre marca y Modelos */
    Modelos.belongsTo(Marcas, { foreignKey: "marca_Id" });
    Marcas.hasMany(Modelos, { foreignKey: "marca_Id" });

  /* Relaciones entre Vehículos y Tipos de Vehículos */
  Vehiculos.belongsTo(TiposVehiculos, { foreignKey: "tipoVehiculo_Id" });
  TiposVehiculos.hasMany(Vehiculos, { foreignKey: "tipoVehiculo_Id" });

  /* Relaciones entre Vehículos y Marcas */
  Vehiculos.belongsTo(Marcas, { foreignKey: "marca_Id" });
  Marcas.hasMany(Vehiculos, { foreignKey: "marca_Id" });

  /* Relaciones entre Vehículos y Modelos */
  Vehiculos.belongsTo(Modelos, { foreignKey: "modelo_Id" });
  Modelos.hasMany(Vehiculos, { foreignKey: "modelo_Id" });

  /* Relaciones entre Vehículos y Tipos de Combustible */
  Vehiculos.belongsTo(TiposCombustibles, { foreignKey: "tipoCombustible_Id" });
  TiposCombustibles.hasMany(Vehiculos, { foreignKey: "tipoCombustible_Id" });

  /* Relaciones entre Empleados y Estados */
  Empleados.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Empleados, { foreignKey: "estado_Id" });

  /* Relaciones entre Inspección y Vehículos */
  Inspeccion.belongsTo(Vehiculos, { foreignKey: "vehiculo_Id" });
  Vehiculos.hasMany(Inspeccion, { foreignKey: "vehiculo_Id" });

  /* Relaciones entre Inspección y Clientes */
  Inspeccion.belongsTo(Clientes, { foreignKey: "cliente_Id" });
  Clientes.hasMany(Inspeccion, { foreignKey: "cliente_Id" });

  /* Relaciones entre Inspección y Empleados */
  Inspeccion.belongsTo(Empleados, { foreignKey: "empleado_Id" });
  Empleados.hasMany(Inspeccion, { foreignKey: "empleado_Id" });

  /* Relaciones entre Inspección y Estados */
  Inspeccion.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Inspeccion, { foreignKey: "estado_Id" });

  RentaDevolucion.hasOne(Inspeccion, { foreignKey: "rentaDevolucion_Id" });
  Inspeccion.belongsTo(RentaDevolucion, { foreignKey: "rentaDevolucion_Id" });

  /* Relaciones entre Renta y Devolución con Empleados */
  RentaDevolucion.belongsTo(Empleados, { foreignKey: "empleado_Id" });
  Empleados.hasMany(RentaDevolucion, { foreignKey: "empleado_Id" });

  /* Relaciones entre Renta y Devolución con Vehículos */
  RentaDevolucion.belongsTo(Vehiculos, { foreignKey: "vehiculo_Id" });
  Vehiculos.hasMany(RentaDevolucion, { foreignKey: "vehiculo_Id" });

  /* Relaciones entre Renta y Devolución con Clientes */
  RentaDevolucion.belongsTo(Clientes, { foreignKey: "cliente_Id" });
  Clientes.hasMany(RentaDevolucion, { foreignKey: "cliente_Id" });

  /* Relaciones entre Renta y Devolución con Estados */
  RentaDevolucion.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(RentaDevolucion, { foreignKey: "estado_Id" });
};