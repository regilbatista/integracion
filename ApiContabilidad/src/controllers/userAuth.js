const router = require('express').Router();
const { Users, Roles , Authorization } = require('../config/db/database');
const { Op } = require('sequelize');
const { verifyHash, createToken } = require('../utils/auth');
var jwt = require('jsonwebtoken');
const tk = require('../config/constants').tk;

// These routes are for local user authentication
const REDIRECT_URL_OUT = tk.redirectURLout;

router.post('/', async (req, res) => {
    const { user, password } = req.body;

    const users = await Users.findOne({
        where: { user: user, 
                estado_Id: 1 
        },
        attributes: { exclude: ['estado_Id', 'createdAt', 'updatedAt'] },
        include: [
            {
                model: Roles,
                attributes: ['id', 'name', 'estado_Id'],
            },
            {
                model: Authorization,
                attributes: ['hash'],
            }
        ],
    });
    if (!users) return res.status(404).json({ data: 'User not found' });
    console.log(users, 'user');

    const isValidPass = verifyHash(password, users.PassAuthorizations[0].hash);
    if (!isValidPass) return res.status(404).json({ data: 'user and password do not match' });
    const userPermissions = users.Role.name
 
    const uniquePermissions = userPermissions;
    const userData = {
        id: users.id,
        user: users.user,
        permissions: uniquePermissions,
    };

    const token = createToken(userData);
    const expires = new Date(Date.now() + 3 * 3600000); // 3 hours
    return res
        .cookie('token', token, { expires })
        .status(200)
        .json({ data: { userData: userData, msg: 'Login Successful', token } });
});

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
