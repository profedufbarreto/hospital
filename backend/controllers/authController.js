const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

// Hash de senha (SHA-256)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const user = users[0];
    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuário desativado' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Logout
const logout = (req, res) => {
  // Token é descartado no cliente
  res.json({ success: true, message: 'Logout realizado' });
};

module.exports = { login, logout };
