var jwt = require('jsonwebtoken');
const secret = require('../config/constants').secret;
const secretPhrase = secret.phrase + 'LL' + secret.phrase + '0';


const verifyToken = async (req, res, next) => {
    if (!req.cookies.token) {
        return res.status(401).json({ error: 'token_expired' });
    }

    const token = req.cookies.token;

    try {
        // Verify the JWT token
        const payload = jwt.verify(token, secretPhrase, { algorithms: ['HS256'] });
        res.locals.user = payload;

        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ error: 'token_expired' });
    }
};

const verifyAuthorization = (requiredPermissions) => (req, res, next) => {
    if (!req.cookies.token || req.cookies.token == undefined) return res.status(401).json({ error: 'token_expired' });

    const token = req.cookies.token;

    try {
        const payload = jwt.verify(token, secretPhrase, { algorithms: ['HS256'] });
        if (requiredPermissions.some((permission) => payload.permissions.includes(permission)) || payload.permissions.includes('sys-adm')) {
            next();
        } else {
            return res.status(403).json({ error: 'unauthorized_client' });
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({ error: 'unauthorized_client' });
    }
};

module.exports = {
    verifyToken,
    verifyAuthorization,
};
