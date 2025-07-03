module.exports = InitializePrimalData = async ({ Md }) => {

    let estadoData = [
        { id: 1, descripcion: 'Encendido' },
        { id: 2, descripcion: 'apagado' },
    ];
   
    let customersData = [
        { id: 1, nombre: 'Leidy Martinez', cedula: '001-000000-1', NoTarjetaCR: '4005519200000004', limiteCredito:5000.00, tipoPersona:'Física', estado_Id: 1 },
    ];

    let employeeData = [
        { id: 1, nombre: 'Leidy Martinez', cedula: '001-000000-1', TandaLabor: 'Matutina', porcientoComision: 25.00, fechaIngreso: new Date(), estado_Id: 1 },
    ];

    let brandsData = [
        { id: 1, descripcion: 'Honda', estado_Id: 1 },
    ];

    let modelsData = [
        { id: 1, marca_Id: 1, descripcion:'Civic', estado_Id: 1 },
    ];

    
    let typeVehiclesData = [
        { id: 1, descripcion:'Automovil', estado_Id: 1 },
    ];

    let fuelTypeData = [
        { id: 1, descripcion:'Gasolina', estado_Id: 1 },
    ];

    let vehiclesData = [
        { id: 1, descripcion: 'Color rojo 5 puertas' , NoChasis:'1HGCM82633A123456', NoMotor:'X1234MOT56789', NoPlaca: 'ABC123', tipoVehiculo_Id: 1, marca_Id: 1, modelo_Id: 1, tipoCombustible_Id: 1, estado_Id: 1 },
    ];


    let rolesData = [
        { id: 1, name: 'user' , descripcion:'Normal User' , estado_Id: 1 },
        { id: 2, name: 'admin' , descripcion:'Admin User' , estado_Id: 1 },
    ];


    await insertDb(Md.Estados, 'estadoData', estadoData);
    await insertDb(Md.Roles, 'rolesData', rolesData);
    await insertDb(Md.Clientes, 'customersData', customersData);
    await insertDb(Md.Empleados, 'employeeData', employeeData);
    await insertDb(Md.Marcas, 'brandsData', brandsData);
    await insertDb(Md.Modelos, 'modelsData', modelsData);
    await insertDb(Md.TiposVehiculos, 'typeVehiclesData', typeVehiclesData);
    await insertDb(Md.TiposCombustibles, 'fuelTypeData', fuelTypeData);
    await insertDb(Md.Vehiculos, 'vehiclesData', vehiclesData);
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
