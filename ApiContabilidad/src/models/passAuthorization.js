module.exports = (sequelize, type) => {
    return sequelize.define('PassAuthorization', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_Id: type.INTEGER,
        hash: type.STRING(500),
        newPass: {
            type: type.BOOLEAN,
            defaultValue: false,
        },
    });
};
