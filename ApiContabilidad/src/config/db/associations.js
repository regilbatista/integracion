module.exports = NewAssociations = (Models) => {
  const {
    Estados,
    Users,
    Auxiliares,
    CatalogoCuentasContables,
    EntradasContables,
    LogsWebServices,
    PassAuthorization,
    Roles,
    TiposCuenta,
    TiposMoneda,
    WebServices,
  } = Models;

  /* =============================================== */
  /* ASOCIACIONES DE LOS NUEVOS MODELOS CONTABLES */
  /* =============================================== */

  /* Relaciones entre Estados y Auxiliares */
  Auxiliares.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Auxiliares, { foreignKey: "estado_Id" });

  /* Relaciones entre Estados y TiposCuenta */
  TiposCuenta.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(TiposCuenta, { foreignKey: "estado_Id" });

  /* Relaciones entre Estados y TiposMoneda */
  TiposMoneda.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(TiposMoneda, { foreignKey: "estado_Id" });

  /* Relaciones entre TiposCuenta y CatalogoCuentasContables */
  CatalogoCuentasContables.belongsTo(TiposCuenta, { foreignKey: "tipoCuenta_Id" });
  TiposCuenta.hasMany(CatalogoCuentasContables, { foreignKey: "tipoCuenta_Id" });

  /* Relaciones entre Estados y CatalogoCuentasContables */
  CatalogoCuentasContables.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(CatalogoCuentasContables, { foreignKey: "estado_Id" });

  /* Relación jerárquica en CatalogoCuentasContables (cuenta mayor - subcuentas) */
  CatalogoCuentasContables.belongsTo(CatalogoCuentasContables, { 
    foreignKey: "cuentaMayor_Id", 
    as: "CuentaMayor" 
  });
  CatalogoCuentasContables.hasMany(CatalogoCuentasContables, { 
    foreignKey: "cuentaMayor_Id", 
    as: "SubCuentas" 
  });

  /* Relaciones entre EntradasContables y Auxiliares */
  EntradasContables.belongsTo(Auxiliares, { foreignKey: "auxiliar_Id" });
  Auxiliares.hasMany(EntradasContables, { foreignKey: "auxiliar_Id" });

  /* Relaciones entre EntradasContables y CatalogoCuentasContables */
  EntradasContables.belongsTo(CatalogoCuentasContables, { foreignKey: "cuenta_Id" });
  CatalogoCuentasContables.hasMany(EntradasContables, { foreignKey: "cuenta_Id" });

  /* Relaciones entre EntradasContables y Estados */
  EntradasContables.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(EntradasContables, { foreignKey: "estado_Id" });

  /* Relaciones entre LogsWebServices y WebServices */
  LogsWebServices.belongsTo(WebServices, { foreignKey: "webService_Id" });
  WebServices.hasMany(LogsWebServices, { foreignKey: "webService_Id" });

  /* Relaciones entre LogsWebServices y Users */
  LogsWebServices.belongsTo(Users, { foreignKey: "usuario_Id" });
  Users.hasMany(LogsWebServices, { foreignKey: "usuario_Id" });

  /* Relaciones entre PassAuthorization y Users */
  PassAuthorization.belongsTo(Users, { foreignKey: "usuario_Id" });
  Users.hasMany(PassAuthorization, { foreignKey: "usuario_Id" });

  /* Relaciones entre PassAuthorization y Estados */
  PassAuthorization.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(PassAuthorization, { foreignKey: "estado_Id" });
  
   /* Relaciones entre Roles y Estados */
  Roles.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Roles, { foreignKey: "estado_Id" });

  /* Relaciones entre Roles y Users */
  Users.belongsTo(Roles, { foreignKey: "rol_Id" });
  Roles.hasMany(Users, { foreignKey: "rol_Id" });

  /* Relaciones entre Users y Estados */
  Users.belongsTo(Estados, { foreignKey: "estado_Id" });
  Estados.hasMany(Users, { foreignKey: "estado_Id" });
};