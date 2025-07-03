var jwt = require('jsonwebtoken');
const secret = require('../config/constants').secret;
const crypto = require('crypto');

const expiresIn = '3h'; // time tokens are valid for
const secretPhrase = secret.phrase + 'LL' + secret.phrase + '0';

const createToken = (user) => {
    const payload = {
        id: user.id,
        user: user.user,
        permissions: user.permissions,
    };
    return jwt.sign(payload, secretPhrase, { algorithm: 'HS256', expiresIn });
};

const cc = { interactions: 286, long: 10, algorithm: 'sha512' };

const createHash = (phrase) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(phrase, salt, cc.interactions, cc.long, cc.algorithm);

    return `${hash.toString('hex')}.${salt}`;
};

const verifyHash = (phrase, compare) => {
    const compareArray = compare.split('.'),
        pass = compareArray[0],
        key = compareArray[1];
    const hash = crypto.pbkdf2Sync(phrase, key, cc.interactions, cc.long, cc.algorithm);

    return pass == hash.toString('hex');
};

const verifyLocalToken = (req, res, next) => {
    if (!req.headers.hasOwnProperty('genxc-token')) return res.status(401).json({ error: 'missing auth token' });

    try {
        const token = req.headers['genxc-token'];
        payload = jwt.verify(token, secretPhrase, { algorithms: ['HS256'] });

        req.id = payload.id;
        req.companyId = payload.companyId;
        req.email = payload.email;
        req.name = payload.name;
        req.permissions = payload.permissions;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'invalid auth token' });
    }
};


module.exports = {
    createToken,
    createHash,
    verifyHash,
    verifyLocalToken,
};
