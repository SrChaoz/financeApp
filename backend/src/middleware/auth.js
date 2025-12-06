const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: { message: 'No token provided' } });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: { message: 'Invalid token' } });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: { message: 'Token expired' } });
        }
        return res.status(500).json({ error: { message: 'Authentication error' } });
    }
};

module.exports = authMiddleware;
