
module.exports = InitializeModels = ({ Sequelize, sequelize }) => {
    // Require models
    const AuxiliaresModel = require('../../models/auxiliares');
    const CatalogoCuentasContablesModel = require('../../models/catalogoCuentasContables');
    const EntradasContablesModel = require('../../models/entradasContables');
    const LogsWebServicesModel = require('../../models/logsWebServices'); 
    const PassAuthorizationModel = require('../../models/passAuthorization');
    const RolesModel = require('../../models/roles');
    const TiposCuentaModel = require('../../models/tiposCuenta');  
    const TiposMonedaModel = require('../../models/tiposMoneda');
    const UsersModel = require('../../models/users');
    const WebServicesModel = require('../../models/webServices');
    const EstadosModel = require('../../models/estados');



    // Initialization instance of models
    const Auxiliares = AuxiliaresModel(sequelize, Sequelize.DataTypes);
    const CatalogoCuentasContables = CatalogoCuentasContablesModel(sequelize, Sequelize.DataTypes);
    const EntradasContables = EntradasContablesModel(sequelize, Sequelize.DataTypes);
    const LogsWebServices = LogsWebServicesModel(sequelize, Sequelize.DataTypes);
    const PassAuthorization = PassAuthorizationModel(sequelize, Sequelize.DataTypes);
    const Roles = RolesModel(sequelize, Sequelize.DataTypes);
    const TiposCuenta = TiposCuentaModel(sequelize, Sequelize.DataTypes);
    const TiposMoneda = TiposMonedaModel(sequelize, Sequelize.DataTypes);
    const Users = UsersModel(sequelize, Sequelize.DataTypes);
    const WebServices = WebServicesModel(sequelize, Sequelize.DataTypes);
    const Estados = EstadosModel(sequelize, Sequelize.DataTypes);
    return {
        Auxiliares,
        CatalogoCuentasContables,
        EntradasContables,
        LogsWebServices,
        PassAuthorization,
        Roles,
        TiposCuenta,
        TiposMoneda,
        Users, 
        WebServices,
        Estados
    };
};
