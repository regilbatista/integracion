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

                item.rol_Id = rol.nombreRol;
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

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await Users.findOne({
            where: { id: req.params.id }
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        
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
    const { usuario, rol_Id, estado_Id } = req.body;
    let { password } = req.body;
  
    const isnull = verifyNull({ usuario, password, estado_Id });
    if (isnull.sts) return res.status(400).json([{ error: isnull.key + ' is missing' }]);
  
    // Check if the user with the same email exists
    if (await Users.findOne({ where: { usuario } })) {
      return res.status(400).json([{ error: 'User with same email already exists' }]);
    }
    try {
        let fetchedPermissions = await fetchPermissions(rol_Id ?? DEFAULT_EXTERNAL_PERMS);
        fetchedPermissions = JSON.parse(JSON.stringify(fetchedPermissions));
        const rol = fetchedPermissions[0].id
        if (!fetchedPermissions || !rol) {
          return res.status(400).json([{ error: 'Permissions not found or invalid' }]);
        }
        
        const users = await Users.create({ usuario, rol_Id: rol, estado_Id });
        if (!users) return res.status(400).json([{ error: 'User not created' }]);
      
        const passwordHash = createHash(password);
        const auth = await PassAuthorization.create({
          usuario_Id: users.id,
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

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Actualiza un usuario
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 maxLength: 50
 *                 description: Nuevo nombre de usuario
 *               rol_Id:
 *                 type: integer
 *                 description: Nuevo rol (ID numérico)
 *               estado_Id:
 *                 type: integer
 *                 description: Nuevo estado
 *               password:
 *                 type: string
 *                 description: Nueva contraseña (opcional)
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Asegurar que rol_Id sea un número entero
        if (updateData.rol_Id) {
            updateData.rol_Id = parseInt(updateData.rol_Id);
            
            // Validar que el rol existe
            const roleExists = await Roles.findOne({ where: { id: updateData.rol_Id } });
            if (!roleExists) {
                return res.status(400).json([{ error: 'Role not found' }]);
            }
        }
        
        // Si se incluye password, actualizar también la tabla de autorización
        if (updateData.password) {
            const passwordHash = createHash(updateData.password);
            await PassAuthorization.update(
                { hash: passwordHash },
                { where: { usuario_Id: req.params.id } }
            );
            // Remover password de updateData ya que no se guarda en la tabla Users
            delete updateData.password;
        }
        
        await Users.update(updateData, { where: { id: req.params.id } });
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Realiza borrado lógico de un usuario (cambia estado activo/inactivo)
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estado del usuario cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res) => {
    try {
        const users = await Users.findOne({ where: { id: req.params.id } });

        if (!users) return res.status(200).json([{ error: 'id not found' }]);
    
        // Borrado lógico: cambiar estado entre activo (1) e inactivo (2)
        users.estado_Id = users.estado_Id === 1 ? 2 : 1;
        await users.save();
    
        const action = users.estado_Id === 1 ? 'activated' : 'deactivated';
        res.status(200).json([{ 
            msg: 'ok', 
            action: action,
            newState: users.estado_Id 
        }]);
    } catch (error) {
        console.log(error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;