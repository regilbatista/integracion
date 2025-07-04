module.exports = InitializePrimalData = async ({ Md }) => {

    let estadoData = [
        { id: 1, descripcion: 'Encendido' },
        { id: 2, descripcion: 'apagado' },
    ];

    let rolesData = [
        { id: 1, nombreRol: 'user' , estado_Id: 1 },
        { id: 2, nombreRol: 'admin' , estado_Id: 1 },
    ];

     let usersData = [
        { id: 1, usuario: 'admin', rol_Id: 2, estado_Id: 1 },
        { id: 2, usuario: 'user', rol_Id: 1, estado_Id: 1 },
    ];

    let tiposCuentaData = [
        { id: 1, descripcion: 'Activo', origen: 'DB', estado_Id: 1 },
        { id: 2, descripcion: 'Pasivo', origen: 'CR', estado_Id: 1 },
        { id: 3, descripcion: 'Patrimonio', origen: 'CR', estado_Id: 1 },
        { id: 4, descripcion: 'Ingresos', origen: 'CR', estado_Id: 1 },
        { id: 5, descripcion: 'Gastos', origen: 'DB', estado_Id: 1 },
    ];

    let tiposMonedaData = [
        { id: 1, descripcion: 'Peso Dominicano', ultimaTasaCambiaria: 1.0000, estado_Id: 1 },
        { id: 2, descripcion: 'Dólar Estadounidense', ultimaTasaCambiaria: 58.50, estado_Id: 1 },
        { id: 3, descripcion: 'Euro', ultimaTasaCambiaria: 63.75, estado_Id: 1 },
    ];

    let catalogoCuentasData = [
        // Cuentas Principales (Nivel 1)
        { id: 1, descripcion: 'ACTIVOS', tipoCuenta_Id: 1, permiteTransacciones: false, nivel: 1, cuentaMayor_Id: null, balance: 0.00, estado_Id: 1 },
        { id: 2, descripcion: 'PASIVOS', tipoCuenta_Id: 2, permiteTransacciones: false, nivel: 1, cuentaMayor_Id: null, balance: 0.00, estado_Id: 1 },
        { id: 3, descripcion: 'PATRIMONIO', tipoCuenta_Id: 3, permiteTransacciones: false, nivel: 1, cuentaMayor_Id: null, balance: 0.00, estado_Id: 1 },
        { id: 4, descripcion: 'INGRESOS', tipoCuenta_Id: 4, permiteTransacciones: false, nivel: 1, cuentaMayor_Id: null, balance: 0.00, estado_Id: 1 },
        { id: 5, descripcion: 'GASTOS', tipoCuenta_Id: 5, permiteTransacciones: false, nivel: 1, cuentaMayor_Id: null, balance: 0.00, estado_Id: 1 },

        // Subcuentas (Nivel 2)
        { id: 6, descripcion: 'ACTIVOS CORRIENTES', tipoCuenta_Id: 1, permiteTransacciones: false, nivel: 2, cuentaMayor_Id: 1, balance: 0.00, estado_Id: 1 },
        { id: 7, descripcion: 'ACTIVOS NO CORRIENTES', tipoCuenta_Id: 1, permiteTransacciones: false, nivel: 2, cuentaMayor_Id: 1, balance: 0.00, estado_Id: 1 },
        { id: 8, descripcion: 'PASIVOS CORRIENTES', tipoCuenta_Id: 2, permiteTransacciones: false, nivel: 2, cuentaMayor_Id: 2, balance: 0.00, estado_Id: 1 },
        { id: 9, descripcion: 'INGRESOS OPERACIONALES', tipoCuenta_Id: 4, permiteTransacciones: false, nivel: 2, cuentaMayor_Id: 4, balance: 0.00, estado_Id: 1 },
        { id: 10, descripcion: 'GASTOS OPERACIONALES', tipoCuenta_Id: 5, permiteTransacciones: false, nivel: 2, cuentaMayor_Id: 5, balance: 0.00, estado_Id: 1 },

        // Cuentas de Detalle (Nivel 3) - Permiten transacciones
        { id: 11, descripcion: 'EFECTIVO Y EQUIVALENTES', tipoCuenta_Id: 1, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 6, balance: 0.00, estado_Id: 1 },
        { id: 12, descripcion: 'CUENTAS POR COBRAR', tipoCuenta_Id: 1, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 6, balance: 0.00, estado_Id: 1 },
        { id: 13, descripcion: 'INVENTARIO VEHICULOS', tipoCuenta_Id: 1, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 6, balance: 0.00, estado_Id: 1 },
        { id: 14, descripcion: 'VEHICULOS PARA RENTA', tipoCuenta_Id: 1, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 7, balance: 0.00, estado_Id: 1 },
        { id: 15, descripcion: 'CUENTAS POR PAGAR', tipoCuenta_Id: 2, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 8, balance: 0.00, estado_Id: 1 },
        { id: 16, descripcion: 'INGRESOS POR RENTA', tipoCuenta_Id: 4, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 9, balance: 0.00, estado_Id: 1 },
        { id: 17, descripcion: 'GASTOS ADMINISTRATIVOS', tipoCuenta_Id: 5, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 10, balance: 0.00, estado_Id: 1 },
        { id: 18, descripcion: 'GASTOS DE MANTENIMIENTO', tipoCuenta_Id: 5, permiteTransacciones: true, nivel: 3, cuentaMayor_Id: 10, balance: 0.00, estado_Id: 1 },
    ];

    let auxiliaresData = [
        { id: 1, nombre: 'CLIENTES RENTA VEHICULOS', estado_Id: 1 },
        { id: 2, nombre: 'PROVEEDORES MANTENIMIENTO', estado_Id: 1 },
        { id: 3, nombre: 'EMPLEADOS COMISIONES', estado_Id: 1 },
        { id: 4, nombre: 'GASTOS VARIOS', estado_Id: 1 },
    ];

    let webServicesData = [
        { id: 1, nombre: 'API_CONTABILIDAD', descripcion: 'Servicio para operaciones contables' },
        { id: 2, nombre: 'API_REPORTES', descripcion: 'Servicio para generación de reportes' },
        { id: 3, nombre: 'API_FACTURACION', descripcion: 'Servicio para facturación electrónica' },
    ];

    let passAuthorizationData = [
        { id: 1, usuario_Id: 1, hash: '$2b$10$example.hash.for.admin.user.password', newPass: false, estado_Id: 1 },
        { id: 2, usuario_Id: 2, hash: '$2b$10$example.hash.for.regular.user.password', newPass: false, estado_Id: 1 },
    ];



    await insertDb(Md.Estados, 'estadoData', estadoData);
    await insertDb(Md.Roles, 'rolesData', rolesData);
    await insertDb(Md.Users, 'usersData', usersData);
    await insertDb(Md.TiposCuenta, 'tiposCuentaData', tiposCuentaData);
    await insertDb(Md.TiposMoneda, 'tiposMonedaData', tiposMonedaData);
    await insertDb(Md.CatalogoCuentasContables, 'catalogoCuentasData', catalogoCuentasData);
    await insertDb(Md.Auxiliares, 'auxiliaresData', auxiliaresData);
    await insertDb(Md.WebServices, 'webServicesData', webServicesData);
    await insertDb(Md.PassAuthorization, 'passAuthorizationData', passAuthorizationData);
    
};


async function insertDb(table, name, data) {
    try {
        const t = await table.findAndCountAll();

        if (t.count === 0) {
            await table.bulkCreate(data);
            console.log('Data inserted on ' + name);
        } else {
            //console.log('Data already exists in ' + name);
        }
    } catch (error) {
        console.log(error);
    }
}
