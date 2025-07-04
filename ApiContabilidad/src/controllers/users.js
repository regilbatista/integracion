const router = require('express').Router();
const {verifyNull} = require('../utils/utils')
const {createHash} = require('../utils/auth')
const { Users, PassAuthorization, Roles } = require('../config/db/database');

const DEFAULT_EXTERNAL_PERMS = ['user'];

async function fetchPermissions(codes) {
    return await Roles.findAll({ where: { nombreRol: codes } });
}

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   usuario:
 *                     type: string
 *                   rol_Id:
 *                     type: string
 *                   estado_Id:
 *                     type: integer
 */
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

                item.rol_Id = rol.nombreRol; // CORREGIDO: usar nombreRol
            })
        );

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/users/roles:
 *   get:
 *     summary: Obtiene todos los roles disponibles
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 */
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
        
        // CORREGIDO: data es un objeto, no un array
        let rol = await Roles.findOne({ where: { id: data.rol_Id } });
        rol = JSON.parse(JSON.stringify(rol));
        
        const result = JSON.parse(JSON.stringify(data));
        result.rol_Id = rol.nombreRol;

        return res.status(200).json([result]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }
});

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - password
 *               - rol_Id
 *               - estado_Id
 *             properties:
 *               usuario:
 *                 type: string
 *                 maxLength: 50
 *               password:
 *                 type: string
 *               rol_Id:
 *                 type: string
 *               estado_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 */
router.post('/', async (req, res) => {
    const { usuario, rol_Id, estado_Id } = req.body; // CORREGIDO: usar 'usuario'
    let { password } = req.body;
  
    const isnull = verifyNull({ usuario, password, estado_Id }); // CORREGIDO
    if (isnull.sts) return res.status(400).json([{ error: isnull.key + ' is missing' }]);
  
    // Check if the user with the same email exists
    if (await Users.findOne({ where: { usuario } })) { // CORREGIDO
      return res.status(400).json([{ error: 'User with same email already exists' }]);
    }
    try {
        let fetchedPermissions = await fetchPermissions(rol_Id ?? DEFAULT_EXTERNAL_PERMS);
        fetchedPermissions = JSON.parse(JSON.stringify(fetchedPermissions));
        const rol = fetchedPermissions[0].id
        if (!fetchedPermissions || !rol) {
          return res.status(400).json([{ error: 'Permissions not found or invalid' }]);
        }
        
        const users = await Users.create({ usuario, rol_Id: rol, estado_Id }); // CORREGIDO
        if (!users) return res.status(400).json([{ error: 'User not created' }]);
      
        const passwordHash = createHash(password);
        const auth = await PassAuthorization.create({ // CORREGIDO: usar PassAuthorization
          usuario_Id: users.id, // CORREGIDO: usar usuario_Id
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
  
router.patch('/:id', async (req, res) => {
    try {
        await Users.update(req.body, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

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