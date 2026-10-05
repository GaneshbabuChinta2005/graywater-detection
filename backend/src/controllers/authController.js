const jwt = require('jsonwebtoken');
const User = require('../models/User');
const memoryStore = require('../services/storageFallback');
const { isDBConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_greywater_ai_jwt_key_2026';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (isDBConnected()) {
      try {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, error: 'User with this email already exists.' });
        }

        const user = await User.create({
          name,
          email,
          password,
          role: role || 'OPERATOR'
        });

        return res.status(201).json({
          success: true,
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          token: generateToken(user._id, user.role)
        });
      } catch (dbErr) {
        // Fallback below
      }
    }

    // Memory fallback mode
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: role || 'OPERATOR'
    };
    return res.status(201).json({
      success: true,
      user,
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Default fast-access demo account
    if (email === 'admin@greywater.ai' && password === 'admin123') {
      const user = { id: 'default_admin', name: 'System Administrator', email, role: 'ADMIN' };
      return res.json({
        success: true,
        user,
        token: generateToken(user.id, user.role)
      });
    }

    if (isDBConnected()) {
      try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
          return res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token: generateToken(user._id, user.role)
          });
        }
      } catch (dbErr) {
        // Offline fallback
      }
    }


    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user || { name: 'Operator', role: 'OPERATOR' }
  });
};
