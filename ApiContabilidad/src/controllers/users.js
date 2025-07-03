const router = require('express').Router();
const {verifyNull} = require('../utils/utils')
const {createHash} = require('../utils/auth')
const { Users, Authorization,Roles } = require('../config/db/database');

const DEFAULT_EXTERNAL_PERMS = ['user'];

async function fetchPermissions(codes) {
    return await Roles.findAll({ where: { name: codes } });
}

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let users = await Users.findAll({
             //where: {} 
            });
            users = JSON.parse(JSON.stringify(users));

        await Promise.all(
            users.map(async (item) => {
                let rol = await Roles.findOne({ where: { id: item.rol_Id } });
                rol = JSON.parse(JSON.stringify(rol));

                item.rol_Id = rol.name;
            })
        );

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/roles', async (req, res) => {
    try {
        let roles = await Roles.findAll({
             where: {estado_Id: 1} 
            });
            roles = JSON.parse(JSON.stringify(roles));

        return res.status(200).json(roles);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Users.findOne({
            where: { id: req.params.id }
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        await Promise.all(
            data.map(async (item) => {
                let rol = await Roles.findOne({ where: { id: item.rol_Id } });
                rol = JSON.parse(JSON.stringify(rol));

                item.rol_Id = rol.name;
            })
        );

        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }

});

router.post('/', async (req, res) => {
    const { user, rol_Id, estado_Id } = req.body;
    let { password } = req.body;
  
    const isnull = verifyNull({ user, password, estado_Id });
    if (isnull.sts) return res.status(400).json([{ error: isnull.key + ' is missing' }]);
  
    // Check if the user with the same email exists
    if (await Users.findOne({ where: { user } })) {
      return res.status(400).json([{ error: 'User with same email already exists' }]);
    }
    try {
        let fetchedPermissions = await fetchPermissions(rol_Id ?? DEFAULT_EXTERNAL_PERMS);
        fetchedPermissions = JSON.parse(JSON.stringify(fetchedPermissions));
        const rol = fetchedPermissions[0].id
        if (!fetchedPermissions || !rol) {
          return res.status(400).json([{ error: 'Permissions not found or invalid' }]);
        }
        
        const users = await Users.create({ user, rol_Id: rol, estado_Id });
        if (!users) return res.status(400).json([{ error: 'User not created' }]);
      
        const passwordHash = createHash(password);
        const auth = await Authorization.create({
          user_Id: users.id,
          hash: passwordHash,
          newPass: req.body?.newPass || null
        });
      
        if (!auth) {
          await users.destroy();
          return res.status(400).json([{ error: 'Authorization not created' }]);
        }
      
        return res.status(200).json([{ id: users.id }]);
      } catch (error) {
        console.error(error);
        return res.status(400).json([{ error: error.toString() }]);
      }
  });
  
/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Users.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const users = await Users.findOne({ where: { id: req.params.id } });

        if (!users) return res.status(200).json([{ error: 'id not found' }]);
    
        users.estado_Id = users.estado_Id === 1 ? 2 : 1;
        await users.save();
    
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        console.log(error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
