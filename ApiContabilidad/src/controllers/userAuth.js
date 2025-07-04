const router = require('express').Router();
const { Users, Roles , PassAuthorization } = require('../config/db/database');
const { Op } = require('sequelize');
const { verifyHash, createToken } = require('../utils/auth');
var jwt = require('jsonwebtoken');
const tk = require('../config/constants').tk;

// These routes are for local user authentication
const REDIRECT_URL_OUT = tk.redirectURLout;

/**
 * @swagger
 * /api/:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=jwt_token_here; Path=/; HttpOnly
 *       404:
 *         description: Usuario no encontrado o credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: "User not found"
 */
router.post('/', async (req, res) => {
    const { user, password } = req.body;

    const users = await Users.findOne({
        where: { usuario: user, 
                estado_Id: 1 
        },
        attributes: { exclude: ['estado_Id', 'createdAt', 'updatedAt'] },
        include: [
            {
                model: Roles,
                attributes: ['id', 'nombreRol'],
            },
            {
                model: PassAuthorization,
                attributes: ['hash'],
            }
        ],
    });
    if (!users) return res.status(404).json({ data: 'User not found' });
    console.log(users, 'user');

    const isValidPass = verifyHash(password, users.PassAuthorizations[0].hash);
    if (!isValidPass) return res.status(404).json({ data: 'user and password do not match' });
    const userPermissions = users.Role.nombreRol
 
    const uniquePermissions = userPermissions;
    const userData = {
        id: users.id,
        user: users.usuario,
        permissions: uniquePermissions,
    };

    const token = createToken(userData);
    const expires = new Date(Date.now() + 3 * 3600000); // 3 hours
    return res
        .cookie('token', token, { expires })
        .status(200)
        .json({ data: { userData: userData, msg: 'Login Successful', token } });
});

/**
 * @swagger
 * /api/logout:
 *   get:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       302:
 *         description: Redirección después del logout
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/login"
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *       500:
 *         description: Error durante el logout
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error during logout"
 */
router.get('/logout', async (req, res) => {
    try {
        const token = req.cookies.token;

        res.clearCookie('token');
        
        return res.redirect(REDIRECT_URL_OUT); // Returning here to prevent further execution
        
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send('Error during logout'); // Sending error response if an error occurs
    }
});

module.exports = router;