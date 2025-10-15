const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sign(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'Email already in use' });
        const user = await User.create({ name, email, password });
        const token = sign(user);
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        // Handle duplicate key and validation errors explicitly to aid the client
        if (e && e.code === 11000) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        if (e && e.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid user data' });
        }
        console.error('Registration error:', e);
        res.status(500).json({ message: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
        const token = sign(user);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        res.status(500).json({ message: 'Login failed' });
    }
};

exports.me = async (req, res) => {
    res.json({ user: req.user });
};


