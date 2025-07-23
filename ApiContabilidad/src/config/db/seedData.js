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


     // SEED COMPLETO PARA WEB SERVICES - ACTUALIZADO CON TODAS LAS RUTAS
    let webServicesData = [
        // === RUTAS DE USUARIOS (SOLO LECTURA) ===
        { id: 1, nombre: 'GET_CATALOGO_CUENTAS_USER', descripcion: 'Consulta catálogo de cuentas - Usuario' },
        { id: 2, nombre: 'GET_AUXILIARES_USER', descripcion: 'Consulta auxiliares - Usuario' },
        { id: 3, nombre: 'GET_ENTRADAS_CONTABLES_USER', descripcion: 'Consulta entradas contables - Usuario' },
        
        // === GESTIÓN DE USUARIOS ===
        { id: 4, nombre: 'GET_USERS_ADMIN', descripcion: 'Consultar usuarios - Admin' },
        { id: 5, nombre: 'POST_USERS_ADMIN', descripcion: 'Crear usuario - Admin' },
        
        // === GESTIÓN DE WEB SERVICES ===
        { id: 6, nombre: 'GET_WEBSERVICES_ADMIN', descripcion: 'Consultar web services - Admin' },
        { id: 7, nombre: 'POST_WEBSERVICES_ADMIN', descripcion: 'Crear web service - Admin' },
        
        // === CATÁLOGO DE CUENTAS CONTABLES - ADMIN ===
        { id: 8, nombre: 'GET_CATALOGO_CUENTAS_ADMIN', descripcion: 'Consultar catálogo de cuentas - Admin' },
        { id: 9, nombre: 'POST_CATALOGO_CUENTAS_ADMIN', descripcion: 'Crear cuenta contable - Admin' },
        { id: 10, nombre: 'PATCH_CATALOGO_CUENTAS_ADMIN', descripcion: 'Actualizar cuenta contable - Admin' },
        { id: 11, nombre: 'DELETE_CATALOGO_CUENTAS_ADMIN', descripcion: 'Eliminar cuenta contable - Admin' },
        
        // === ENTRADAS CONTABLES - ADMIN ===
        { id: 12, nombre: 'GET_ENTRADAS_CONTABLES_ADMIN', descripcion: 'Consultar entradas contables - Admin' },
        { id: 13, nombre: 'POST_ENTRADAS_CONTABLES_ADMIN', descripcion: 'Crear entrada contable - Admin' },
        
        // === TIPOS DE CUENTA ===
        { id: 14, nombre: 'GET_TIPOS_CUENTA_ADMIN', descripcion: 'Consultar tipos de cuenta - Admin' },
        { id: 15, nombre: 'POST_TIPOS_CUENTA_ADMIN', descripcion: 'Crear tipo de cuenta - Admin' },
        { id: 16, nombre: 'PATCH_TIPOS_CUENTA_ADMIN', descripcion: 'Actualizar tipo de cuenta - Admin' },
        { id: 17, nombre: 'DELETE_TIPOS_CUENTA_ADMIN', descripcion: 'Eliminar tipo de cuenta - Admin' },
        
        // === TIPOS DE MONEDA ===
        { id: 18, nombre: 'GET_TIPOS_MONEDA_ADMIN', descripcion: 'Consultar tipos de moneda - Admin' },
        { id: 19, nombre: 'POST_TIPOS_MONEDA_ADMIN', descripcion: 'Crear tipo de moneda - Admin' },
        { id: 20, nombre: 'PATCH_TIPOS_MONEDA_ADMIN', descripcion: 'Actualizar tipo de moneda - Admin' },
        { id: 21, nombre: 'DELETE_TIPOS_MONEDA_ADMIN', descripcion: 'Eliminar tipo de moneda - Admin' },
        
        // === AUXILIARES ===
        { id: 22, nombre: 'GET_AUXILIARES_ADMIN', descripcion: 'Consultar auxiliares - Admin' },
        { id: 23, nombre: 'POST_AUXILIARES_ADMIN', descripcion: 'Crear auxiliar - Admin' },
        { id: 24, nombre: 'PATCH_AUXILIARES_ADMIN', descripcion: 'Actualizar auxiliar - Admin' },
        { id: 25, nombre: 'DELETE_AUXILIARES_ADMIN', descripcion: 'Eliminar auxiliar - Admin' },
        
        // === LOGS WEB SERVICES ===
        { id: 26, nombre: 'GET_LOGS_WEBSERVICES_ADMIN', descripcion: 'Consultar logs de web services - Admin' },
        
        // === RUTAS ADICIONALES ESPECÍFICAS POR ID ===
        { id: 27, nombre: 'GET_CATALOGO_CUENTAS_BY_ID_ADMIN', descripcion: 'Consultar cuenta contable por ID - Admin' },
        { id: 28, nombre: 'GET_TIPOS_CUENTA_BY_ID_ADMIN', descripcion: 'Consultar tipo de cuenta por ID - Admin' },
        { id: 29, nombre: 'GET_TIPOS_MONEDA_BY_ID_ADMIN', descripcion: 'Consultar tipo de moneda por ID - Admin' },
        { id: 30, nombre: 'GET_AUXILIARES_BY_ID_ADMIN', descripcion: 'Consultar auxiliar por ID - Admin' },
        { id: 31, nombre: 'GET_USERS_BY_ID_ADMIN', descripcion: 'Consultar usuario por ID - Admin' },
        { id: 32, nombre: 'GET_ENTRADAS_CONTABLES_BY_ID_ADMIN', descripcion: 'Consultar entrada contable por ID - Admin' },
        
        // === RUTAS ESPECIALES DE ENTRADAS CONTABLES ===
        { id: 33, nombre: 'GET_ENTRADAS_BALANCES_ADMIN', descripcion: 'Consultar balances de cuentas - Admin' },
        { id: 34, nombre: 'GET_ENTRADAS_PERIODO_ADMIN', descripcion: 'Consultar entradas por período - Admin' },
        
        // === RUTAS ESPECIALES DE CATÁLOGO ===
        { id: 35, nombre: 'GET_CATALOGO_JERARQUIA_ADMIN', descripcion: 'Consultar jerarquía de cuentas - Admin' },
        { id: 36, nombre: 'GET_CATALOGO_TRANSACCIONES_ADMIN', descripcion: 'Consultar cuentas que permiten transacciones - Admin' },
        
        // === RUTAS ESPECIALES DE LOGS ===
        { id: 37, nombre: 'GET_LOGS_STATS_ADMIN', descripcion: 'Consultar estadísticas de logs - Admin' },
        { id: 38, nombre: 'GET_LOGS_BY_USER_ADMIN', descripcion: 'Consultar logs por usuario - Admin' },
        { id: 39, nombre: 'GET_LOGS_BY_SERVICE_ADMIN', descripcion: 'Consultar logs por servicio - Admin' },
        { id: 40, nombre: 'GET_LOGS_PERIODO_ADMIN', descripcion: 'Consultar logs por período - Admin' },
        
        // === OPERACIONES ADICIONALES ===
        { id: 41, nombre: 'PATCH_ENTRADAS_CONTABLES_ADMIN', descripcion: 'Actualizar entrada contable - Admin' },
        { id: 42, nombre: 'DELETE_ENTRADAS_CONTABLES_ADMIN', descripcion: 'Eliminar entrada contable - Admin' },
        { id: 43, nombre: 'PATCH_USERS_ADMIN', descripcion: 'Actualizar usuario - Admin' },
        { id: 44, nombre: 'DELETE_USERS_ADMIN', descripcion: 'Eliminar usuario - Admin' },
        { id: 45, nombre: 'GET_USERS_ROLES_ADMIN', descripcion: 'Consultar roles disponibles - Admin' },
        
        // === WEB SERVICES MANAGEMENT ===
        { id: 46, nombre: 'GET_WEBSERVICES_BY_ID_ADMIN', descripcion: 'Consultar web service por ID - Admin' },
        { id: 47, nombre: 'PATCH_WEBSERVICES_ADMIN', descripcion: 'Actualizar web service - Admin' },
        { id: 48, nombre: 'DELETE_WEBSERVICES_ADMIN', descripcion: 'Eliminar web service - Admin' },
        
        // === LOGS MANAGEMENT ===
        { id: 49, nombre: 'GET_LOGS_BY_ID_ADMIN', descripcion: 'Consultar log por ID - Admin' },
        { id: 50, nombre: 'DELETE_LOGS_CLEANUP_ADMIN', descripcion: 'Limpiar logs antiguos - Admin' },
        { id: 51, nombre: 'DELETE_LOGS_BY_ID_ADMIN', descripcion: 'Eliminar log específico - Admin' },
    ];

    // Datos de autorización de contraseña (123456)
    let passAuthorizationData = [
        { id: 1, usuario_Id: 1, hash: '3ba4ecb6657ee75f2fe6.58808fd15dbad40491b26eae51c9eeca', newPass: false, estado_Id: 1 },
        { id: 2, usuario_Id: 2, hash: '3ba4ecb6657ee75f2fe6.58808fd15dbad40491b26eae51c9eeca', newPass: false, estado_Id: 1 },
    ];

    let apiKeysData = [
        {
            id: 1,
            nombre: 'Sistema Facturación Principal',
            keyHash: '6c7c3a1e8b5c77a9b8d3c5f4e2a9b6c8d1e5f7a4b9c2d6e8f3a7b1c4d9e5f2a8b3c6d7e1f4a9b2c5d8e3f6a1b4c7d2e5f8a3b6c9d4e7f1a5b8c2d6e9f3a7b1c4d8e5f2a9b3c6d7e4f1a8b5c2d9e6f3a7b4c1d8e5f2a9b6c3d7e4f1a8b5c9d2e6f3a7b4c1d8e5f9a2b6c3d7e4f1a8b5c2d9e6f3a7b4c1d8e5f2a9b6c3d7e4f1a8', // Este es un hash de ejemplo - se generará automáticamente
            keyPrefix: 'ak_live_...',
            descripcion: 'API Key para el sistema de facturación principal',
            sistemaOrigen: 'FacturacionApp v2.1',
            permisos: JSON.stringify([
                'GET:/api/public/catalogo-cuentas',
                'GET:/api/public/entradas-contables',
                'POST:/api/public/entradas-contables',
                'GET:/api/public/balances'
            ]),
            ipPermitidas: JSON.stringify(['192.168.1.100', '10.0.0.50']),
            limitePorMinuto: 120,
            fechaVencimiento: null,
            usosCount: 0,
            estado_Id: 1,
            creadoPor_Id: 1
        },
        {
            id: 2,
            nombre: 'Sistema de Reportes',
            keyHash: 'a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6a7b8c9d1e2f3a4b5c6d7e8f9a1b2c3d4e5f6', // Hash de ejemplo
            keyPrefix: 'ak_live_...',
            descripcion: 'API Key para sistema de reportes (solo lectura)',
            sistemaOrigen: 'ReportingSystem',
            permisos: JSON.stringify([
                'GET:/api/public/*'
            ]),
            ipPermitidas: null, // Sin restricción de IP
            limitePorMinuto: 60,
            fechaVencimiento: null,
            usosCount: 0,
            estado_Id: 1,
            creadoPor_Id: 1
        }
    ];

    await insertDb(Md.ApiKeys, 'apiKeysData', apiKeysData);
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
