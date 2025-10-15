const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}

module.exports = { auth, requireRole };


