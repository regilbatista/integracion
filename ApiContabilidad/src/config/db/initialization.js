
module.exports = InitializeModels = ({ Sequalize, sequelize }) => {
    // Require models
    const EstadosModel = require('../../models/estados');
    const MarcasModel = require('../../models/marcas');
    const ModelosModel = require('../../models/modelos');
    const RolesModel = require('../../models/roles');
    const TiposCombustiblesModel = require('../../models/tipoCombustible');
    const TiposVehiculosModel = require('../../models/tipoVehiculo');
    const UsersModel = require('../../models/users');
    const PassAuthorizationModel = require('../../models/passAuthorization');
    const VehiculosModel = require('../../models/vehiculos');
    const ClientesModel = require('../../models/clientes');
    const EmpleadosModel = require('../../models/empleados');
    const InspeccionModel = require('../../models/inspeccion');
    const RentaDevolucionModel = require('../../models/rentaDevolucion');


    // Initialization instance of models
    const Estados = EstadosModel(sequelize, Sequalize);
    const Marcas = MarcasModel(sequelize, Sequalize);
    const Modelos = ModelosModel(sequelize, Sequalize);
    const Roles = RolesModel(sequelize, Sequalize);
    const TiposCombustibles = TiposCombustiblesModel(sequelize, Sequalize);
    const TiposVehiculos = TiposVehiculosModel(sequelize, Sequalize);
    const Users = UsersModel(sequelize, Sequalize);
    const Authorization = PassAuthorizationModel(sequelize, Sequalize);
    const Vehiculos = VehiculosModel(sequelize, Sequalize);
    const Clientes = ClientesModel(sequelize, Sequalize);
    const Empleados = EmpleadosModel(sequelize, Sequalize);
    const Inspeccion = InspeccionModel(sequelize, Sequalize);
    const RentaDevolucion = RentaDevolucionModel(sequelize, Sequalize);

    return {
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
        RentaDevolucion
    };
};
