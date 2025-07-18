const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const companyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // attach the company to the request
        req.company = {
            companyId: payload.companyId,
            companyName: payload.companyName
        };

        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
};

module.exports = companyAuth;
